<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'fullname' => $this->fullname,
            'photo_profile' => $this->photo_profile,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => "{$this->address[0]->urbanVillage->name}, {$this->address[0]->district->name}, {$this->address[0]->city->name}, {$this->address[0]->province->name}, {$this->address[0]->urbanVillage->post_code}"
        ];
    }
}
