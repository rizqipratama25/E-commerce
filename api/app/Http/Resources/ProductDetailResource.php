<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        $category = $this->whenLoaded('category');

        return [
            "id" => $this->id,
            "name" => $this->name,
            "slug" => $this->slug,
            "price" => $this->price,
            "stock" => $this->stock,
            "product_specification" => $this->product_specification,
            "product_information" => $this->product_information,

            "is_active" => (bool) $this->is_active,

            "category" => $category ? [
                "id" => $category->id,
                "name" => $category->name,
                "slug" => $category->slug,
                "path" => $category->path,
                "level" => $category->level,
            ] : null,

            "category_breadcrumb" => $category ? $category->breadcrumb() : [],

            "partner" => $this->whenLoaded('partner', function () {
                return [
                    "id" => $this->partner?->id,
                    "fullname" => $this->partner?->fullname,
                    "photo_profile" => $this->partner?->photo_profile,
                ];
            }),

            "images" => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($img) => [
                    "id" => $img->id,
                    "image" => $img->image,
                ])->values();
            }),

            "height" => $this->height,
            "width" => $this->width,
            "length" => $this->length,
            "weight" => $this->weight,
        ];
    }
}
