<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('is_active');
        });

        // Backfill existing records with a stable order if none set
        if (app()->runningInConsole() === false) {
            return;
        }

        $servers = \App\Models\Server::orderBy('created_at')->get();
        foreach ($servers as $i => $s) {
            $s->sort_order = $i;
            $s->save();
        }
    }

    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
