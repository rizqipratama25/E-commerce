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
        Schema::create('order_shipments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();

            // partner = user role Partner
            $table->foreignId('partner_id')->constrained('users')->restrictOnDelete();

            $table->foreignId('shipping_service_id')->constrained('shipping_services')->restrictOnDelete();

            $table->decimal('shipping_cost', 12, 2)->default(0);

            $table->enum('status', ['draft', 'process', 'shipping', 'delivered', 'completed', 'cancelled'])
                ->default('process');

            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['partner_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_shipments');
    }
};
