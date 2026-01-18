<?php

namespace App\Http\Controllers;

use App\Http\Resources\CityResource;
use App\Models\City;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $provinceId = $request->query('province_id');

            if (!$provinceId) {
                $data = Cache::remember('cities:all', now()->addMinutes(30), function () {
                    return City::orderBy('name')->get();
                });
                return $this->successResponse($data, "Cities retrieved successfully");
            }

            if (!is_numeric($provinceId)) {
                return $this->errorResponse("province_id must be numeric", 422);
            }

            $cacheKey = "cities:province:$provinceId";
            $data = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($provinceId) {
                return City::where('province_id', $provinceId)
                    ->orderBy('name')
                    ->get();
            });

            return $this->successResponse($data, "Cities retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve city", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("cities")) Cache::forget("cities");

            $validate = $request->validate([
                "name" => "required|string|max:255|unique:cities,name",
                "province_id" => "required|integer|exists:provinces,id"
            ]);

            $cities = City::create($validate);
            return $this->createdResponse(new CityResource($cities), "City created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store city", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(City $city)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, City $city)
    {
        try {
            if (Cache::has("cities")) Cache::forget("cities");

            $validate = $request->validate([
                "name" => "sometimes|string|max:255|unique:cities,name,{$city->id}",
                "province_id" => "sometimes|integer|exists:provinces,id"
            ]);

            $city->update($validate);

            return $this->updatedResponse(new CityResource($city), "City updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update city", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city)
    {
        try {
            if (Cache::has("cities")) Cache::forget("cities");

            $city->delete();

            return $this->deletedResponse("City deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete city", 500, $e->getMessage());
        }
    }
}
