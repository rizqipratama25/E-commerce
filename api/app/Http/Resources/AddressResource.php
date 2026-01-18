<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
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
            "user" => $this->user->username ?? null,
            "user_id" => $this->user_id ?? null,
            "label" => $this->label,
            "receiver" => $this->receiver,
            "phone" => $this->phone,
            "province_id" => $this->province_id ?? null,
            "city_id" => $this->city_id ?? null,
            "district_id" => $this->district_id ?? null,
            "urban_village_id" => $this->urbanVillage->id ?? null,
            "province" => $this->province->name ?? null,
            "city" => $this->city->name ?? null,
            "district" => $this->district->name ?? null,
            "urban_village" => $this->urbanVillage->name ?? null,
            "post_code" => $this->urbanVillage->post_code ?? null,
            "detail" => $this->detail,
        ];
    }
}
