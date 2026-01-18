<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
             $table->id();

            // contoh: "Kursi Tamu"
            $table->string('name');
            $table->string('slug');

            // kalau kamu mau hierarchy juga, boleh pakai parent_id
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();

            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index(['parent_id', 'sort_order']);
            $table->unique('slug'); // cukup global unique biar gampang
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
