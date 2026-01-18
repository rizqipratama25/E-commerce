<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\OrderPayout;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    use ApiResponse;

    public function handle(Request $request)
    {
        $payload = $request->all();

        $serverKey = config('services.midtrans.server_key');

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');

        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if (!$orderId || !$signatureKey || $expected !== $signatureKey) {
            return $this->errorResponse('Invalid signature', 401);
        }

        $transactionStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? '');

        return DB::transaction(function () use ($orderId, $payload, $transactionStatus, $fraudStatus) {
            $payment = OrderPayment::query()
                ->where('provider', 'midtrans')
                ->where('external_id', $orderId)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return $this->successResponse(['ok' => true], 'Payment not found but acknowledged');
            }

            $order = Order::query()
                ->whereKey($payment->order_id)
                ->with([
                    'orderItems.product:id,partner_id,stock',
                    'orderItems.shipment:id,order_id,partner_id',
                    'shipments:id,order_id,partner_id,status',
                ])
                ->lockForUpdate()
                ->firstOrFail();

            $existingPayload = is_array($payment->payload)
                ? $payment->payload
                : (json_decode(json_encode($payment->payload), true) ?? []);

            $incomingPayload = is_array($payload)
                ? $payload
                : (json_decode(json_encode($payload), true) ?? []);

            $merged = array_merge($existingPayload, $incomingPayload);

            if (empty($incomingPayload['actions']) && !empty($existingPayload['actions'])) {
                $merged['actions'] = $existingPayload['actions'];
            }

            if (empty($incomingPayload['qr_url']) && !empty($existingPayload['qr_url'])) {
                $merged['qr_url'] = $existingPayload['qr_url'];
            }

            $payment->update(['payload' => $merged]);

            $isPaid =
                $transactionStatus === 'settlement' ||
                ($transactionStatus === 'capture' && $fraudStatus === 'accept');

            if ($isPaid) {
                if ($order->payment_status === 'paid') {
                    return $this->successResponse(['ok' => true], 'Already paid');
                }

                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);

                $order->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'status' => 'process',
                    'escrow_status' => 'holding',
                ]);

                $this->applyStockEscrowPayouts($order);

                return $this->successResponse(['ok' => true], 'Paid processed');
            }

            if (in_array($transactionStatus, ['deny', 'cancel'], true)) {
                $payment->update(['status' => 'failed']);
                $order->update(['payment_status' => 'failed']);
                return $this->successResponse(['ok' => true], 'Failed processed');
            }

            if ($transactionStatus === 'expire') {
                $payment->update(['status' => 'expired']);
                $order->update(['payment_status' => 'expired']);
                return $this->successResponse(['ok' => true], 'Expired processed');
            }

            $payment->update(['status' => 'pending']);
            $order->update(['payment_status' => 'pending', 'status' => 'pending']);

            return $this->successResponse(['ok' => true], 'Pending acknowledged');
        });
    }

    /**
     * 1) decrement stock (sekali)
     * 2) credit admin wallet (sekali)
     * 3) create payout per shipment (holding) (sekali)
     */
    private function applyStockEscrowPayouts(Order $order): void
    {
        // idempotent via wallet tx escrow credit
        $escrowTxExists = WalletTransaction::query()
            ->where('reference_type', 'OrderEscrow')
            ->where('reference_id', $order->id)
            ->where('type', 'credit')
            ->exists();

        if (!$escrowTxExists) {
            // ✅ decrement stock sekali (aman, karena guarded)
            foreach ($order->orderItems as $it) {
                if (!$it->product) continue;

                Product::query()
                    ->whereKey($it->product->id)
                    ->lockForUpdate()
                    ->first()
                    ?->decrement('stock', (int) $it->qty);
            }

            $adminUserId = (int) config('platform.admin_user_id');
            if ($adminUserId <= 0) {
                throw new \RuntimeException("PLATFORM_ADMIN_USER_ID belum diset");
            }

            $adminWallet = Wallet::firstOrCreate(['user_id' => $adminUserId], ['balance' => 0]);
            $adminWallet = Wallet::query()->whereKey($adminWallet->id)->lockForUpdate()->first();

            $amount = (float) $order->grand_total;
            $after = (float) $adminWallet->balance + $amount;

            $adminWallet->update(['balance' => $after]);

            WalletTransaction::create([
                'wallet_id' => $adminWallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_after' => $after,
                'reference_type' => 'OrderEscrow',
                'reference_id' => $order->id,
                'description' => "Escrow masuk dari Order #{$order->id}",
                'meta' => ['provider' => 'midtrans'],
            ]);
        }

        // ✅ create payout PER SHIPMENT (idempotent)
        // hitung subtotal per shipment (total item)
        $shipmentTotals = [];
        foreach ($order->orderItems as $it) {
            $shipmentId = (int) ($it->order_shipment_id ?? 0);
            if ($shipmentId <= 0) continue;
            $shipmentTotals[$shipmentId] = ($shipmentTotals[$shipmentId] ?? 0) + (float) $it->total;
        }

        $feePercent = (float) config('platform.fee_percent');

        foreach ($order->shipments as $sh) {
            $shipmentId = (int) $sh->id;
            $partnerId = (int) $sh->partner_id;

            $itemsSubtotal = (float) ($shipmentTotals[$shipmentId] ?? 0);
            if ($itemsSubtotal <= 0) continue;

            $partnerFee = round(($itemsSubtotal * $feePercent) / 100, 2);
            $amountToPartner = round($itemsSubtotal - $partnerFee, 2);

            OrderPayout::firstOrCreate(
                [
                    'order_id' => $order->id,
                    'order_shipment_id' => $shipmentId,
                    'recipient_type' => 'partner',
                    'recipient_user_id' => $partnerId,
                ],
                [
                    'amount' => $amountToPartner,
                    'status' => 'holding',
                    'release_scheduled_at' => null,
                    'released_at' => null,
                    'provider' => 'internal',
                ]
            );
        }
    }
}
