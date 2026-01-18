<?php

namespace App\Http\Controllers;

use App\Http\Resources\UrbanVillageResource;
use App\Models\UrbanVillage;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UrbanVillageController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $districtId = $request->query('district_id');

            if (!$districtId) {
                $data = Cache::remember('urban-villages:all', now()->addMinutes(30), function () {
                    return UrbanVillage::orderBy('name')->get();
                });
                return $this->successResponse($data, "Urban villages retrieved successfully");
            }

            if (!is_numeric($districtId)) {
                return $this->errorResponse("district_id must be numeric", 422);
            }

            $cacheKey = "urban-villages:district:$districtId";
            $data = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($districtId) {
                return UrbanVillage::where('district_id', $districtId)
                    ->orderBy('name')
                    ->get();
            });

            return $this->successResponse($data, "Urban villages retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve urban village", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("urban-villages")) Cache::forget("urban-villages");

            $validate = $request->validate([
                "name" => "required|string|max:255",
                "post_code" => "required|string|max:5",
                "province_id" => "required|integer|exists:provinces,id",
                "city_id" => "required|integer|exists:cities,id",
                "district_id" => "required|integer|exists:districts,id"
            ]);

            $urbanVillage = UrbanVillage::create($validate);
            return $this->createdResponse(new UrbanVillageResource($urbanVillage), "Urban village created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store urban village", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(UrbanVillage $urbanVillage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UrbanVillage $urbanVillage)
    {
        try {
            if (Cache::has("urban-villages")) Cache::forget("urban-villages");

            $validate = $request->validate([
                "name" => "sometimes|string|max:255",
                "post_code" => "sometimes|string|max:5",
                "province_id" => "sometimes|integer|exists:provinces,id",
                "city_id" => "sometimes|integer|exists:cities,id",
                "district_id" => "sometimes|integer|exists:districts,id"
            ]);

            $urbanVillage->update($validate);

            return $this->updatedResponse(new UrbanVillageResource($urbanVillage), "Urban village updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update urban village", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UrbanVillage $urbanVillage)
    {
        try {
            if (Cache::has("urban-villages")) Cache::forget("urban-villages");

            $urbanVillage->delete();

            return $this->deletedResponse("Urban village deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete urban village", 500, $e->getMessage());
        }
    }
}
