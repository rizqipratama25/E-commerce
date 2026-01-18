<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'order_shipment_id',
        'product_id',
        'qty',
        'price',
        'total',
        'received_at'
    ];

    protected $casts = [
        'received_at' => 'datetime'
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function shipment() {
        return $this->belongsTo(OrderShipment::class, 'order_shipment_id');
    }
}
