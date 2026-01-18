<?php

namespace App\Http\Controllers;

use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PartnerAddressController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $data = Cache::remember("partner-address-$userId", now()->addMinutes(5), function () use ($userId) {
                $address = Address::with(['province', 'city', 'district', 'urbanVillage'])
                    ->where('user_id', $userId)
                    ->first();
                return $address;
            });
            return $this->successResponse(new AddressResource($data), "Address retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to get address", 500, $e->getMessage());
        }
    }

    public function update(Request $request)
    {
        try {
            $userId = $request->user();

            $data = $request->validate([
                'province_id' => 'required|integer',
                'city_id' => 'required|integer',
                'district_id' => 'required|integer',
                'urban_village_id' => 'required|integer',
                'detail' => 'required|string|max:500',
            ]);

            $address = Address::where('user_id', $userId->id)->first();
            $address->update([
                'province_id' => $data['province_id'],
                'city_id' => $data['city_id'],
                'district_id' => $data['district_id'],
                'urban_village_id' => $data['urban_village_id'],
                'detail' => $data['detail'],
            ]);

            Cache::forget("partner-address-$userId");

            return $this->successResponse(
                $address->load(['province', 'city', 'district', 'urbanVillage']),
                "Address updated successfully"
            );
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update address", 500, $e->getMessage());
        }
    }
}
