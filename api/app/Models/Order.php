<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'address_id',
        'subtotal',
        'shipping_service_id',
        'shipping_cost',
        'grand_total',
        'status',
        'payment_status',
        'escrow_status',
        'paid_at',
        'completed_at'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function shippingService() {
        return $this->belongsTo(ShippingService::class);
    }

    public function address() {
        return $this->belongsTo(Address::class);
    }

    public function payment() {
        return $this->hasOne(OrderPayment::class);
    }

    public function payouts() {
        return $this->hasMany(OrderPayout::class);
    }

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }

    public function shipments() {
        return $this->hasMany(OrderShipment::class);
    }
}
