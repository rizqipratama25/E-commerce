<?php

namespace Database\Seeders;

use App\Models\UrbanVillage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UrbanVillageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $urbanVillages = [
            [
                "name" => "Pulorejo",
                "post_code" => "61325",
                "province_id" => 1,
                "city_id" => 2,
                "district_id" => 1,
            ]
        ];

        foreach ($urbanVillages as $urbanVillage) {
            UrbanVillage::create($urbanVillage);
        }
    }
}
