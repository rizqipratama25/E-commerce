<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DistrictResource extends JsonResource
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
            "province_id" => $this->province_id ?? null,
            "city_id" => $this->city_id ?? null,
            "province" => $this->province->name ?? null,
            "city" => $this->city->name ?? null
        ];
    }
}
