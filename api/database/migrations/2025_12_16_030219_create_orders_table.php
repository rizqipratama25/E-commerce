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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('address_id')->constrained()->restrictOnDelete();

            $table->decimal('subtotal', 12);

            $table->foreignId('shipping_service_id')->constrained()->restrictOnDelete();
            $table->decimal('shipping_cost', 12)->default(0);
            $table->decimal('grand_total', 12);

            $table->enum('status', ['pending', 'process', 'delivered', 'cancelled', 'shipping', 'completed'])->default('process');

            $table->enum('payment_status', ['unpaid', 'pending', 'paid', 'failed', 'expired', 'cancelled'])->default('unpaid');
            $table->enum('escrow_status', ['none', 'holding', 'released', 'refunded', 'disputed'])->default('none');

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['payment_status']);
            $table->index(['escrow_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
