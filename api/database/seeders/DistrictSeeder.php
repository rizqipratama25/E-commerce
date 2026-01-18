<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DistrictSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $districts = [
            [
                "name" => "Prajurit Kulon",
                "province_id" => 1,
                "city_id" => 2
            ],
            [
                "name" => "Magersari",
                "province_id" => 1,
                "city_id" => 2
            ],
        ];

        foreach ($districts as $district) {
            District::create($district);
        }
    }
}
