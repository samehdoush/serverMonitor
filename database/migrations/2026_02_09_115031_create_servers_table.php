<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ip');
            $table->string('username');
            $table->integer('port')->default(22);
            $table->string('ssh_key_path')->nullable();
            $table->text('key_password')->nullable(); // Encrypted
            $table->integer('cpu_threshold')->default(80);
            $table->integer('ram_threshold')->default(80);
            $table->integer('disk_threshold')->default(80);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
