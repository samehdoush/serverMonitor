<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('server_id')->constrained()->onDelete('cascade');
            $table->float('cpu_usage')->nullable();
            $table->float('ram_usage')->nullable();
            $table->float('ram_total')->nullable(); // in MB
            $table->float('ram_used')->nullable();  // in MB
            $table->float('disk_usage')->nullable();
            $table->float('disk_total')->nullable(); // in GB
            $table->float('disk_used')->nullable();  // in GB
            $table->float('load_1')->nullable();
            $table->float('load_5')->nullable();
            $table->float('load_15')->nullable();
            $table->integer('uptime_seconds')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['server_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metrics');
    }
};
