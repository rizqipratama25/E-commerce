<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'balance_after',
        'reference_type',
        'reference_id',
        'description',
        'meta'
    ];

    protected $casts = ['meta' => 'array'];

    public function wallet() {
        return $this->belongsTo(Wallet::class);
    }
}
