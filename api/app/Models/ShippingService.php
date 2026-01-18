<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingService extends Model
{
    protected $fillable = [
        'courier_code',
        'courier_name',
        'service_code',
        'service_name',
        'estimation',
        'base_price',
        'price_per_kg',
        'is_active'
    ];
}
