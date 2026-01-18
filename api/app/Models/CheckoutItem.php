<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutItem extends Model
{
    protected $fillable = [
        'checkout_session_id',
        'product_id',
        'qty',
        'price_snapshot'
    ];

    public function checkout() {
        return $this->belongsTo(CheckoutSession::class, 'checkout_session_id');
    }

    public function product() {
        return $this->belongsTo(Product::class);
    }
}
