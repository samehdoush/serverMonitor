<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $servers = Server::with('latestMetric')
            ->orderBy('name')
            ->get()
            ->map(function ($server) {
                return [
                    'id' => $server->id,
                    'name' => $server->name,
                    'ip' => $server->ip,
                    'is_active' => $server->is_active,
                    'last_connected_at' => $server->last_connected_at?->diffForHumans(),
                    'cpu_usage' => $server->latestMetric?->cpu_usage ?? 0,
                    'ram_usage' => $server->latestMetric?->ram_usage ?? 0,
                    'disk_usage' => $server->latestMetric?->disk_usage ?? 0,
                    'cpu_threshold' => $server->cpu_threshold,
                    'ram_threshold' => $server->ram_threshold,
                    'disk_threshold' => $server->disk_threshold,
                ];
            });

        return Inertia::render('Dashboard', [
            'servers' => $servers,
        ]);
    }
}
