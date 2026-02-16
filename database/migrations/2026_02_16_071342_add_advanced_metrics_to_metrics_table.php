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
        Schema::table('metrics', function (Blueprint $table) {
            $table->float('network_rx_kb')->nullable()->after('disk_used'); // Download speed in KB/s
            $table->float('network_tx_kb')->nullable()->after('network_rx_kb'); // Upload speed in KB/s
            $table->float('disk_read_kb')->nullable()->after('network_tx_kb'); // Disk Read speed in KB/s
            $table->float('disk_write_kb')->nullable()->after('disk_read_kb'); // Disk Write speed in KB/s
            $table->json('top_processes')->nullable()->after('disk_write_kb');
            $table->json('service_status')->nullable()->after('top_processes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('metrics', function (Blueprint $table) {
            $table->dropColumn([
                'network_rx_kb',
                'network_tx_kb',
                'disk_read_kb',
                'disk_write_kb',
                'top_processes',
                'service_status',
            ]);
        });
    }
};
