<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Inertia\Inertia;
use Inertia\Response;
use Native\Desktop\Facades\Window;

class MenuBarController extends Controller
{
    public function index(): Response
    {
        $servers = Server::with(['latestMetric'])->orderBy('sort_order')->get();

        return Inertia::render('MenuBar', [
            'servers' => $servers,
            'stats' => [
                'total' => $servers->count(),
                'active' => $servers->where('is_active', true)->count(),
                'issues' => $servers->filter(function ($server) {
                    return $server->cpu_usage > 80 || $server->ram_usage > 80 || $server->disk_usage > 90;
                })->count(),
            ],
        ]);
    }

    public function focusMain(): void
    {
        Window::show('main');
    }

    public function openServer(Server $server): void
    {
        Window::open('main')
            ->width(1280)
            ->height(800)
            ->route('servers.show', ['server' => $server->id]);

        Window::show('main');
    }

    public function openSettings(): void
    {
        Window::open('main')
            ->width(1280)
            ->height(800)
            ->route('settings.index');

        Window::show('main');
    }
}
