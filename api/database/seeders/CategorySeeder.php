<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Furnitur
        $furnitur = Category::create(["name" => "Furnitur"]);

        // Kursi
        $kursiParent = Category::create(["name" => "Kursi", "parent_id" => $furnitur->id]);
        $kursi = [
            [
                "name" => "Kursi Makan",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Kursi Berlengan",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Kursi Santai",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Kursi Goyang",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Stool dan Bangku",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Kursi Kantor",
                "parent_id" => $kursiParent->id
            ],
            [
                "name" => "Kursi Sekolah",
                "parent_id" => $kursiParent->id
            ],
        ];

        foreach ($kursi as $k) {
            Category::create($k);
        }

        $mejaParent = Category::create(["name" => "Meja", "parent_id" => $furnitur->id]);
        $meja = [
            [
                "name" => "Meja Makan",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Set Meja Makan",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Meja Tamu",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Meja Konsol dan Foyer",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Meja Sisi",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Meja Kantor",
                "parent_id" => $mejaParent->id
            ],
            [
                "name" => "Set Meja Sekolah",
                "parent_id" => $mejaParent->id
            ],
        ];

        foreach ($meja as $m) {
            Category::create($m);
        }

        $furniturDanPerlengkapanKantorParent = Category::create(["name" => "Furniture dan Perlengkapan Kantor", "parent_id" => $furnitur->id]);
        $fdpk = [
            [
                "name" => "Dekorasi Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Meja Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Laci Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Lemari Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Loker",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Tempat Sampah",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Brankas",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Lampu Meja",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Perlengkapan Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
            [
                "name" => "Alat tulis dan Kantor",
                "parent_id" => $furniturDanPerlengkapanKantorParent->id
            ],
        ];

        foreach ($fdpk as $f) {
            Category::create($f);
        }

        $sofaParent = Category::create(["name" => "Sofa", "parent_id" => $furnitur->id]);
        $sofa = [
            [
                "name" => "Sofa > 3 Dudukan",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa 2 Dudukan",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa 1 Dudukan",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Set Sofa",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa Sectional",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa Recliner",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa Bed",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Bean Bag",
                "parent_id" => $sofaParent->id
            ],
            [
                "name" => "Sofa Modular",
                "parent_id" => $sofaParent->id
            ],
        ];

        foreach ($sofa as $s) {
            Category::create($s);
        }

        $foParent = Category::create(["name" => "Furnitur Outdoor", "parent_id" => $furnitur->id]);
        $fo = [
            [
                "name" => "Kursi Outdoor",
                "parent_id" => $foParent->id
            ],
            [
                "name" => "Payung Taman dan Gazebo",
                "parent_id" => $foParent->id
            ],
            [
                "name" => "Meja Taman",
                "parent_id" => $foParent->id
            ],
            [
                "name" => "Kursi Taman",
                "parent_id" => $foParent->id
            ],
            [
                "name" => "Set Furnitur Outdoor",
                "parent_id" => $foParent->id
            ],
        ];

        foreach ($fo as $f) {
            Category::create($f);
        }

        $lampuParent = Category::create(["name" => "Lampu Indoor", "parent_id" => $furnitur->id]);
        $lampu = [
            [
                "name" => "Lampu Indoor",
                "parent_id" => $lampuParent->id
            ],
            [
                "name" => "Lampu untuk",
                "parent_id" => $lampuParent->id
            ],
        ];

        foreach ($lampu as $l) {
            Category::create($l);
        }

        $fabParent = Category::create(["name" => "Furnitur Anak & Bayi", "parent_id" => $furnitur->id]);
        $fab = [
            [
                "name" => "Kursi dan Set Meja Anak",
                "parent_id" => $fabParent->id
            ],
            [
                "name" => "Set Kamar Tidur Anak",
                "parent_id" => $fabParent->id
            ],
            [
                "name" => "Kursi Makan Bayi",
                "parent_id" => $fabParent->id
            ],
        ];

        foreach ($fab as $f) {
            Category::create($f);
        }

        $fssParent = Category::create(["name" => "Furnitur Salon & Spa", "parent_id" => $furnitur->id]);
        $fss = [
            [
                "name" => "Kursi Salon",
                "parent_id" => $fssParent->id
            ],
            [
                "name" => "Kursi Salon Beroda",
                "parent_id" => $fssParent->id
            ],
            [
                "name" => "Massage and Facial Bed",
                "parent_id" => $fssParent->id
            ],
            [
                "name" => "Kursi Keramas",
                "parent_id" => $fssParent->id
            ],
        ];

        foreach ($fss as $f) {
            Category::create($f);
        }

        $fkParent = Category::create(["name" => "Furnitur Komersial", "parent_id" => $furnitur->id]);
        Category::create(["name" => "Furnitur Area Publik", "parent_id" => $fkParent->id]);

        $rakDanPenyimpanan = Category::create(['name' => 'Rak dan Penyimpanan']);

        // rak
        $rakParent = Category::create(['name' => 'Rak', 'parent_id' => $rakDanPenyimpanan->id]);
        $rak = [
            [
                "name" => "Rak Buku",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Racking System",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Rak Dapur",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Rak Troll dan Rak Tingkat",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Rak Dinding",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Rak Besi",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Rak Sepatu",
                "parent_id" => $rakParent->id
            ],
        ];

        foreach ($rak as $r) {
            Category::create($r);
        }

        // Gantungan 
        $gantunganParent = Category::create(['name' => 'Gantungan', 'parent_id' => $rakDanPenyimpanan->id]);
        $gantungan = [
            [
                "name" => "Gantungan Baju",
                "parent_id" => $gantunganParent->id
            ],
            [
                "name" => "Hanger Baju",
                "parent_id" => $gantunganParent->id
            ],
            [
                "name" => "Jemuran",
                "parent_id" => $gantunganParent->id
            ],
        ];
        foreach($gantungan as $g) {
            Category::create($g);
        }

        // Keranjang
        $keranjangParent = Category::create(['name' => 'Keranjang', 'parent_id' => $rakDanPenyimpanan->id]);
        $keranjang = [
            [
                "name" => "Keranjang Pakaian",
                "parent_id" => $keranjangParent->id
            ],
            [
                "name" => "Keranjang Penyimpanan",
                "parent_id" => $keranjangParent->id
            ],
        ];
        foreach($keranjang as $k) {
            Category::create($k);
        }

        // Laci
        $laciParent = Category::create(['name' => 'Laci', 'parent_id' => $rakDanPenyimpanan->id]);
        $laci = [
            [
                "name" => "Laci Pakaian",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Laci Tempat Tidur",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Laci Kantor",
                "parent_id" => $rakParent->id
            ],
            [
                "name" => "Laci Serbaguna",
                "parent_id" => $rakParent->id
            ],
        ];

        // Lemari dan Loker
        $lemariDanLokerParent = Category::create(['name' => 'Lemari dan Loker', 'parent_id' => $rakDanPenyimpanan->id]);
        $lemariDanLoker = [
            [
                "name" => "",
                "parent_id" => $rakParent->id
            ],
        ];
    }
}
