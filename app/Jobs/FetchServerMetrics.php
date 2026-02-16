<?php

namespace App\Jobs;

use App\Models\Server;
use App\Models\Metric;
use App\Services\SshService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Native\Desktop\Notification;

class FetchServerMetrics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 30;

    public function __construct(
        public Server $server
    ) {}

    public function handle(SshService $sshService): void
    {
        $result = $sshService->getMetrics($this->server);

        if (!$result['success']) {
            \Log::warning("Failed to fetch metrics for server {$this->server->name}: " . ($result['message'] ?? 'Unknown error'));
            return;
        }

        Metric::create([
            'server_id' => $this->server->id,
            'cpu_usage' => $result['cpu_usage'],
            'ram_usage' => $result['ram_usage'],
            'ram_total' => $result['ram_total'],
            'ram_used' => $result['ram_used'],
            'swap_usage' => $result['swap_usage'],
            'swap_total' => $result['swap_total'],
            'swap_used' => $result['swap_used'],
            'disk_usage' => $result['disk_usage'],
            'disk_total' => $result['disk_total'],
            'disk_used' => $result['disk_used'],
            'network_rx_kb' => $result['network_rx_kb'],
            'network_tx_kb' => $result['network_tx_kb'],
            'disk_read_kb' => $result['disk_read_kb'],
            'disk_write_kb' => $result['disk_write_kb'],
            'top_processes' => $result['top_processes'],
            'service_status' => $result['service_status'],
            'load_1' => $result['load_1'],
            'load_5' => $result['load_5'],
            'load_15' => $result['load_15'],
            'uptime_seconds' => $result['uptime_seconds'],
            'recorded_at' => now(),
        ]);

        $this->server->update(['last_connected_at' => now()]);

        $this->checkThresholds($result);
    }

    protected function checkThresholds(array $metrics): void
    {
        $alerts = [];

        if ($metrics['cpu_usage'] >= $this->server->cpu_threshold) {
            $alerts[] = "CPU at {$metrics['cpu_usage']}%";
        }

        if ($metrics['ram_usage'] >= $this->server->ram_threshold) {
            $alerts[] = "RAM at {$metrics['ram_usage']}%";
        }

        if ($metrics['disk_usage'] >= $this->server->disk_threshold) {
            $alerts[] = "Disk at {$metrics['disk_usage']}%";
        }

        if (!empty($alerts)) {
            $this->sendAlert($alerts);
        }
    }

    protected function sendAlert(array $alerts): void
    {
        $message = implode(', ', $alerts);
        \Log::info('Background Alert for ' . $this->server->name . ': ' . $message);

        Notification::new()
            ->title("⚠️ Alert: {$this->server->name}")
            ->message($message)
            ->show();
    }
}
