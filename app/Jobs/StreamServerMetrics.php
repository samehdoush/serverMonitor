<?php

namespace App\Jobs;

use App\Events\ServerMetricsUpdated;
use App\Models\Server;
use App\Services\SshService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class StreamServerMetrics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120; // Allow job to run for 2 minutes

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Server $server,
        public int $durationSeconds = 60
    ) {}

    /**
     * Execute the job.
     */
    public function handle(SshService $sshService): void
    {
        $endTime = time() + $this->durationSeconds;
        $iteration = 0;

        try {
            // Establish persistent connection for the entire job duration
            $ssh = $sshService->connect($this->server);

            while (time() < $endTime) {
                try {
                    // 1. Determine if we should do a 'full' fetch (e.g. every 10 iterations)
                    // Full fetch includes disk usage and service status.
                    $isFull = ($iteration % 10 === 0);

                    $metrics = $sshService->getMetricsFromConnection($ssh, $isFull, $this->server);
                    $result = array_merge(['success' => true], $metrics);

                    // 2. ONLY persist to database on 'full' cycles to avoid bloating the DB
                    if ($isFull) {
                        \App\Models\Metric::create([
                            'server_id' => $this->server->id,
                            'cpu_usage' => $metrics['cpu_usage'],
                            'ram_usage' => $metrics['ram_usage'],
                            'ram_total' => $metrics['ram_total'],
                            'ram_used' => $metrics['ram_used'],
                            'swap_usage' => $metrics['swap_usage'],
                            'swap_total' => $metrics['swap_total'],
                            'swap_used' => $metrics['swap_used'],
                            'disk_usage' => $metrics['disk_usage'],
                            'disk_total' => $metrics['disk_total'],
                            'disk_used' => $metrics['disk_used'],
                            'network_rx_kb' => $metrics['network_rx_kb'] ?? 0,
                            'network_tx_kb' => $metrics['network_tx_kb'] ?? 0,
                            'disk_read_kb' => $metrics['disk_read_kb'] ?? 0,
                            'disk_write_kb' => $metrics['disk_write_kb'] ?? 0,
                            'top_processes' => $metrics['top_processes'] ?? [],
                            'service_status' => $metrics['service_status'] ?? [],
                            'load_1' => $metrics['load_1'],
                            'load_5' => $metrics['load_5'],
                            'load_15' => $metrics['load_15'],
                            'uptime_seconds' => $metrics['uptime_seconds'],
                            'recorded_at' => now(),
                        ]);

                        $this->server->update(['last_connected_at' => now()]);
                    }

                    // 3. ALWAYS broadcast event for real-time UI updates
                    event(new ServerMetricsUpdated($this->server->id, $result));

                    // 4. Threshold checks (Only on full cycles to avoid notification spam)
                    if ($isFull) {
                        $this->checkAlerts($metrics);
                    }

                } catch (\Exception $e) {
                    \Log::error("Stream error for {$this->server->name}: ".$e->getMessage());
                    break;
                }

                $iteration++;
                // Shorter sleep for more responsive live feel (matches usleep in SshService)
                sleep(2);
            }

            $ssh->disconnect();

        } catch (\Exception $e) {
            \Log::error("Connection failed for stream {$this->server->name}: ".$e->getMessage());
        }
    }

    protected function checkAlerts(array $metrics): void
    {
        $alerts = [];
        if (($metrics['cpu_usage'] ?? 0) >= $this->server->cpu_threshold) {
            $alerts[] = "CPU at {$metrics['cpu_usage']}%";
        }
        if (($metrics['ram_usage'] ?? 0) >= $this->server->ram_threshold) {
            $alerts[] = "RAM at {$metrics['ram_usage']}%";
        }
        if (($metrics['disk_usage'] ?? 0) >= $this->server->disk_threshold) {
            $alerts[] = "Disk at {$metrics['disk_usage']}%";
        }

        if (! empty($alerts)) {
            $cacheKey = "server_alert_{$this->server->id}";
            if (! \Illuminate\Support\Facades\Cache::has($cacheKey)) {
                \Native\Desktop\Facades\Notification::new()
                    ->title("⚠️ Alert: {$this->server->name}")
                    ->message(implode(', ', $alerts))
                    ->show();

                \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addMinutes(5));
            }
        }
    }
}
