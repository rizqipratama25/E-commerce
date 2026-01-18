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
                "service_code" => "REG",
                "service_name" => "Reguler",
                "estimation" => "2-3 hari",
                "base_price" => 10000,
                "price_per_kg" => 5000,
            ],
            [
                "courier_code" => "jne",
                "courier_name" => "JNE",
                "service_code" => "YES",
                "service_name" => "Yakin Esok Sampai",
                "estimation" => "1 hari",
                "base_price" => 18000,
                "price_per_kg" => 7000,
            ],
        ];

        foreach ($shippingServices as $shippingService) {
            ShippingService::create($shippingService);
        }
    }
}
