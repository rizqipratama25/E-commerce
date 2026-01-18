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
        Schema::table('order_payouts', function (Blueprint $table) {
            $table->foreignId('order_shipment_id')
                ->nullable()
                ->after('order_id')
                ->constrained('order_shipments')
                ->nullOnDelete();

            $table->index(['order_id', 'order_shipment_id', 'recipient_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_payouts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_shipment_id');
            $table->dropIndex(['order_id', 'order_shipment_id', 'recipient_user_id']);
        });
    }
};
