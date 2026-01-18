<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UrbanVillage extends Model
{
    protected $fillable = [
        'name',
        'post_code',
        'province_id',
        'city_id',
        'district_id'
    ];

    public function province() {
        return $this->belongsTo(Province::class);
    }

    public function city() {
        return $this->belongsTo(City::class);
    }

    public function district() {
        return $this->belongsTo(District::class);
    }
}
