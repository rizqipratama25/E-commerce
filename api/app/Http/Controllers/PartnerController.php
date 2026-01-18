<?php

namespace App\Http\Controllers;

use App\Http\Resources\PartnerResource;
use App\Models\Address;
use App\Models\User;
use App\Traits\ApiResponse;
use Cloudinary\Cloudinary;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class PartnerController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Cache::remember('partners', now()->addMinutes(5), function () {
                $users = User::with([
                    'address.urbanVillage',
                    'address.district',
                    'address.city',
                    'address.province',
                ])->where('role', 'Partner')
                    ->latest()
                    ->get();

                return $users;
            });

            return $this->successResponse(PartnerResource::collection($data), "Users retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve users", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("partners")) Cache::forget("partners");

            $data = $request->validate([
                'username' => 'required|string|unique:users|max:255',
                'fullname' => 'required|string',
                'photo_profile' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
                'phone' => 'required|string|numeric',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',

                'address_province_id' => 'required|integer',
                'address_city_id' => 'required|integer',
                'address_district_id' => 'required|integer',
                'address_urban_village_id' => 'required|integer',
                'address_detail' => 'required|string|max:500',
            ]);

            return DB::transaction(function () use ($request, $data) {
                // normalize username
                $username = strtolower($data['username']);

                $file = $request->file('photo_profile');
                if (!$file || !$file->isValid()) {
                    return $this->errorResponse("Uploaded file is invalid", 422, [
                        'error' => $file?->getError(),
                        'message' => $file?->getErrorMessage(),
                    ]);
                }

                $path = $file->getRealPath();

                $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
                $result = $cloudinary->uploadApi()->upload($path, [
                    'folder' => 'urbanmart/photo_profiles',
                    'resource_type' => 'image',
                    'format' => 'webp',
                    'quality' => 'auto'
                ]);

                $secureUrl = $result['secure_url'] ?? null;
                $photoPath = $secureUrl;

                if (!$secureUrl) {
                    return $this->errorResponse("Cloudinary upload missing secure_url", 500, $result);
                }

                $partner = User::create([
                    'username' => $username,
                    'fullname' => $data['fullname'],
                    'photo_profile' => $photoPath,
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'Partner',
                ]);

                Address::create([
                    'user_id' => $partner->id,
                    'label' => 'Kantor',
                    'receiver' => $data['fullname'],
                    'phone' => $data['phone'],
                    'province_id' => $data['address_province_id'],
                    'city_id' => $data['address_city_id'],
                    'district_id' => $data['address_district_id'],
                    'urban_village_id' => $data['address_urban_village_id'],
                    'detail' => $data['address_detail'],
                ]);

                // return partner (kalau mau include address, load relasinya)
                return $this->successResponse($partner, "Partner created");
            });
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store partner", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $partner)
    {
        try {
            if (Cache::has("partners")) Cache::forget("partners");

            $partner->delete();

            return $this->deletedResponse("Partner deleted successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to destroy partner", 500, $e->getMessage());
        }
    }
}
