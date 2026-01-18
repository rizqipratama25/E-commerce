<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StatusController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Cache::remember('statuses', now()->addMinutes(5), function () {
                $statuses = Status::latest()->get();

                return $statuses;
            });

            return $this->successResponse($data, "Status retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve status", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("statuses")) Cache::forget("statuses");

            $validate = $request->validate([
                "status" => "required|string|max:255|unique:statuses,status",
            ]);

            $status = Status::create($validate);
            return $this->createdResponse($status, "Status created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store status", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Status $status)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Status $status)
    {
        try {
            if (Cache::has("statuses")) Cache::forget("statuses");

            $validate = $request->validate([
                "status" => "required|string|max:255|unique:statuses,status,{$status->id}",
            ]);

            $status->update($validate);

            return $this->updatedResponse($status, "Status updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update status", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Status $status)
    {
        try {
            if (Cache::has("statuses")) Cache::forget("statuses");

            $status->delete();

            return $this->deletedResponse("Status deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to destroy status", 500, $e->getMessage());
        }
    }
}
