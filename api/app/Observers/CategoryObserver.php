<?php

namespace App\Observers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryObserver
{
    private int $maxLevel = 4;

    public function creating(Category $category): void
    {
        $this->fillSlugLevelPath($category);
    }

    public function updating(Category $category): void
    {
        if ($category->isDirty(['name', 'parent_id'])) {
            $this->fillSlugLevelPath($category);
        }
    }

    public function updated(Category $category): void
    {
        if ($category->wasChanged(['slug', 'path', 'level'])) {
            $this->rebuildDescendants($category);
        }
    }

    public function saved(Category $category): void
    {
        Cache::forget('categories');
        Cache::tags(['categories'])->flush(); // optional kalau kamu pakai tags
    }

    public function deleted(Category $category): void
    {
        Cache::forget('categories');
        Cache::tags(['categories'])->flush(); // optional
    }

    private function fillSlugLevelPath(Category $category): void
    {
        $parent = null;

        if ($category->parent_id) {
            $parent = Category::query()
                ->select(['id', 'path', 'level'])
                ->whereNull('deleted_at')
                ->find($category->parent_id);

            if (!$parent) {
                throw new \RuntimeException("Parent category not found.");
            }
        }

        $level = $parent ? ($parent->level + 1) : 1;

        if ($level > $this->maxLevel) {
            throw new \RuntimeException("Category level max is {$this->maxLevel}.");
        }

        $category->level = $level;

        $baseSlug = Str::slug($category->name);
        $category->slug = $this->uniqueSlugPerParent($baseSlug, $category->parent_id, $category->id);

        $category->path = $parent ? "{$parent->path}/{$category->slug}" : $category->slug;
    }

    private function uniqueSlugPerParent(string $baseSlug, ?int $parentId, ?int $ignoreId = null): string
    {
        $slug = $baseSlug;
        $i = 2;

        while (
            Category::query()
                ->where('parent_id', $parentId)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->whereNull('deleted_at')
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function rebuildDescendants(Category $category): void
    {
        $children = Category::query()
            ->where('parent_id', $category->id)
            ->whereNull('deleted_at')
            ->get();

        foreach ($children as $child) {
            $child->level = $category->level + 1;

            if ($child->level > $this->maxLevel) {
                throw new \RuntimeException("Category level max is {$this->maxLevel}.");
            }

            $child->path = "{$category->path}/{$child->slug}";
            $child->saveQuietly();

            $this->rebuildDescendants($child); // recursive
        }
    }
}
