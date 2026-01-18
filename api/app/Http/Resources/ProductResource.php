<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "slug" => $this->slug,
            "price" => $this->price,
            "stock" => $this->stock,
            "is_active" => (bool) $this->is_active,

            "category" => $this->whenLoaded('category', fn() => [
                "id" => $this->category?->id,
                "name" => $this->category?->name,
                "path" => $this->category?->path,
            ]),

            'thumbnail' => $this->thumbnail ? [
                'id' => $this->thumbnail->id,
                'image' => $this->thumbnail->image,
            ] : null,
        ];
    }
}
