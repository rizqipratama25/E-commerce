<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;

use function Pest\Laravel\get;

class CategoryController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Cache::remember('categories', now()->addMinutes(5), function () {
                $categories = Category::query()
                    ->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                    ->whereNull('parent_id')
                    ->where('is_active' , true)
                    ->where('show_in_menu', true)
                    ->orderBy('sort_order')
                    ->with([
                        'children' => function ($q) {
                            $q->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                                ->where('is_active', true)
                                ->where('show_in_menu', true)
                                ->orderBy('sort_order')
                                ->with([
                                    'children' => function ($qq) {
                                        $qq->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                                            ->where('is_active', true)
                                            ->where('show_in_menu', true)
                                            ->orderBy('sort_order');
                                    }
                                ]);
                        }
                    ])
                    ->get();

                return $categories;
            });

            return $this->successResponse($data, "Category retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve category", 500, $e->getMessage());
        }
    }

    public function indexAdmin()
    {
        try {
            $data = Cache::remember('categories-admin', now()->addMinutes(5), function () {
                $categories = Category::query()
                    ->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                    ->whereNull('parent_id')
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->with([
                        'children' => function ($q) {
                            $q->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                                ->orderBy('sort_order')
                                ->orderBy('name')
                                ->with([
                                    'children' => function ($qq) {
                                        $qq->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                                            ->orderBy('sort_order')
                                            ->orderBy('name');
                                    }
                                ]);
                        }
                    ])
                    ->get();

                return $categories;
            });

            return $this->successResponse($data, "Category retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve category", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            if (Cache::has("categories")) Cache::forget("categories");
            if (Cache::has("categories-admin")) Cache::forget("categories-admin");

            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_active' => ['nullable', 'boolean'],
                'show_in_menu' => ['nullable', 'boolean'],
                'icon' => ['nullable', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
            ]);

            $category = Category::create([
                'name' => $data['name'],
                'parent_id' => $data['parent_id'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
                'show_in_menu' => $data['show_in_menu'] ?? true,
                'icon' => $data['icon'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            return $this->createdResponse(new CategoryResource($category), "Category created successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to store category", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        // 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            if (Cache::has("categories")) Cache::forget("categories");
            if (Cache::has("categories-admin")) Cache::forget("categories-admin");

            $data = $request->validate([
                'name' => ['sometimes', 'string', 'max:255'],
                'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'is_active' => ['sometimes', 'boolean'],
                'show_in_menu' => ['sometimes', 'boolean'],
                'icon' => ['sometimes', 'nullable', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
            ]);

            // optional: prevent parent_id = self
            if (array_key_exists('parent_id', $data) && $data['parent_id'] === $category->id) {
                return $this->errorResponse('parent_id cannot be self', 422);
            }

            $category->update($data);

            return $this->updatedResponse(new CategoryResource($category), "Category updated successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update category", 500, $e->getMessage());
        }
    }

    public function resolve(string $path)
    {
        try {
            $cacheKey = "category-resolve:$path";

            $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($path) {
                // 1) find category by path
                $category = Category::query()
                    ->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                    ->where('path', $path)
                    ->where('is_active', true)
                    ->first();

                if (!$category) {
                    abort(404, 'Category not found');
                }

                // 2) children (next level only)
                $children = Category::query()
                    ->select(['id', 'name', 'slug', 'path', 'parent_id', 'level', 'sort_order', 'is_active', 'show_in_menu'])
                    ->where('parent_id', $category->id)
                    ->where('is_active', true)
                    ->where('show_in_menu', true)
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get();

                // 3) breadcrumb (top -> current)
                $breadcrumb = $this->buildBreadcrumb($category);

                return [
                    'category' => $category,
                    'children' => $children,
                    'breadcrumb' => $breadcrumb,
                ];
            });

            return $this->successResponse($data, "Category resolved successfully");
        } catch (HttpException $e) {
            // abort(404) akan masuk sini
            return $this->errorResponse("Category not found", 404);
        } catch (Exception $e) {
            return $this->errorResponse("Failed to resolve category", 500, $e->getMessage());
        }
    }

    private function buildBreadcrumb(Category $category): array
    {
        // karena max 3 level, kita bisa simple tanpa recursion berat
        $breadcrumb = [];

        $current = $category;
        while ($current) {
            $breadcrumb[] = [
                'id' => $current->id,
                'name' => $current->name,
                'slug' => $current->slug,
                'path' => $current->path,
                'level' => $current->level,
            ];

            if (!$current->parent_id) break;

            $current = Category::query()
                ->select(['id', 'name', 'slug', 'path', 'parent_id', 'level'])
                ->where('id', $current->parent_id)
                ->first();
        }

        return array_reverse($breadcrumb);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        try {
            if (Cache::has("categories")) Cache::forget("categories");

            $category->delete();

            return $this->deletedResponse("Category deleted successfully");
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse("Resource not found");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to destroy category", 500, $e->getMessage());
        }
    }
}
