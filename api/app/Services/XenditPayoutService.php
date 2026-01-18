<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class XenditPayoutService
{
    public function createPayout(array $payload, string $idempotencyKey) {
        $secret = config('services.xendit.secret_key');
        $baseUrl = rtrim(config('services.xendit.base_url', 'https://api.xendit.co'), '/');

        $res = Http::withBasicAuth($secret, '')
                        ->withHeaders([
                            'Idempotency-Key' => $idempotencyKey
                        ])
                        ->post($baseUrl . '/v2/payouts', $payload);

        if (!$res->successful()) {
            throw new \RuntimeException(
                'Xendit payout failed: ' . $res->status() . ' ' . $res->body()
            );
        }

        return $res->json();
    }
}