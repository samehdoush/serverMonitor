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
        Schema::table('servers', function (Blueprint $table) {
            $table->string('auth_type')->default('key')->after('port'); // 'key' or 'password'
            $table->text('password')->nullable()->after('key_password'); // Encrypted SSH password
            $table->string('ssh_key_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn(['auth_type', 'password']);
            // $table->string('ssh_key_path')->nullable(false)->change(); // Reverting to not null is tricky in SQLite
        });
    }
};
