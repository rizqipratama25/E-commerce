<?php

namespace Database\Seeders;

use App\Models\ProductImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $images = [
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407460/urbanmart/product_images/xeg3mfwkk4s2bqtfo1ho.webp",
                "product_id" => 1
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407464/urbanmart/product_images/fdsgocicsdit5aehkdb6.webp",
                "product_id" => 1
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407469/urbanmart/product_images/xqxznnfcqpesexyb76sk.webp",
                "product_id" => 1
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407473/urbanmart/product_images/levjxeybfn4wruji59wi.webp",
                "product_id" => 1
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407817/urbanmart/product_images/siadmo4i2lgq3ie4dnlj.webp",
                "product_id" => 2
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407822/urbanmart/product_images/ccczq3nt39humtfgvmb9.webp",
                "product_id" => 2
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407825/urbanmart/product_images/bt1schmkyacv0srlgehr.webp",
                "product_id" => 2
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407829/urbanmart/product_images/jyn14l59uatqhk4vhv2m.webp",
                "product_id" => 2
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768407833/urbanmart/product_images/a0hos2le8dne3ujzjugy.webp",
                "product_id" => 2
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768408117/urbanmart/product_images/wmujld7im8vbokd7dtfw.webp",
                "product_id" => 3
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768408120/urbanmart/product_images/xgoslsc7cgpow7bfg7rk.webp",
                "product_id" => 3
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768408127/urbanmart/product_images/tatdl5zbmbkd3oe62gsf.webp",
                "product_id" => 3
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768408132/urbanmart/product_images/okrgvewtiqpjmyzzjnas.webp",
                "product_id" => 3
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768531239/urbanmart/product_images/mhqfh0ieyvutyp0h9jlc.webp",
                "product_id" => 4
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768531242/urbanmart/product_images/p8orx0iliehllxmufqi2.webp",
                "product_id" => 4
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768531247/urbanmart/product_images/ishp8wgyzsb33t4yachk.webp",
                "product_id" => 4
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768531251/urbanmart/product_images/jzcscukcd8vyonbblikl.webp",
                "product_id" => 4
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768532432/urbanmart/product_images/ojgjmun9luppyxipahkq.webp",
                "product_id" => 5
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768532438/urbanmart/product_images/aj94p3hbuinh5a2e78qj.webp",
                "product_id" => 5
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768532446/urbanmart/product_images/tjzrrsqjmpiylmyvng7j.webp",
                "product_id" => 5
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768532450/urbanmart/product_images/jkn8mnofdun9csyygabd.webp",
                "product_id" => 5
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768532454/urbanmart/product_images/mw6hpuu6a2o2re1yndrv.webp",
                "product_id" => 5
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768754359/10539375_1_jrqkig.webp",
                "product_id" => 6
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768754359/10539375_5_erini6.webp",
                "product_id" => 6
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768754358/10539375_3_irfq85.webp",
                "product_id" => 6
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768754358/10539375_4_h9665y.webp",
                "product_id" => 6
            ],
            [
                "image" => "https://res.cloudinary.com/dvpxtt7dk/image/upload/v1768754358/10539375_2_scktl8.webp",
                "product_id" => 6
            ],
        ];

        foreach ($images as $image) {
            ProductImage::create($image);
        }
    }
}
