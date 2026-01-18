<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addresses = [
            [
                "user_id" => 2,
                "label" => "Rumah",
                "receiver" => "Rizqi Pratama",
                "phone" => "085791286376",
                "province_id" => 1,
                "city_id" => 2,
                "district_id" => 1,
                "urban_village_id" => 1,
                "detail" => "Detail address"
            ],
            [
                "user_id" => 3,
                "label" => "Kantor",
                "receiver" => "AZKO",
                "phone" => "0812345678",
                "province_id" => 1,
                "city_id" => 2,
                "district_id" => 1,
                "urban_village_id" => 1,
                "detail" => "Detail address"
            ],
            [
                "user_id" => 4,
                "label" => "Kantor",
                "receiver" => "SELMA",
                "phone" => "08124444444",
                "province_id" => 1,
                "city_id" => 2,
                "district_id" => 1,
                "urban_village_id" => 1,
                "detail" => "Detail address"
            ],
        ];

        foreach ($addresses as $address) {
            Address::create($address);
        }
    }
}
