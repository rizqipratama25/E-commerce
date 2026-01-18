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
        Schema::create('order_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            $table->enum('recipient_type', ['admin', 'partner']);
            $table->foreignId('recipient_user_id')->constrained('users')->restrictOnDelete();

            $table->decimal('amount', 12);
            $table->enum('status', ['holding', 'released', 'failed', 'cancelled'])->default('holding');

            $table->timestamp('release_scheduled_at')->nullable()->index();
            $table->timestamp('released_at')->nullable();

            $table->string('provider')->nullable();

            $table->string('external_id')->nullable()->index();
            $table->string('payout_id')->nullable()->index();
            $table->string('reference_id')->nullable()->index();

            $table->json('payload')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['recipient_type']);
            $table->index(['recipient_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_payouts');
    }
};
