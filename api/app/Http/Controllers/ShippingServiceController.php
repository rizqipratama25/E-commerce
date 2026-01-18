<?php

namespace App\Http\Controllers;

use App\Models\ShippingService;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ShippingServiceController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Cache::tags(['shipping-service'])->remember('shipping-services', now()->addMinutes(5), function () {
                $shippingServices = ShippingService::latest()->get();
                return $shippingServices;
            });

            return $this->successResponse($data, "Shipping service retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve shipping service", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Cache::tags(['shipping-service'])->flush();

            $validate = $request->validate([
                "courier_code" => "required|string|max:255",
                "courier_name" => "required|string|max:255",
                "service_code" => "required|string|max:255",
                "service_name" => "required|string|max:255",
                "estimation" => "required|string|max:255",
                "base_price" => "required|decimal:0,2",
                "price_per_kg" => "required|decimal:0,2",
                "is_active" => "sometimes|boolean"
            ]);

            $shippingServices = ShippingService::create($validate);
            return $this->createdResponse($shippingServices, "Shipping service created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store shipping service", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ShippingService $shippingService)
    {
        // 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShippingService $shippingService)
    {
        try {
            Cache::tags(['shipping-service'])->flush();

            $validate = $request->validate([
                "courier_code" => "sometimes|string|max:255",
                "courier_name" => "sometimes|string|max:255",
                "service_code" => "sometimes|string|max:255",
                "service_name" => "sometimes|string|max:255",
                "estimation" => "sometimes|string|max:255",
                "base_price" => "sometimes|decimal:0,2",
                "price_per_kg" => "sometimes|decimal:0,2",
                "is_active" => "sometimes|boolean"
            ]);

            $shippingService->update($validate);

            return $this->updatedResponse($shippingService, "Shipping service updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update shipping service", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ShippingService $shippingService)
    {
        try {
            Cache::tags(['shipping-service'])->flush();

            $shippingService->delete();

            return $this->deletedResponse("Shipping service deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete shipping service", 500, $e->getMessage());
        }
    }
}
