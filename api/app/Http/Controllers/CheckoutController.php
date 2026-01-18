<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CheckoutItem;
use App\Models\CheckoutSession;
use App\Models\Product;
use App\Models\ShippingService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    use ApiResponse;

    public function buyNow(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'qty' => 'required|integer|min:1'
        ]);

        $user = $request->user();

        $product = Product::query()
            ->where('id', $data['product_id'])
            ->where('is_active', true)
            ->firstOrFail();

        if ($product->stock < $data['qty']) {
            return $this->errorResponse('Stok tidak cukup');
        }

        $checkout = CheckoutSession::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'type' => 'buy_now',
            'status' => 'draft',
            'expires_at' => now()->addHours(2)
        ]);

        CheckoutItem::create([
            'checkout_session_id' => $checkout->id,
            'product_id' => $product->id,
            'qty' => $data['qty'],
            'price_snapshot' => $product->price
        ]);

        return $this->successResponse(['checkout_id' => $checkout->id]);
    }

    public function fromCart(Request $request)
    {
        $data = $request->validate([
            'item_ids' => ['required', 'array', 'min:1'],
            'item_ids.*' => ['integer', 'distinct'],
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($data, $user) {
            // lock cart active user
            $cart = Cart::query()
                ->active()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$cart) {
                return $this->errorResponse('Cart kosong', 422);
            }

            // ambil item yang dipilih, pastikan milik cart user
            $items = $cart->items()
                ->with('product')
                ->whereIn('id', $data['item_ids'])
                ->lockForUpdate()
                ->get();

            if ($items->count() !== count($data['item_ids'])) {
                return $this->errorResponse('Ada cart item yang tidak valid', 422);
            }

            // validasi product & stok
            foreach ($items as $item) {
                $product = Product::query()
                    ->whereKey($item->product_id)
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    return $this->errorResponse("Produk tidak tersedia", 422);
                }

                if ($product->stock < (int) $item->qty) {
                    return $this->errorResponse("Stok tidak cukup untuk {$product->name}", 422);
                }
            }

            // buat checkout session type cart
            $checkout = CheckoutSession::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'type' => 'cart',
                'status' => 'draft',
                'expires_at' => now()->addHours(2),
            ]);

            // copy items -> checkout_items (snapshot)
            foreach ($items as $item) {
                $product = $item->product;

                $priceSnapshot = $item->price_snapshot ?? ($product?->price ?? 0);

                CheckoutItem::create([
                    'checkout_session_id' => $checkout->id,
                    'product_id' => $item->product_id,
                    'qty' => (int) $item->qty,
                    'price_snapshot' => $priceSnapshot,
                ]);
            }

            return $this->successResponse([
                'checkout_id' => $checkout->id,
            ], 'Checkout created from cart');
        });
    }

    public function show(Request $request, string $checkoutId)
    {
        $user = $request->user();

        $checkout = CheckoutSession::with(['items.product.images', 'items.product.partner'])
            ->where('id', $checkoutId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($checkout->status !== 'draft') {
            return $this->errorResponse('Checkout sudah tidak valid', 422);
        }

        if ($checkout->expires_at && now()->gt($checkout->expires_at)) {
            $checkout->update(['status' => 'expired']);
            return $this->errorResponse('Checkout expired', 422);
        }

        // group per partner
        $grouped = $checkout->items->groupBy(function ($item) {
            return (int) ($item->product?->partner_id ?? 0);
        });

        $shippingServices = ShippingService::query()
            ->where('is_active', true)
            ->orderBy('courier_name')
            ->orderBy('service_name')
            ->get();

        $shipments = [];
        $grandSubtotal = 0;

        foreach ($grouped as $partnerId => $items) {
            $partnerId = (int) $partnerId;

            // hitung subtotal & berat per partner
            $subtotal = 0;
            $totalWeightGrams = 0;

            $mappedItems = $items->map(function ($item) use (&$subtotal, &$totalWeightGrams) {
                $product = $item->product;
                $price = (float) ($item->price_snapshot ?? ($product?->price ?? 0));
                $qty = (int) $item->qty;

                $lineTotal = $qty * $price;
                $subtotal += $lineTotal;

                $weightGrams = (int) ($product?->weight ?? 0);
                $lineWeight = $qty * $weightGrams;
                $totalWeightGrams += $lineWeight;

                return [
                    'product_id' => $item->product_id,
                    'name' => $product?->name,
                    'slug' => $product?->slug,
                    'image' => optional($product?->thumbnail)->image
                        ?? optional($product?->images?->first())->image,
                    'qty' => $qty,
                    'price' => number_format($price, 2, '.', ''),
                    'total' => number_format($lineTotal, 2, '.', ''),
                    'weight_grams' => $weightGrams,
                    'line_weight_grams' => $lineWeight,
                ];
            })->values();

            $grandSubtotal += $subtotal;

            $chargeableKg = (int) ceil($totalWeightGrams / 1000);

            $shippingOptions = $shippingServices->map(function ($s) use ($chargeableKg) {
                $base = (float) $s->base_price;
                $perKg = (float) $s->price_per_kg;
                $cost = $base + ($chargeableKg * $perKg);

                return [
                    'id' => $s->id,
                    'courier_code' => $s->courier_code,
                    'courier_name' => $s->courier_name,
                    'service_code' => $s->service_code,
                    'service_name' => $s->service_name,
                    'estimation' => $s->estimation,
                    'base_price' => $base,
                    'price_per_kg' => $perKg,
                    'chargeable_kg' => $chargeableKg,
                    'shipping_cost' => $cost,
                ];
            })->values();

            $partnerName = optional($items->first()?->product?->partner)->fullname;

            $shipments[] = [
                'partner_id' => $partnerId,
                'partner_name' => $partnerName,
                'items' => $mappedItems,
                'subtotal' => number_format((float) $subtotal, 2, '.', ''),
                'total_weight_grams' => $totalWeightGrams,
                'chargeable_kg' => $chargeableKg,
                'shipping_options' => $shippingOptions,
            ];
        }

        return $this->successResponse([
            'checkout_id' => $checkout->id,
            'type' => $checkout->type,
            'shipments' => $shipments,
            'subtotal' => number_format((float) $grandSubtotal, 2, '.', ''),
        ]);
    }
}
