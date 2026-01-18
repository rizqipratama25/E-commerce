<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutSession extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'status',
        'expires_at'
    ];

    public function items() {
        return $this->hasMany(CheckoutItem::class);
    }
}
