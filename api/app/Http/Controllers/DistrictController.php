<?php

namespace App\Http\Controllers;

use App\Http\Resources\DistrictResource;
use App\Models\District;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DistrictController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $cityId = $request->query('city_id');

            if (!$cityId) {
                $data = Cache::tags('districts')->remember('districts:all', now()->addMinutes(30), function () {
                    $data = District::orderBy('name')->get();
                    return DistrictResource::collection($data)->resolve();
                });
                return $this->successResponse($data, "Districts retrieved successfully");
            }

            if (!is_numeric($cityId)) {
                return $this->errorResponse("city_id must be numeric", 422);
            }

            $cacheKey = "districts:city:$cityId";
            $data = Cache::tags('districts')->remember($cacheKey, now()->addMinutes(30), function () use ($cityId) {
                return District::where('city_id', $cityId)
                    ->orderBy('name')
                    ->get();
            });

            return $this->successResponse($data, "Districts retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve district", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Cache::tags('districts')->flush();

            $validate = $request->validate([
                "name" => "required|string|max:255",
                "province_id" => "required|integer|exists:provinces,id",
                "city_id" => "required|integer|exists:cities,id"
            ]);

            $districts = District::create($validate);
            return $this->createdResponse(new DistrictResource($districts), "District created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store district", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(District $district)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, District $district)
    {
        try {
            Cache::tags('districts')->flush();

            $validate = $request->validate([
                "name" => "sometimes|string|max:255|unique:districts,name",
                "province_id" => "sometimes|integer|exists:provinces,id",
                "city_id" => "sometimes|integer|exists:cities,id"
            ]);

            $district->update($validate);

            return $this->updatedResponse(new DistrictResource($district), "District updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update district", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(District $district)
    {
        try {
            Cache::tags('districts')->flush();

            $district->delete();

            return $this->deletedResponse("District deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete district", 500, $e->getMessage());
        }
    }
}
