<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderShipment extends Model
{
    protected $fillable = [
        'order_id',
        'partner_id',
        'shipping_service_id',
        'shipping_cost',
        'status',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function shippingService()
    {
        return $this->belongsTo(ShippingService::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_shipment_id');
    }
}
