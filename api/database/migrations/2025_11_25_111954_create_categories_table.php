<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Core fields
            $table->string('name');
            $table->string('slug');
            // path contoh:
            // furniture
            // furniture/kursi
            // furniture/kursi/kursi-santai
            $table->string('path')->nullable();

            // tree
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            // helper fields
            $table->unsignedTinyInteger('level')->default(1); // 1..3
            $table->unsignedInteger('sort_order')->default(0);

            // visibility
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_menu')->default(true);

            // optional (kalau butuh)
            $table->string('icon')->nullable(); // misal nama icon / url
            $table->text('description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['parent_id', 'sort_order']);
            $table->index(['is_active', 'show_in_menu']);
            $table->index('slug');
            $table->index('path');
        });

        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS categories_parent_slug_unique
            ON categories (parent_id, slug)
            WHERE deleted_at IS NULL
        ");

        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS categories_parent_lower_name_unique
            ON categories (parent_id, LOWER(name))
            WHERE deleted_at IS NULL
        ");

        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS categories_path_unique
            ON categories (path)
            WHERE deleted_at IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS categories_parent_slug_unique");
        DB::statement("DROP INDEX IF EXISTS categories_parent_lower_name_unique");
        DB::statement("DROP INDEX IF EXISTS categories_path_unique");

        Schema::dropIfExists('categories');
    }
};
