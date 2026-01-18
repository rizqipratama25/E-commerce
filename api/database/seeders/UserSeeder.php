<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                "username" => "admin",
                "fullname" => "Admin",
                "photo_profile" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768020264/urbanmart/photo_profiles/n2901jt1gazhjjnuoipr.webp",
                "phone" => "08123456789",
                "role" => "Admin",
                "email" => "admin@urbanmart.com",
                "password" => Hash::make("admin123")
            ],
            [
                "username" => "rama",
                "fullname" => "Rizqi Pratama",
                "photo_profile" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768020264/urbanmart/photo_profiles/n2901jt1gazhjjnuoipr.webp",
                "phone" => "085791286376",
                "role" => "Buyer",
                "email" => "rizprat2508@gmail.com",
                "password" => Hash::make("rama123")
            ],
            [
                "username" => "azko",
                "fullname" => "AZKO",
                "photo_profile" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768022246/urbanmart/photo_profiles/akmmmjiu5ozbi26u448w.webp",
                "phone" => "08123333333",
                "role" => "Partner",
                "email" => "azko@urbanmart.com",
                "password" => Hash::make("azko123")
            ],
            [
                "username" => "selma",
                "fullname" => "SELMA",
                "photo_profile" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768149565/urbanmart/photo_profiles/l1dro6biw5j5vkckxqaj.webp",
                "phone" => "08124444444",
                "role" => "Partner",
                "email" => "selma@urbanmart.com",
                "password" => Hash::make("selma123")
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
