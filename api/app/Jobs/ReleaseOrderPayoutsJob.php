<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderPayout;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ReleaseOrderPayoutsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ?int $orderId = null) {}

    public function handle(): void
    {
        $query = OrderPayout::query()
            ->where('status', 'holding')
            ->whereNotNull('release_scheduled_at')
            ->where('release_scheduled_at', '<=', now())
            ->where('recipient_type', 'partner')
            ->orderBy('release_scheduled_at')
            ->limit(50);

        if ($this->orderId) {
            $query->where('order_id', $this->orderId);
        }

        $payouts = $query->get();

        foreach ($payouts as $payout) {
            DB::transaction(function () use ($payout) {
                $locked = OrderPayout::query()
                    ->whereKey($payout->id)
                    ->lockForUpdate()
                    ->first();

                if (!$locked || $locked->status !== 'holding') return;

                $order = Order::query()
                    ->whereKey($locked->order_id)
                    ->lockForUpdate()
                    ->first();

                if (!$order) return;

                // NOTE:
                // Kamu bisa pilih rule: release payout walau order belum "completed" (karena shipment delivered + H+2)
                // Jadi jangan paksa order.status === completed.
                // Kalau kamu mau ketat, cek minimal order.status in ['delivered','completed'].
                if (!in_array($order->status, ['delivered', 'completed'], true)) {
                    return;
                }

                $adminUserId = (int) config('platform.admin_user_id');
                if ($adminUserId <= 0) {
                    throw new \RuntimeException('PLATFORM_ADMIN_USER_ID belum diset');
                }

                $adminWallet = Wallet::firstOrCreate(['user_id' => $adminUserId], ['balance' => 0]);
                $partnerWallet = Wallet::firstOrCreate(['user_id' => $locked->recipient_user_id], ['balance' => 0]);

                $adminWallet = Wallet::query()->whereKey($adminWallet->id)->lockForUpdate()->first();
                $partnerWallet = Wallet::query()->whereKey($partnerWallet->id)->lockForUpdate()->first();

                // idempotent by tx
                $refType = 'OrderPayout';
                $refId = (int) $locked->id;

                $already = WalletTransaction::query()
                    ->where('reference_type', $refType)
                    ->where('reference_id', $refId)
                    ->where('type', 'debit')
                    ->exists();

                if ($already) {
                    $locked->update(['status' => 'released', 'released_at' => now()]);
                    return;
                }

                $amount = (float) $locked->amount;

                if ((float) $adminWallet->balance < $amount) {
                    // kalau saldo admin kurang, tahan dulu (atau set failed)
                    return;
                }

                $adminAfter = (float) $adminWallet->balance - $amount;
                $partnerAfter = (float) $partnerWallet->balance + $amount;

                $adminWallet->update(['balance' => $adminAfter]);
                $partnerWallet->update(['balance' => $partnerAfter]);

                WalletTransaction::create([
                    'wallet_id' => $adminWallet->id,
                    'type' => 'debit', // ✅ FIX dari "debt"
                    'amount' => $amount,
                    'balance_after' => $adminAfter,
                    'reference_type' => $refType,
                    'reference_id' => $refId,
                    'description' => "Escrow release payout #{$locked->id} order #{$locked->order_id}",
                    'meta' => [
                        'order_id' => $locked->order_id,
                        'order_shipment_id' => $locked->order_shipment_id,
                        'recipient_type' => $locked->recipient_type,
                    ],
                ]);

                WalletTransaction::create([
                    'wallet_id' => $partnerWallet->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'balance_after' => $partnerAfter,
                    'reference_type' => $refType,
                    'reference_id' => $refId,
                    'description' => "Payout diterima order #{$locked->order_id}",
                    'meta' => [
                        'order_id' => $locked->order_id,
                        'order_shipment_id' => $locked->order_shipment_id,
                        'recipient_type' => $locked->recipient_type,
                    ],
                ]);

                $locked->update([
                    'status' => 'released',
                    'released_at' => now(),
                ]);

                $stillHolding = OrderPayout::query()
                    ->where('order_id', $locked->order_id)
                    ->where('recipient_type', 'partner')
                    ->where('status', 'holding')
                    ->exists();

                if (!$stillHolding) {
                    $order->update(['escrow_status' => 'released']);
                }
            });
        }
    }
}
