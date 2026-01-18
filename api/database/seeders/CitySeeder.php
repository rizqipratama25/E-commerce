<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            [
                "name" => "Surabaya",
                "province_id" => 1
            ],
            [
                "name" => "Mojokerto",
                "province_id" => 1
            ],
            [
                "name" => "Madiun",
                "province_id" => 1
            ],
        ];

        foreach($cities as $city) {
            City::create($city);
        }
    }
}
