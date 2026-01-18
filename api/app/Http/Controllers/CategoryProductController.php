<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CategoryProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request, string $path)
    {
        try {
            $sort = $request->query('sort', 'newest'); // newest | price_asc | price_desc
            $perPage = max(1, min(50, (int) $request->query('per_page', 12)));

            $minPrice = $request->query('min_price');
            $maxPrice = $request->query('max_price');

            $minPrice = is_null($minPrice) || $minPrice === '' ? null : (float) $minPrice;
            $maxPrice = is_null($maxPrice) || $maxPrice === '' ? null : (float) $maxPrice;

            if (!is_null($minPrice) && $minPrice < 0) {
                return $this->errorResponse("min_price must be >= 0", 422);
            }
            if (!is_null($maxPrice) && $maxPrice < 0) {
                return $this->errorResponse("max_price must be >= 0", 422);
            }
            if (!is_null($minPrice) && !is_null($maxPrice) && $minPrice > $maxPrice) {
                return $this->errorResponse("min_price cannot be greater than max_price", 422);
            }

            $cacheKey = 'category-products:' . md5($path . '|' . http_build_query($request->query()));

            $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($path, $sort, $perPage, $minPrice, $maxPrice) {
                $category = Category::query()
                    ->select(['id', 'name', 'path'])
                    ->where('path', $path)
                    ->where('is_active', true)
                    ->first();

                if (!$category) {
                    abort(404, 'Category not found');
                }

                // collect descendants
                $categoryIds = $this->collectDescendantIds($category->id);
                $categoryIds[] = $category->id;

                $query = Product::query()
                    ->with([
                        'thumbnail',
                        'category:id,name,path'
                    ])
                    ->select(['id', 'name', 'slug', 'price', 'stock', 'category_id', 'is_active', 'created_at'])
                    ->whereIn('category_id', $categoryIds)
                    ->where('is_active', true);

                if (!is_null($minPrice)) {
                    $query->where('price', '>=', $minPrice);
                }
                if (!is_null($maxPrice)) {
                    $query->where('price', '<=', $maxPrice);
                }

                if ($sort === 'price_asc') {
                    $query->orderBy('price', 'asc');
                } elseif ($sort === 'price_desc') {
                    $query->orderBy('price', 'desc');
                } else {
                    $query->latest();
                }

                $products = $query->paginate($perPage);

                return [
                    'category' => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'path' => $category->path,
                    ],
                    'filters' => [
                        'min_price' => $minPrice,
                        'max_price' => $maxPrice,
                        'sort' => $sort,
                        'per_page' => $perPage,
                    ],
                    'products' => $products,
                ];
            });

            return $this->successResponse($data, "Products retrieved successfully");
        } catch (HttpException $e) {
            return $this->errorResponse($e->getMessage(), $e->getStatusCode());
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve products", 500, $e->getMessage());
        }
    }

    private function collectDescendantIds(int $categoryId): array
    {
        $ids = [];
        $queue = [$categoryId];

        while (!empty($queue)) {
            $currentId = array_shift($queue);

            $children = Category::query()
                ->where('parent_id', $currentId)
                ->where('is_active', true)
                ->pluck('id')
                ->toArray();

            foreach ($children as $cid) {
                $ids[] = $cid;
                $queue[] = $cid;
            }
        }

        return $ids;
    }
}
