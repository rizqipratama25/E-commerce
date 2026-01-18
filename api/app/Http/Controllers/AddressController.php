<?php

namespace App\Http\Controllers;

use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AddressController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $data = Cache::remember('addresses', now()->addMinutes(5), function () use ($user) {
                $addresses = Address::where('user_id', $user->id)->with(['user', 'province', 'city', 'district', 'urbanVillage'])->latest()->get();

                return AddressResource::collection($addresses)->resolve();
            });

            return $this->successResponse($data, "Address retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve address", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("addresses")) Cache::forget("addresses");

            $validate = $request->validate([
                "label" => "required|string|max:35",
                "receiver" => "required|string|max:60",
                "phone" => "required|string|min:11|max:12",
                "province_id" => "required|integer|exists:provinces,id",
                "city_id" => "required|integer|exists:cities,id",
                "district_id" => "required|integer|exists:districts,id",
                "urban_village_id" => "required|integer|exists:urban_villages,id",
                "detail" => "required|string|max:350",
                ""
            ]);

            $validate["user_id"] = Auth::user()->id;

            $address = Address::create($validate);
            return $this->createdResponse(new AddressResource($address), "Address created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store address", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Address $address)
    {
        // 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Address $address)
    {
        try {
            if (Cache::has("addresses")) Cache::forget("addresses");

            $validate = $request->validate([
                "label" => "sometimes|string|max:35",
                "receiver" => "sometimes|string|max:60",
                "phone" => "sometimes|string|min:11|max:12",
                "province_id" => "sometimes|integer|exists:provinces,id",
                "city_id" => "sometimes|integer|exists:cities,id",
                "district_id" => "sometimes|integer|exists:districts,id",
                "urban_village_id" => "sometimes|integer|exists:urban_villages,id",
                "detail" => "sometimes|string|max:350"
            ]);

            $address->update($validate);

            return $this->updatedResponse(new AddressResource($address), "Address updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update address", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        try {
            if (Cache::has("addresses")) Cache::forget("addresses");

            $address->delete();

            return $this->deletedResponse("Address deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to destroy address", 500, $e->getMessage());
        }
    }
}
