<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPayout extends Model
{
    protected $fillable = [
        'order_id',
        'order_shipment_id',
        'recipient_type',
        'recipient_user_id',
        'amount',
        'status',
        'release_scheduled_at',
        'released_at',
        'provider',
        'external_id',
        'payout_id',
        'reference_id',
        'payload',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function recipientUser() {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function shipment() {
        return $this->belongsTo(OrderShipment::class, 'order_shipment_id');
    }
}
