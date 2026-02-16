<?php

namespace App\Console\Commands;

use App\Models\Server;
use App\Models\Metric;
use App\Jobs\FetchServerMetrics;
use Illuminate\Console\Command;
use Carbon\Carbon;

class MonitorServers extends Command
{
    protected $signature = 'servers:monitor';

    protected $description = 'Fetch metrics from all active servers and prune old data';

    public function handle(): int
    {
        $this->info('Starting server monitoring...');

        // Prune old metrics (older than 3 days)
        $this->pruneOldMetrics();

        // Dispatch jobs for all active servers
        $servers = Server::where('is_active', true)->get();

        if ($servers->isEmpty()) {
            $this->info('No active servers to monitor.');
            return self::SUCCESS;
        }

        foreach ($servers as $server) {
            $this->info("Dispatching metrics job for: {$server->name} ({$server->ip})");
            FetchServerMetrics::dispatch($server);
        }

        $this->info("Dispatched {$servers->count()} monitoring jobs.");

        return self::SUCCESS;
    }

    protected function pruneOldMetrics(): void
    {
        $cutoff = Carbon::now()->subDays(3);
        $deleted = Metric::where('recorded_at', '<', $cutoff)->delete();

        if ($deleted > 0) {
            $this->info("Pruned {$deleted} old metric records.");
        }
    }
}
