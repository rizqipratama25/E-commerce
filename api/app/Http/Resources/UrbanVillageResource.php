<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UrbanVillageResource extends JsonResource
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
            "post_code" => $this->post_code,
            "province_id" => $this->province->id ?? null,
            "city_id" => $this->city->id ?? null,
            "district_id" => $this->district->id ?? null,
            "province" => $this->province->name ?? null,
            "city" => $this->city->name ?? null,
            "district" => $this->district->name ?? null,
        ];
    }
}
