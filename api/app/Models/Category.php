<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'path',
        'parent_id',
        'level',
        'sort_order',
        'is_active',
        'show_in_menu',
        'icon',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_menu' => 'boolean',
        'level' => 'integer',
        'sort_order' => 'integer',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function breadcrumb(): array
    {
        $items = [];
        $current = $this;

        // aman: stop kalau cycle/ga wajar
        $guard = 0;

        while ($current && $guard < 20) {
            $items[] = [
                'id' => $current->id,
                'name' => $current->name,
                'slug' => $current->slug,
                'path' => $current->path,
                'level' => $current->level,
            ];

            $current = $current->parent; // butuh relasi parent()
            $guard++;
        }

        return array_reverse($items);
    }
}
