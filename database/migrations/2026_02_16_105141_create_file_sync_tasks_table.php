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
        Schema::create('file_sync_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('source_server_id')->constrained('servers')->onDelete('cascade');
            $table->foreignId('destination_server_id')->constrained('servers')->onDelete('cascade');
            $table->string('source_path');
            $table->string('destination_path');
            $table->boolean('delete_extra')->default(false); // rsync --delete
            $table->timestamp('last_run_at')->nullable();
            $table->string('last_status')->nullable();
            $table->text('last_output')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_sync_tasks');
    }
};
