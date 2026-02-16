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
        
        try {
            // Establish persistent connection
            $ssh = $sshService->connect($this->server);
            
            while (time() < $endTime) {
                try {
                    $metrics = $sshService->getMetricsFromConnection($ssh);
                    $result = array_merge(['success' => true], $metrics);
                    
                    // Persist to database
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

                    // Broadcast event
                    event(new ServerMetricsUpdated($this->server->id, $result));

                    // Check thresholds for notifications
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

                    if (!empty($alerts)) {
                        // Rate limit notifications to once every 5 minutes per server
                        $cacheKey = "server_alert_{$this->server->id}";
                        if (!\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                            \Native\Desktop\Facades\Notification::new()
                                ->title("⚠️ Alert: {$this->server->name}")
                                ->message(implode(', ', $alerts))
                                ->show();
                            
                            \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addMinutes(5));
                        }
                    }
                } catch (\Exception $e) {
                    // If detailed metrics fetch fails (e.g. timeout), might need to reconnect
                    // For now, we log and break to avoid spamming errors
                    \Log::error("Stream error for {$this->server->name}: " . $e->getMessage());
                    break;
                }
                
                sleep(2); // 2 second interval
            }
            
            $ssh->disconnect();
            
        } catch (\Exception $e) {
             \Log::error("Connection failed for stream {$this->server->name}: " . $e->getMessage());
        }
    }
}
