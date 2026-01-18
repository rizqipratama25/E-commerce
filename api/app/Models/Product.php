<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use SoftDeletes, Searchable;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'stock',
        'product_specification',
        'product_information',
        'category_id',
        'partner_id',
        'is_active',
        'height',
        'width',
        'length',
        'weight'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function productCategories() // tambahan untuk breadcrumb/detail
    {
        return $this->belongsToMany(ProductCategory::class, 'product_product_category');
    }

    public function partner()
    {
        return $this->belongsTo(User::class, "partner_id");
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function thumbnail()
    {
        return $this->hasOne(ProductImage::class)->oldestOfMany();
    }

    public function toSearchableArray()
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'created_at' => $this->created_at->timestamp
        ];
    }
}
