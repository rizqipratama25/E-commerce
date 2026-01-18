<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Jobs\ReleaseOrderPayoutsJob;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderPayout;
use App\Models\OrderShipment;
use App\Models\Product;
use App\Models\ShippingService;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Snap;
use Midtrans\Transaction;
use Xendit\Configuration;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Invoice\InvoiceApi;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();

        $statuses = (array) $request->query('status', []);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $brandIds = $request->query('brand_id');
        if (!is_array($brandIds)) {
            $brandIds = $brandIds ? [(int) $brandIds] : [];
        } else {
            $brandIds = array_map('intval', $brandIds);
        }

        $q = trim((string) $request->query('q', ''));

        $query = Order::query()
            ->with([
                'user:id,fullname',
                'shippingService:id,courier_name,service_code',
                'shipments.partner:id,fullname',
                'shipments.shippingService:id,courier_name,service_code,service_name',
                'shipments.items.product.thumbnail',
                'shipments.items.product.partner:id,fullname',
                'shipments.items.product.images:id,product_id,image',
            ])
            ->where('user_id', $user->id);

        if (!empty($statuses)) {
            $query->whereIn('status', $statuses);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('paid_at', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59',
            ]);
        }

        if (!empty($brandIds)) {
            $query->whereHas('shipments', fn($s) => $s->whereIn('partner_id', $brandIds));
        }


        if ($q !== '') {
            $productIds = Product::search($q)
                ->take(200)
                ->get()
                ->pluck('id')
                ->map(fn($x) => (int) $x)
                ->all();

            if (empty($productIds)) {
                return $this->successResponse(collect(), "Success");
            }

            $query->whereHas('shipments.items', function ($qq) use ($productIds) {
                $qq->whereIn('product_id', $productIds);
            });
        }

        $orders = $query->latest()->get();

        return $this->successResponse(OrderResource::collection($orders), "Success");
    }

    public function indexPartner(Request $request)
    {
        $partner = $request->user();

        $shipmentStatus = $request->query('status', 'process');
        $allowed = ['draft', 'process', 'shipping', 'delivered', 'completed', 'cancelled'];
        if (!in_array($shipmentStatus, $allowed, true)) $shipmentStatus = 'process';

        $orders = Order::query()
            ->with([
                'user:id,fullname',
                'shippingService:id,courier_name,service_code,service_name',

                'shipments' => function ($q) use ($partner, $shipmentStatus) {
                    $q->where('partner_id', $partner->id)
                        ->when($shipmentStatus, fn($qq) => $qq->where('status', $shipmentStatus))
                        ->with([
                            'partner:id,fullname',
                            'shippingService:id,courier_name,service_code,service_name',
                            'items.product.thumbnail',
                            'items.product.partner:id,fullname',
                            'items.product.images:id,product_id,image',
                        ]);
                },
            ])
            ->whereHas('shipments', function ($q) use ($partner, $shipmentStatus) {
                $q->where('partner_id', $partner->id)
                    ->when($shipmentStatus, fn($qq) => $qq->where('status', $shipmentStatus));
            })
            ->latest()
            ->get();

        // buang shipment kosong
        $orders->each(function ($order) {
            $order->setRelation(
                'shipments',
                $order->shipments->filter(fn($s) => $s->items && $s->items->count() > 0)->values()
            );
        });

        $orders = $orders->filter(fn($o) => $o->shipments && $o->shipments->count() > 0)->values();

        return $this->successResponse(OrderResource::collection($orders), "Success");
    }

    public function indexAdmin(Request $request)
    {
        $shipmentStatus = $request->query('status', 'shipping');
        $allowed = ['draft', 'process', 'shipping', 'delivered', 'completed', 'cancelled'];
        if (!in_array($shipmentStatus, $allowed, true)) $shipmentStatus = 'shipping';

        $orders = Order::query()
            ->with([
                'user:id,fullname',
                'shippingService:id,courier_name,service_code,service_name',

                'shipments' => function ($q) use ($shipmentStatus) {
                    $q->when($shipmentStatus, fn($qq) => $qq->where('status', $shipmentStatus))
                        ->with([
                            'partner:id,fullname',
                            'shippingService:id,courier_name,service_code,service_name',
                            'items.product.thumbnail',
                            'items.product.partner:id,fullname',
                            'items.product.images:id,product_id,image',
                        ]);
                },
            ])
            ->whereHas('shipments', function ($q) use ($shipmentStatus) {
                $q->when($shipmentStatus, fn($qq) => $qq->where('status', $shipmentStatus));
            })
            ->latest()
            ->get();

        // buang shipment tanpa item (harusnya ga kejadian kalau relasi beres)
        $orders->each(function ($order) {
            $order->setRelation(
                'shipments',
                $order->shipments->filter(fn($s) => $s->items && $s->items->count() > 0)->values()
            );
        });

        $orders = $orders->filter(fn($o) => $o->shipments && $o->shipments->count() > 0)->values();

        return $this->successResponse(OrderResource::collection($orders), "Success");
    }

    public function fromCheckout(Request $request)
    {
        $data = $request->validate([
            'checkout_id' => 'required|uuid|exists:checkout_sessions,id',
            'address_id' => 'required|integer|exists:addresses,id',

            // ✅ per partner shipping
            'shipments' => 'required|array|min:1',
            'shipments.*.partner_id' => 'required|integer|exists:users,id',
            'shipments.*.shipping_service_id' => 'required|integer|exists:shipping_services,id',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($data, $user) {
            $checkout = CheckoutSession::with('items.product')
                ->where('id', $data['checkout_id'])
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($checkout->status !== 'draft') {
                return $this->errorResponse('Checkout sudah diproses / tidak valid', 422);
            }

            if ($checkout->expires_at && now()->gt($checkout->expires_at)) {
                $checkout->update(['status' => 'expired']);
                return $this->errorResponse('Checkout expired', 422);
            }

            // lock semua product
            $productIds = $checkout->items->pluck('product_id')->unique()->values();
            $lockedProducts = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // group checkout items per partner
            $itemsByPartner = $checkout->items->groupBy(function ($item) use ($lockedProducts) {
                $p = $lockedProducts[$item->product_id] ?? null;
                return (int) ($p?->partner_id ?? 0);
            });

            // ✅ validasi partner_id yg dikirim harus sama dengan partner yg ada di checkout
            $partnerIdsInCheckout = $itemsByPartner->keys()->map(fn($x) => (int)$x)->filter(fn($x) => $x > 0)->values()->all();
            sort($partnerIdsInCheckout);

            $partnerIdsInRequest = collect($data['shipments'])->pluck('partner_id')->map(fn($x) => (int)$x)->unique()->values()->all();
            sort($partnerIdsInRequest);

            if ($partnerIdsInCheckout !== $partnerIdsInRequest) {
                return $this->errorResponse('Shipments partner tidak sesuai dengan isi checkout', 422, [
                    'expected_partner_ids' => $partnerIdsInCheckout,
                    'given_partner_ids' => $partnerIdsInRequest,
                ]);
            }

            // hitung subtotal & total shipping (per partner)
            $subtotal = 0;
            $totalShippingCost = 0;

            // simpan hasil hitung per partner agar dipakai create shipments & payouts
            $computed = []; // partner_id => [subtotal, weight_grams, chargeable_kg, shipping_service_id, shipping_cost]

            // siapkan map request partner_id => shipping_service_id
            $shippingChoiceMap = collect($data['shipments'])->keyBy(fn($s) => (int)$s['partner_id']);

            foreach ($itemsByPartner as $partnerId => $items) {
                $partnerId = (int) $partnerId;

                $partnerSubtotal = 0;
                $partnerWeightGrams = 0;

                foreach ($items as $item) {
                    $product = $lockedProducts[$item->product_id] ?? null;

                    if (!$product || !$product->is_active) {
                        return $this->errorResponse('Produk sudah tidak tersedia', 422);
                    }

                    if ($product->stock < $item->qty) {
                        return $this->errorResponse("Stok tidak cukup untuk {$product->name}", 422);
                    }

                    $lineTotal = (int)$item->qty * (float)$item->price_snapshot;
                    $partnerSubtotal += $lineTotal;

                    $weightGrams = (int) ($product->weight ?? 0);
                    $partnerWeightGrams += ($weightGrams * (int)$item->qty);
                }

                $chargeableKg = (int) ceil($partnerWeightGrams / 1000);

                $shippingServiceId = (int) ($shippingChoiceMap[$partnerId]['shipping_service_id'] ?? 0);

                $shippingService = ShippingService::query()
                    ->whereKey($shippingServiceId)
                    ->where('is_active', true)
                    ->first();

                if (!$shippingService) {
                    return $this->errorResponse("Jasa pengiriman tidak tersedia untuk partner_id={$partnerId}", 422);
                }

                $shippingCost = (float) $shippingService->base_price + ($chargeableKg * (float) $shippingService->price_per_kg);

                $computed[$partnerId] = [
                    'partner_subtotal' => $partnerSubtotal,
                    'weight_grams' => $partnerWeightGrams,
                    'chargeable_kg' => $chargeableKg,
                    'shipping_service_id' => $shippingService->id,
                    'shipping_cost' => $shippingCost,
                ];

                $subtotal += $partnerSubtotal;
                $totalShippingCost += $shippingCost;
            }

            $grandTotal = $subtotal + $totalShippingCost;

            // ✅ create order (shipping_service_id diset "salah satu" / nullable, tapi shipping_cost = TOTAL)
            // kalau kolom shipping_service_id NOT NULL, set aja dari shipment pertama.
            $firstShipmentServiceId = (int) collect($computed)->first()['shipping_service_id'];

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $data['address_id'],

                'subtotal' => $subtotal,
                'shipping_service_id' => $firstShipmentServiceId, // fallback
                'shipping_cost' => $totalShippingCost,
                'grand_total' => $grandTotal,

                'status' => 'process',
                'payment_status' => 'unpaid',
                'escrow_status' => 'holding',
                'paid_at' => null,
                'completed_at' => null,
            ]);

            // ✅ create shipments per partner
            $shipmentRows = [];
            foreach ($computed as $partnerId => $c) {
                $shipmentRows[$partnerId] = OrderShipment::create([
                    'order_id' => $order->id,
                    'partner_id' => (int) $partnerId,
                    'shipping_service_id' => (int) $c['shipping_service_id'],
                    'shipping_cost' => (float) $c['shipping_cost'],
                    'status' => 'process',
                ]);
            }

            foreach ($checkout->items as $item) {
                $product = $lockedProducts[$item->product_id];

                $partnerId = (int) $product->partner_id;
                $shipment = $shipmentRows[$partnerId];

                OrderItem::create([
                    'order_id' => $order->id,
                    'order_shipment_id' => $shipment->id,
                    'product_id' => $item->product_id,
                    'qty' => (int) $item->qty,
                    'price' => (float) $item->price_snapshot,
                    'total' => (int) $item->qty * (float) $item->price_snapshot,
                ]);
            }

            return $this->successResponse([
                'order_id' => $order->id,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'escrow_status' => $order->escrow_status,
                'subtotal' => number_format((float)$subtotal, 2, '.', ''),
                'shipping_cost' => number_format((float)$totalShippingCost, 2, '.', ''),
                'grand_total' => number_format((float)$grandTotal, 2, '.', ''),
            ]);
        });
    }

    public function payWithMidtrans(Request $request, Order $order)
    {
        $user = $request->user();

        if ((int)$order->user_id !== (int)$user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        return DB::transaction(function () use ($order, $user) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'paid') {
                return $this->successResponse([
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                ], 'Already paid');
            }

            $midtransOrderId = 'ORD-' . $order->id . '-' . now()->timestamp;

            $existing = OrderPayment::query()
                ->where('order_id', $order->id)
                ->where('provider', 'midtrans')
                ->whereIn('status', ['unpaid', 'pending'])
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($existing && isset($existing->payload['token'])) {
                $order->update(['payment_status' => 'pending', 'status' => 'pending']);
                return $this->successResponse([
                    'order_id' => $order->id,
                    'snap_token' => $existing->payload['token'],
                ], 'Snap token reused');
            }

            Config::$serverKey = config('services.midtrans.server_key');
            Config::$isProduction = (bool) config('services.midtrans.is_production');
            Config::$isSanitized = true;
            Config::$is3ds = true;

            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) round((float) $order->grand_total),
                ],
                'customer_details' => [
                    'first_name' => $user->fullname ?? 'Customer',
                    'email' => $user->email ?? null,
                ],
            ];

            $token = Snap::getSnapToken($params);

            OrderPayment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'status' => 'pending',
                'external_id' => $midtransOrderId, // ✅ webhook pakai ini
                'payload' => ['token' => $token],
            ]);

            $order->update(['payment_status' => 'pending', 'status' => 'pending']);

            return $this->successResponse([
                'order_id' => $order->id,
                'snap_token' => $token,
            ], 'Snap token created');
        });
    }

    public function paymentInfo(Request $request, Order $order)
    {
        $user = $request->user();
        if ((int)$order->user_id !== (int)$user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $payment = OrderPayment::query()
            ->where('order_id', $order->id)
            ->where('provider', 'midtrans')
            ->latest('id')
            ->first();

        if (!$payment) return $this->errorResponse('Payment not created', 404);

        $this->midtransConfig();

        // status untuk update fields minimal
        $statusObj = Transaction::status($payment->external_id);
        $statusArr = json_decode(json_encode($statusObj), true) ?? [];

        // payload DB (sticky)
        $payloadArr = is_array($payment->payload)
            ? $payment->payload
            : (json_decode(json_encode($payment->payload), true) ?? []);

        // ✅ merge minimal (jangan bunuh actions/va_numbers yang sudah ada)
        $mergedPayload = array_merge($payloadArr, [
            'transaction_status' => $statusArr['transaction_status'] ?? ($payloadArr['transaction_status'] ?? null),
            'gross_amount'       => $statusArr['gross_amount'] ?? ($payloadArr['gross_amount'] ?? null),
            'status_code'        => $statusArr['status_code'] ?? ($payloadArr['status_code'] ?? null),
            'expiry_time'        => $statusArr['expiry_time'] ?? ($payloadArr['expiry_time'] ?? null),
            'payment_type'       => $statusArr['payment_type'] ?? ($payloadArr['payment_type'] ?? null),
            'order_id'           => $statusArr['order_id'] ?? ($payloadArr['order_id'] ?? null),
        ]);

        // ✅ kalau statusArr tidak punya actions/va_numbers, pertahankan dari payload DB
        if (empty($statusArr['actions']) && !empty($payloadArr['actions'])) {
            $mergedPayload['actions'] = $payloadArr['actions'];
        }
        if (empty($statusArr['va_numbers']) && !empty($payloadArr['va_numbers'])) {
            $mergedPayload['va_numbers'] = $payloadArr['va_numbers'];
        }
        if (empty($statusArr['permata_va_number']) && !empty($payloadArr['permata_va_number'])) {
            $mergedPayload['permata_va_number'] = $payloadArr['permata_va_number'];
        }

        // ✅ QR URL sticky
        $qrUrl = $payloadArr['qr_url'] ?? null;
        $actions = $mergedPayload['actions'] ?? [];

        if (!$qrUrl && is_array($actions)) {
            foreach ($actions as $a) {
                $name = strtolower((string)($a['name'] ?? ''));
                $url  = $a['url'] ?? null;
                if (!$url) continue;

                if (
                    $name === 'generate-qr-code-v2' ||
                    str_contains($name, 'qr') ||
                    str_contains((string)$url, '/qr-code') ||
                    str_contains((string)$url, 'qris')
                ) {
                    $qrUrl = $url;
                    break;
                }
            }
        }

        if ($qrUrl) $mergedPayload['qr_url'] = $qrUrl;

        // ✅ VA number extraction (support va_numbers + permata)
        $vaNumber = null;

        // BCA/BNI/BRI biasanya va_numbers
        if (!empty($mergedPayload['va_numbers']) && is_array($mergedPayload['va_numbers'])) {
            $vaNumber = $mergedPayload['va_numbers'][0]['va_number'] ?? null;
        }

        // Permata punya field sendiri
        if (!$vaNumber && !empty($mergedPayload['permata_va_number'])) {
            $vaNumber = $mergedPayload['permata_va_number'];
        }

        // simpan balik payload yang sudah distabilkan
        $payment->update(['payload' => $mergedPayload]);

        return $this->successResponse([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'grand_total' => number_format((float)$order->grand_total, 2, '.', ''),
            'payment' => [
                'type' => $payment->payment_type,      // bank_transfer | qris
                'method' => $payment->payment_method,  // bca|bni|bri|qris
                'midtrans_order_id' => $payment->external_id,
                'transaction_status' => $mergedPayload['transaction_status'] ?? null,
                'gross_amount' => $mergedPayload['gross_amount'] ?? null,
                'va_number' => $vaNumber,
                'qr_url' => $mergedPayload['qr_url'] ?? null,
            ],
            'raw_midtrans' => $statusArr,
        ], 'Payment info');
    }

    public function summary(Request $request, Order $order)
    {
        $user = $request->user();

        if ((int) $order->user_id !== (int) $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        return $this->successResponse([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
            'subtotal' => number_format((float) $order->subtotal, 2, '.', ''),
            'shipping_cost' => number_format((float) $order->shipping_cost, 2, '.', ''),
            'grand_total' => number_format((float) $order->grand_total, 2, '.', ''),
        ], 'Order summary');
    }

    public function deliveredShipmentByAdmin(Request $request, OrderShipment $shipment)
    {
        return DB::transaction(function () use ($shipment) {
            $shipment = OrderShipment::query()
                ->whereKey($shipment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($shipment->status !== 'shipping') {
                return $this->errorResponse('Shipment tidak valid untuk dikonfirmasi (harus shipping)', 422);
            }

            $shipment->update(['status' => 'delivered']);

            // schedule payout H+2 untuk shipment ini
            $releaseAt = now()->addDays(2);

            OrderPayout::query()
                ->where('order_id', $shipment->order_id)
                ->where('order_shipment_id', $shipment->id)
                ->where('recipient_type', 'partner')
                ->where('status', 'holding')
                ->update(['release_scheduled_at' => $releaseAt]);

            // kalau semua shipment di order ini sudah delivered/completed -> order delivered
            $order = Order::query()
                ->whereKey($shipment->order_id)
                ->with('shipments:id,order_id,status')
                ->lockForUpdate()
                ->firstOrFail();

            $allDeliveredOrCompleted = $order->shipments
                ->every(fn($s) => in_array($s->status, ['delivered', 'completed'], true));

            if ($allDeliveredOrCompleted && $order->status !== 'delivered') {
                $order->update(['status' => 'delivered']);
            }

            return $this->successResponse([
                'shipment_id' => $shipment->id,
                'shipment_status' => $shipment->status,
                'release_scheduled_at' => $releaseAt,
                'order_id' => $order->id,
                'order_status' => $order->status,
            ], 'Shipment delivered confirmed');
        });
    }

    public function shipByPartner(Request $request, OrderShipment $shipment)
    {
        $partner = $request->user();

        return DB::transaction(function () use ($shipment, $partner) {
            $shipment = OrderShipment::query()
                ->whereKey($shipment->id)
                ->lockForUpdate()
                ->firstOrFail();

            // pastikan shipment milik partner yg login
            if ((int) $shipment->partner_id !== (int) $partner->id) {
                return $this->errorResponse('Unauthorized', 403);
            }

            // hanya boleh dari process -> shipping
            if ($shipment->status !== 'process') {
                return $this->errorResponse('Shipment tidak valid untuk dikirim', 422);
            }

            $shipment->update(['status' => 'shipping']);

            // optional: update status order kalau semua shipment sudah shipping
            $order = Order::query()
                ->whereKey($shipment->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $allShippingOrMore = $order->shipments()
                ->whereNotIn('status', ['shipping', 'delivered', 'completed'])
                ->doesntExist();

            if ($allShippingOrMore && $order->status === 'process') {
                $order->update(['status' => 'shipping']);
            }

            return $this->successResponse([
                'shipment_id' => $shipment->id,
                'shipment_status' => $shipment->status,
                'order_id' => $order->id,
                'order_status' => $order->status,
            ], 'Shipment updated');
        });
    }

    public function receiveItemByBuyer(Request $request, OrderItem $orderItem)
    {
        $buyer = $request->user();

        return DB::transaction(function () use ($orderItem, $buyer) {

            $orderItem = OrderItem::query()
                ->whereKey($orderItem->id)
                ->with([
                    'shipment:id,order_id,partner_id,status',
                    'shipment.order:id,user_id,status',
                ])
                ->lockForUpdate()
                ->firstOrFail();

            $shipment = $orderItem->shipment;
            $order = $shipment?->order;

            if (!$shipment || !$order) {
                return $this->errorResponse('Order / shipment tidak ditemukan', 404);
            }

            if ((int) $order->user_id !== (int) $buyer->id) {
                return $this->errorResponse('Unauthorized', 403);
            }

            if ($shipment->status !== 'delivered') {
                return $this->errorResponse('Item belum bisa dikonfirmasi (shipment belum delivered)', 422);
            }

            if ($orderItem->received_at) {
                return $this->successResponse([
                    'order_item_id' => $orderItem->id,
                    'received_at' => $orderItem->received_at,
                ], 'Already received');
            }

            $orderItem->update(['received_at' => now()]);

            // cek apakah semua item dalam shipment sudah received
            $items = OrderItem::query()
                ->where('order_shipment_id', $shipment->id)
                ->select('id', 'received_at')
                ->lockForUpdate()
                ->get();

            $allReceived = $items->every(fn($it) => !is_null($it->received_at));

            if ($allReceived && $shipment->status !== 'completed') {
                $shipment->update(['status' => 'completed']);

                // ✅ release payout sekarang
                $this->releaseShipmentPayoutNow($shipment->id);
            }

            // update order completed kalau semua shipment completed
            $order = Order::query()
                ->whereKey($shipment->order_id)
                ->with('shipments:id,order_id,status')
                ->lockForUpdate()
                ->firstOrFail();

            $allShipmentsCompleted = $order->shipments->every(fn($s) => $s->status === 'completed');

            if ($allShipmentsCompleted && $order->status !== 'completed') {
                $order->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'escrow_status' => 'released',
                ]);
            }

            return $this->successResponse([
                'order_item_id' => $orderItem->id,
                'shipment_id' => $shipment->id,
                'shipment_status' => $shipment->status,
                'order_id' => $order->id,
                'order_status' => $order->status,
            ], 'Item received');
        });
    }

    private function releaseShipmentPayoutNow(int $shipmentId): void
    {
        $shipment = OrderShipment::query()
            ->whereKey($shipmentId)
            ->with([
                'items:id,order_shipment_id,total,qty',
                'order:id,subtotal,grand_total',
            ])
            ->lockForUpdate()
            ->firstOrFail();

        $orderId = (int) $shipment->order_id;
        $partnerId = (int) $shipment->partner_id;

        $payout = OrderPayout::query()
            ->where('order_id', $orderId)
            ->where('order_shipment_id', $shipment->id)
            ->where('recipient_type', 'partner')
            ->where('recipient_user_id', $partnerId)
            ->lockForUpdate()
            ->first();

        if (!$payout) {
            // normalnya sudah dibuat saat paid webhook, tapi kita jaga-jaga
            $itemsSubtotal = (float) $shipment->items->sum(fn($it) => (float) $it->total);
            $feePercent = (float) config('platform.fee_percent');

            $partnerFee = round(($itemsSubtotal * $feePercent) / 100, 2);
            $amountToPartner = round($itemsSubtotal - $partnerFee, 2);

            $payout = OrderPayout::create([
                'order_id' => $orderId,
                'order_shipment_id' => $shipment->id,
                'recipient_type' => 'partner',
                'recipient_user_id' => $partnerId,
                'amount' => $amountToPartner,
                'status' => 'holding',
                'provider' => 'internal',
            ]);

            $payout = OrderPayout::query()->whereKey($payout->id)->lockForUpdate()->first();
        }

        if ($payout->status === 'released') {
            return;
        }

        // idempotent tambahan: kalau debit tx sudah ada, anggap released
        $refType = 'OrderPayout';
        $refId = (int) $payout->id;

        $already = WalletTransaction::query()
            ->where('reference_type', $refType)
            ->where('reference_id', $refId)
            ->where('type', 'debit')
            ->exists();

        if ($already) {
            $payout->update(['status' => 'released', 'released_at' => now()]);
            return;
        }

        $adminUserId = (int) config('platform.admin_user_id');
        if ($adminUserId <= 0) {
            throw new \RuntimeException('PLATFORM_ADMIN_USER_ID belum diset');
        }

        $adminWallet = Wallet::firstOrCreate(['user_id' => $adminUserId], ['balance' => 0]);
        $partnerWallet = Wallet::firstOrCreate(['user_id' => $partnerId], ['balance' => 0]);

        $adminWallet = Wallet::query()->whereKey($adminWallet->id)->lockForUpdate()->first();
        $partnerWallet = Wallet::query()->whereKey($partnerWallet->id)->lockForUpdate()->first();

        $amount = (float) $payout->amount;

        if ((float) $adminWallet->balance < $amount) {
            throw new \RuntimeException("Saldo admin tidak cukup untuk payout #{$payout->id}");
        }

        $adminAfter = (float) $adminWallet->balance - $amount;
        $partnerAfter = (float) $partnerWallet->balance + $amount;

        $adminWallet->update(['balance' => $adminAfter]);
        $partnerWallet->update(['balance' => $partnerAfter]);

        WalletTransaction::create([
            'wallet_id' => $adminWallet->id,
            'type' => 'debit',
            'amount' => $amount,
            'balance_after' => $adminAfter,
            'reference_type' => $refType,
            'reference_id' => $refId,
            'description' => "Payout ke partner user_id={$partnerId} (shipment #{$shipment->id})",
            'meta' => ['order_id' => $orderId, 'shipment_id' => $shipment->id],
        ]);

        WalletTransaction::create([
            'wallet_id' => $partnerWallet->id,
            'type' => 'credit',
            'amount' => $amount,
            'balance_after' => $partnerAfter,
            'reference_type' => $refType,
            'reference_id' => $refId,
            'description' => "Payout diterima dari admin (shipment #{$shipment->id})",
            'meta' => ['order_id' => $orderId, 'shipment_id' => $shipment->id],
        ]);

        $payout->update([
            'status' => 'released',
            'released_at' => now(),
        ]);

        // kalau semua payout order released -> escrow_status released
        $stillHolding = OrderPayout::query()
            ->where('order_id', $orderId)
            ->where('recipient_type', 'partner')
            ->where('status', 'holding')
            ->exists();

        if (!$stillHolding) {
            Order::query()->whereKey($orderId)->update(['escrow_status' => 'released']);
        }
    }

    private function midtransConfig(): void
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function payVA(Request $request, Order $order)
    {
        $user = $request->user();
        if ((int)$order->user_id !== (int)$user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $data = $request->validate([
            'bank' => 'required|string|in:bca,bni,bri',
        ]);

        return DB::transaction(function () use ($order, $user, $data) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'paid') {
                return $this->successResponse([
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                ], 'Already paid');
            }

            // reuse payment pending yang sama
            $existing = OrderPayment::query()
                ->where('order_id', $order->id)
                ->where('provider', 'midtrans')
                ->where('payment_type', 'bank_transfer')
                ->where('payment_method', $data['bank'])
                ->where('status', 'pending')
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $order->update(['payment_status' => 'pending', 'status' => 'pending']);
                return $this->successResponse([
                    'order_id' => $order->id,
                    'midtrans_order_id' => $existing->external_id,
                    'payment' => $existing->payload,
                ], 'Payment reused');
            }

            $this->midtransConfig();

            $midtransOrderId = 'ORD-' . $order->id . '-' . now()->timestamp;

            $charge = [
                'payment_type' => 'bank_transfer',
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) round((float)$order->grand_total),
                ],
                'customer_details' => [
                    'first_name' => $user->fullname ?? 'Customer',
                    'email' => $user->email ?? null,
                ],
                'bank_transfer' => [
                    'bank' => $data['bank'],
                ],
            ];

            $res = CoreApi::charge($charge);
            $resArr = json_decode(json_encode($res), true) ?? [];

            OrderPayment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'status' => 'pending',
                'external_id' => $midtransOrderId,
                'payment_type' => 'bank_transfer',
                'payment_method' => $data['bank'],
                'payload' => $resArr,
            ]);

            $order->update(['payment_status' => 'pending', 'status' => 'pending']);

            return $this->successResponse([
                'order_id' => $order->id,
                'midtrans_order_id' => $midtransOrderId,
                'payment' => $res,
            ], 'VA created');
        });
    }

    public function payQRIS(Request $request, Order $order)
    {
        $user = $request->user();
        if ((int)$order->user_id !== (int)$user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        return DB::transaction(function () use ($order, $user) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'paid') {
                return $this->successResponse([
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                ], 'Already paid');
            }

            $existing = OrderPayment::query()
                ->where('order_id', $order->id)
                ->where('provider', 'midtrans')
                ->where('payment_type', 'qris')
                ->where('payment_method', 'qris')
                ->where('status', 'pending')
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $order->update(['payment_status' => 'pending', 'status' => 'pending']);
                return $this->successResponse([
                    'order_id' => $order->id,
                    'midtrans_order_id' => $existing->external_id,
                    'payment' => $existing->payload,
                ], 'Payment reused');
            }

            $this->midtransConfig();

            $midtransOrderId = 'ORD-' . $order->id . '-' . now()->timestamp;

            $charge = [
                'payment_type' => 'gopay',
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) round((float)$order->grand_total),
                ],
                'customer_details' => [
                    'first_name' => $user->fullname ?? 'Customer',
                    'email' => $user->email ?? null,
                ],
            ];

            $res = CoreApi::charge($charge);

            // ✅ deep convert (penting)
            $resArr = json_decode(json_encode($res), true) ?? [];

            // ✅ extract & persist qr_url
            $qrUrl = null;
            if (!empty($resArr['actions']) && is_array($resArr['actions'])) {
                foreach ($resArr['actions'] as $a) {
                    $name = strtolower((string)($a['name'] ?? ''));
                    $url = $a['url'] ?? null;
                    if ($url && ($name === 'generate-qr-code-v2' || str_contains($name, 'qr') || str_contains((string)$url, '/qr-code'))) {
                        $qrUrl = $url;
                        break;
                    }
                }
            }
            if ($qrUrl) $resArr['qr_url'] = $qrUrl;

            OrderPayment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'status' => 'pending',
                'external_id' => $midtransOrderId,
                'payment_type' => 'qris',
                'payment_method' => 'qris',
                'payload' => $resArr, // ✅ SIMPAN actions + qr_url
            ]);

            $order->update(['payment_status' => 'pending', 'status' => 'pending']);

            return $this->successResponse([
                'order_id' => $order->id,
                'midtrans_order_id' => $midtransOrderId,
                'payment' => $resArr,
            ], 'QRIS created');
        });
    }
}
