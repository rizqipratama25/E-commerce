<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id',
        'label',
        'receiver',
        'phone',
        'province_id',
        'city_id',
        'district_id',
        'urban_village_id',
        'detail',
        'is_main_address'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function province() {
        return $this->belongsTo(Province::class);
    }

    public function city() {
        return $this->belongsTo(City::class);
    }

    public function district() {
        return $this->belongsTo(District::class);
    }

    public function urbanVillage() {
        return $this->belongsTo(UrbanVillage::class);
    }
}
