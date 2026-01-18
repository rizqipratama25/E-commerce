<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->items ?? collect();

        $mapped = $items->map(function ($item) {
            $price = $item->price_snapshot ?? ($item->product?->price ?? 0);
            $lineTotal = (float) $price * (int) $item->qty;

            return [
                'id' => $item->id,
                'qty' => (int) $item->qty,
                'note' => $item->note,
                'price' => number_format((float)$price, 2, '.', ''),
                'line_total' => number_format((float)$lineTotal, 2, '.', ''),
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'stock' => (int) $item->product->stock,
                    'is_active' => (bool) $item->product->is_active,
                    'thumbnail' => $item->product->thumbnail ? [
                        'id' => $item->product->thumbnail->id,
                        'image' => $item->product->thumbnail->image,
                    ] : null,
                ] : null,
            ];
        })->values();

        $subtotal = $mapped->sum(fn ($i) => (float) $i['line_total']);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'items' => $mapped,
            'subtotal' => number_format((float)$subtotal, 2, '.', ''),
        ];
    }
}
