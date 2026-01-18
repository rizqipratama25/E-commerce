<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    protected $fillable = [
        'order_id',
        'provider',
        'status',
        'external_id',
        'reference',
        'payment_type',
        'payment_method',
        'payment_url',
        'expired_at',
        'paid_at',
        'payload'
    ];

    protected $casts = [
        'payload' => 'array',
        'expired_at' => 'datetime',
        'paid_at' => 'datetime'
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }
}
