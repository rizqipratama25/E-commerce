<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProvinceController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Cache::tags('provinces')->remember('provinces', now()->addMinutes(5), function () {
                $provinces = Province::latest()->get();
                return $provinces;
            });

            return $this->successResponse($data, "Province retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve province", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Cache::tags('provinces')->flush();

            $validate = $request->validate([
                "name" => "required|string|max:255|unique:provinces,name"
            ]);

            $province = Province::create($validate);
            return $this->createdResponse($province, "Province created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store province", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Province $province)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Province $province)
    {
        try {
            Cache::tags('provinces')->flush();

            $validate = $request->validate([
                "name" => "required|string|max:255|unique:provinces,name,{$province->id}"
            ]);

            $province->update($validate);

            return $this->updatedResponse($province, "Province updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update province", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Province $province)
    {
        try {
            Cache::tags('provinces')->flush();

            $province->delete();

            return $this->deletedResponse("Province deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete province", 500, $e->getMessage());
        }
    }
}
