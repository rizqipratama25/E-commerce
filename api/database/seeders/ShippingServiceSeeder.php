<?php

namespace Database\Seeders;

use App\Models\ShippingService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShippingServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shippingServices = [
            [
                "courier_code" => "jne",
                "courier_name" => "JNE",
                "service_code" => "JTR",
                "service_name" => "JTR",
                "estimation" => "4-5 hari",
                "base_price" => 20000,
                "price_per_kg" => 5000,
            ],
            [
                "courier_code" => "anteraja",
                "courier_name" => "AnterAja",
                "service_code" => "Cargo",
                "service_name" => "Cargo",
                "estimation" => "6 hari",
                "base_price" => 20000,
                "price_per_kg" => 7000,
            ],
        ];

        foreach ($shippingServices as $shippingService) {
            ShippingService::create($shippingService);
        }
    }
}
