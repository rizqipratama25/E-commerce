<?php

namespace Database\Seeders;

use App\Http\Controllers\ProductController;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (Product::where('slug', $slug)->withTrashed()->exists()) {
            $slug = $original . '-' . $count;
            $count++;
        }

        return $slug;
    }
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryKursiMakan = Category::where('path', 'furnitur/kursi/kursi-makan')->firstOrFail();
        $categoryMejaMakan = Category::where('path', 'furnitur/meja/meja-makan')->firstOrFail();
        $categorySofa3Dudukan = Category::where('path', 'furnitur/sofa/sofa-3-dudukan')->firstOrFail();
        $azko = User::where('fullname', 'AZKO')->firstOrFail();
        $selma = User::where('fullname', 'SELMA')->firstOrFail();

        $products = [
            [
                "name" => "Ashley Bolanburg Kursi Makan Fabric",
                "slug" => Str::slug("Ashley Bolanburg Kursi Makan Fabric"),
                "price" => 2199000.00,
                "stock" => 10,
                "partner_id" => $azko->id,
                "product_specification" => "- Merek tepercaya dari Amerika\n- Rangka kuat, kokoh, dan stabil",
                "product_information" => "Jadikan momen bersantap Anda lebih istimewa dengan Bolanburg Kursi Makan dari Ashley. Kursi bergaya vintage ini dapat menjadi aksen penguat dekorasi ruang makan Anda. Penggunaan material berkualitas dengan konstruksi rangka yang kokoh menghadirkan kenyamanan bagi Anda dan keluarga di waktu makan. Dapatkan segera dengan penawaran spesial hanya di ruparupa.com.",
                "category_id" => $categoryKursiMakan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
            [
                "name" => "Soleil Kursi Banquet Susun",
                "slug" => Str::slug("Soleil Kursi Banquet Susun"),
                "price" => 269910.00,
                "stock" => 11,
                "partner_id" => $azko->id,
                "product_specification" => "- Praktis dan serbaguna",
                "product_information" => "Praktis dan serbaguna untuk dipakai di berbagai kesempatan merupakan keunggulan dari kursi susun ini. Kursi ini terbuat dari material berkualitas dengan rangka yang kokoh. Dapat ditumpuk ataupun disusun saat tidak digunakan sehingga hemat ruang penyimpanan. Selain itu, kursi ini juga mudah dibersihkan dan praktis untuk penggunaan sehari-hari. Saatnya lengkapi koleksi furniture dari Soleil lainnya sekarang juga.",
                "category_id" => $categoryKursiMakan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
            [
                "name" => "Ashley Bolanburg Meja Makan",
                "slug" => Str::slug("Ashley Bolanburg Meja Makan"),
                "price" => 10299000.00,
                "stock" => 22,
                "partner_id" => $azko->id,
                "product_specification" => "- Rangka kuat, kokoh, dan stabil\n- Dilengkapi laci untuk menyimpan peralatan makan, tisu, dan sebagainya\n- Material top: kayu\n- Material kaki: kayu\n- Finishing: veneer\n- Top extendable: tidak",
                "product_information" => "Bolanburg Meja Makan dari Ashley ini hadir dengan desain bergaya vintage yang unik. Meja juga dilengkapi laci untuk menyimpan perlengkapan makan atau kebutuhan lainnya. Agar dapt menguatkan kesan vintage, padukan meja dengan kursi makan bergaya senada. Segera dapatkan produk berkualitas di ruparupa.com ini dengan rangkaian penawaran spesial.",
                "category_id" => $categoryMejaMakan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
            [
                "name" => "Selma Willa Kursi Makan Fabric",
                "slug" => Str::slug("Selma Willa Kursi Makan Fabric"),
                "price" => 299000.00,
                "stock" => 25,
                "partner_id" => $selma->id,
                "product_specification" => "- Memiliki kaki kursi yang stabil\n- Rangka kuat dan kokoh",
                "product_information" => "Tingkatkan tampilan ruang makan Anda dengan kursi makan yang menghadirkan kenyamanan dan kesan elegan dalam satu desain. Dilengkapi dudukan dan sandaran empuk untuk kenyamanan maksimal, serta kaki kursi yang stabil dengan rangka kuat dan kokoh. Kursi ini cocok digunakan di rumah, restoran, atau kafe yang mengutamakan kenyamanan dan estetika. Kursi makan ini adalah pilihan sempurna bagi Anda yang mencari kursi makan dengan tampilan elegan dan kualitas unggul.",
                "category_id" => $categoryKursiMakan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
            [
                "name" => "Selma Hana Set Meja Makan 2 Kursi",
                "slug" => Str::slug("Selma Hana Set Meja Makan 2 Kursi"),
                "price" => 699000.00,
                "stock" => 25,
                "partner_id" => $selma->id,
                "product_specification" => "- Desain Minimalis",
                "product_information" => "Lengkapi koleksi furnitur Anda dengan menghadirkan Hana set meja makan persembahan dari Selma. Set ini terdiri dari 1 pc meja makan dan 2 pcs kursi yang dirancang menggunakan material berkualitas sehingga rangka kokoh, stabil, dan awet. Cocok untuk memenuhi kebutuhan di hunian pribadi, kafe, restoran, atau area komersial lainnya. ",
                "category_id" => $categoryKursiMakan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
            [
                "name" => "Selma Tasyi Sofa Modular Sudut Fabric",
                "slug" => Str::slug("Selma Tasyi Sofa Modular Sudut Fabric"),
                "price" => 3999000.00,
                "stock" => 25,
                "partner_id" => $selma->id,
                "product_specification" => "- Kualitas dudukan dan sandaran yang empuk \n - Permukaan sofa yang nyaman",
                "product_information" => "Dapatkan kenyamanan maksimal di rumah Anda dengan Selma sofa modular sudut. Dilengkapi dengan dudukan dan sandaran yang empuk, serta permukaan sofa yang nyaman, membuat Anda nyaman duduk berlama-lama. Dibuat dengan rangka kuat, koko, dan stabil, dan dapat mengubah posisi bangku sesuai keinginan Anda (kanan-kiri). Cocok diletakkan di ruang tamu dan ruang keluarga, Selma sofa modular sudut adalah pilihan terbaik untuk meningkatkan kenyamanan dan keindahan interior rumah Anda.",
                "category_id" => $categorySofa3Dudukan->id,
                "height" => 100,
                "width" => 100,
                "length" => 100,
                "weight" => 100
            ],
        ];

        foreach($products as $product) {
            Product::create($product);
        }
    }
}
