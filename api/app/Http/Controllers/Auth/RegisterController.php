<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Cloudinary\Cloudinary;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Testing\Fluent\Concerns\Has;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class RegisterController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|unique:users|max:255',
                'fullname' => 'required|string',
                'photo_profile' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'phone' => 'required|string|numeric',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'nullable|string|in:Admin,Partner,Buyer'
            ]);

            $photoPath = "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768020264/urbanmart/photo_profiles/n2901jt1gazhjjnuoipr.webp";

            if ($request->hasFile('photo_profile')) {
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
            }

            $user = User::create([
                'username' => strtolower($request->username),
                'fullname' => $request->fullname,
                'photo_profile' => $photoPath,
                'phone' => $request->phone,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'Buyer'
            ]);

            $token = $user->createToken('api-token')->plainTextToken;
            $user['token'] = $token;

            return $this->successResponse($user, "User registered successfully");
        } catch (Exception $e) {
            return $this->errorResponse('Failed to register user', 500, $e->getMessage());
        }
    }
}
