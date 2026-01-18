<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $name = trim((string) $request->get('name', ''));

            $minPrice = $request->filled('min_price') ? (float) $request->get('min_price') : null;
            $maxPrice = $request->filled('max_price') ? (float) $request->get('max_price') : null;

            // normalize if min > max
            if (!is_null($minPrice) && !is_null($maxPrice) && $minPrice > $maxPrice) {
                [$minPrice, $maxPrice] = [$maxPrice, $minPrice];
            }

            $cacheKey = 'products:' . md5(json_encode([
                'name' => $name,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
            ]));

            $data = Cache::tags(['product'])->remember($cacheKey, now()->addMinutes(5), function () use ($name, $minPrice, $maxPrice) {

                // ===== CASE 1: no search keyword -> normal DB query
                if ($name === '') {
                    $q = Product::query()
                        ->with(['category', 'partner'])
                        ->latest();

                    if (!is_null($minPrice)) $q->where('price', '>=', $minPrice);
                    if (!is_null($maxPrice)) $q->where('price', '<=', $maxPrice);

                    $products = $q->get();

                    return ProductResource::collection($products)->resolve();
                }

                // ===== CASE 2: search keyword -> Typesense/Scout
                $filters = [];

                if (!is_null($minPrice)) $filters[] = "price:>={$minPrice}";
                if (!is_null($maxPrice)) $filters[] = "price:<={$maxPrice}";

                $options = [];
                if (!empty($filters)) {
                    // Typesense expects "&&" for AND
                    $options['filter_by'] = implode(' && ', $filters);
                }

                $search = Product::search($name);

                if (!empty($options)) {
                    $search = $search->options($options);
                }

                $products = $search->get();

                $products->load(['category', 'partner']);

                return ProductResource::collection($products)->resolve();
            });

            return $this->successResponse($data, "Product retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve product", 500, $e->getMessage());
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Cache::tags(['product'])->flush();

            $validate = $request->validate([
                "name" => "required|string|max:255",
                "price" => "required|decimal:0,2",
                "stock" => "required|integer",
                "product_specification" => "required|string",
                "product_information" => "required|string",
                "category_id" => "required|integer|exists:categories,id",
                "is_active" => "sometimes|boolean",
                "height" => "required|integer",
                "width" => "required|integer",
                "length" => "required|integer",
                "weight" => "required|integer"
            ]);

            $validate["partner_id"] = Auth::user()->id;
            $validate["slug"] = $this->generateUniqueSlug($request->name);

            $product = Product::create($validate);

            $product->load([
                'category',
                'partner',
                'images',
            ]);

            return $this->createdResponse(new ProductDetailResource($product), "Product created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store product", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        try {
            $data = Cache::tags(['product'])->remember(
                'product-detail-' . $product->id,
                now()->addMinutes(5),
                function () use ($product) {
                    $product->load([
                        'images:id,product_id,image',
                        'partner:id,fullname,photo_profile',
                        'category:id,name,slug,path,parent_id,level',
                        'category.parent:id,name,slug,path,parent_id,level',
                        'category.parent.parent:id,name,slug,path,parent_id,level',
                        'category.parent.parent.parent:id,name,slug,path,parent_id,level',
                        'category.parent.parent.parent.parent:id,name,slug,path,parent_id,level',
                    ]);

                    return new ProductDetailResource($product);
                }
            );

            return $this->successResponse($data, "Product detail retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve product detail", 500, $e->getMessage());
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        try {
            Cache::tags(['product'])->flush();

            $validate = $request->validate([
                "name" => "sometimes|string|max:255",
                "price" => "sometimes|decimal:0,2",
                "stock" => "sometimes|integer",
                "product_specification" => "required|string",
                "product_information" => "required|string",
                "category_id" => "sometimes|integer|exists:categories,id",
                "is_active" => "sometimes|boolean",
                "height" => "sometimes|integer",
                "width" => "sometimes|integer",
                "length" => "sometimes|integer",
                "weight" => "sometimes|integer"
            ]);

            if ($request->name) {
                $validate["slug"] = $this->generateUniqueSlug($request->name);
            }

            $product->load([
                'category',
                'partner',
                'images',
            ]);

            $product->update($validate);
            return $this->updatedResponse(new ProductDetailResource($product), "Product updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update product", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            Cache::tags(['product'])->flush();

            $product->delete();

            return $this->deletedResponse("Product deleted successfully");
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse("Resource not found");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to destroy category", 500, $e->getMessage());
        }
    }

    public function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (Product::where('slug', $slug)->withTrashed()->exists()) {
            $slug = $original . '-' . $count;
            $count++;
        }

        return $slug;
    }

    public function indexPartner(Request $request)
    {
        try {
            $user = $request->user();
            $userId = $user->id;

            $data = Cache::tags(["product"])->remember("products-$userId", now()->addMinutes(5), function () use ($userId) {
                $product = Product::with(['category', 'partner'])->where('partner_id', $userId)->latest()->get();

                return ProductResource::collection($product)->resolve();
            });

            return $this->successResponse($data, "Product retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve product", 500, $e->getMessage());
        }
    }
}
