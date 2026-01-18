<?php

namespace App\Http\Controllers;

use App\Models\ProductImage;
use App\Traits\ApiResponse;
use Cloudinary\Cloudinary;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ProductImageController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Cache::forget("products");
            Cache::forget("product-images");

            $request->validate([
                "image" => "required|image|mimes:jpg,jpeg,png,webp",
                "product_id" => "nullable|integer|exists:products,id"
            ]);

            if (
                $request->filled('product_id') &&
                ProductImage::where('product_id', $request->product_id)->count() >= 5
            ) {
                return $this->errorResponse('The maximum number of images allowed is 5', 400);
            }

            $file = $request->file('image');
            if (!$file || !$file->isValid()) {
                return $this->errorResponse("Uploaded file is invalid", 422, [
                    'error' => $file?->getError(),
                    'message' => $file?->getErrorMessage(),
                ]);
            }

            $path = $file->getRealPath();

            $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
            $result = $cloudinary->uploadApi()->upload($path, [
                'folder' => 'urbanmart/product_images',
                'resource_type' => 'image',
                'format' => 'webp',
                'quality' => 'auto'
            ]);

            $secureUrl = $result['secure_url'] ?? null;
            $publicId  = $result['public_id'] ?? null;

            if (!$secureUrl) {
                return $this->errorResponse("Cloudinary upload missing secure_url", 500, $result);
            }

            $productImage = ProductImage::create([
                'image' => $secureUrl,
                'product_id' => $request->product_id,
                // kalau kamu mau simpan juga:
                // 'public_id' => $publicId,
            ]);

            return $this->createdResponse($productImage, "Product image created successfully");
        } catch (\Throwable $e) {
            return $this->errorResponse("Failed to store product image", 500, $e->getMessage());
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(ProductImage $productImage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductImage $productImage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductImage $productImage)
    {
        //
    }
}
