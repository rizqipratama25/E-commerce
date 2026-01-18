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
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            $table->string('provider');
            $table->enum('status', ['unpaid', 'pending', 'paid', 'failed', 'expired', 'cancelled'])->default('unpaid');

            $table->string('external_id')->unique();

            $table->string('reference')->nullable()->index();
            
            $table->string('payment_type')->nullable()->index();
            $table->string('payment_method')->nullable()->index();
            
            $table->string('payment_url')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->json('payload')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};
