<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('orderItems') ? $this->orderItems : collect();

        return [
            'order_id' => $this->id,
            'customer' => $this->whenLoaded('user', fn() => $this->user?->fullname),

            'subtotal' => $this->subtotal,
            'shipping_cost' => $this->shipping_cost,
            'grand_total' => $this->grand_total,

            'shipping_service' => $this->whenLoaded('shippingService', function () {
                $s = $this->shippingService;
                return $s ? "{$s->courier_name} ({$s->service_code})" : null;
            }),

            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'paid_at' => $this->paid_at,
            'completed_at' => $this->completed_at,

            'shipments' => $this->whenLoaded('shipments', function () {
                return $this->shipments->map(function ($s) {
                    $itemsSubtotal = (float) $s->items->sum(fn($it) => (float) $it->total);

                    return [
                        'shipment_id' => $s->id,
                        'partner_id' => $s->partner_id,
                        'partner_name' => $s->partner?->fullname,

                        'status' => $s->status,

                        'shipping_service' => $s->shippingService
                            ? "{$s->shippingService->courier_name} ({$s->shippingService->service_code})"
                            : null,

                        'shipping_cost' => (float) $s->shipping_cost,

                        // ✅ INI YANG KAMU BUTUH UNTUK PARTNER
                        'items_subtotal' => $itemsSubtotal,
                        'items_count' => (int) $s->items->sum(fn($it) => (int) $it->qty),

                        // opsional: kalau mau tampil total yang harus dibayar untuk shipment ini
                        'shipment_total' => $itemsSubtotal + (float) $s->shipping_cost,

                        'items' => $s->items->map(function ($item) {
                            $product = $item->product;

                            return [
                                'order_item_id' => $item->id,
                                'qty' => (int) $item->qty,
                                'price' => $item->price,
                                'line_total' => $item->total,
                                'received_at' => $item->received_at,
                                'product' => $product ? [
                                    'id' => $product->id,
                                    'name' => $product->name,
                                    'slug' => $product->slug,
                                    'image' => $product->thumbnail?->image
                                        ?? optional($product->images->first())->image
                                        ?? null,
                                    'supplier' => $product->partner?->fullname,
                                ] : null,
                            ];
                        })->values(),
                    ];
                })->values();
            }),
        ];
    }
}
