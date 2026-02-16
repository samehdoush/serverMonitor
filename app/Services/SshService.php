<?php

namespace App\Services;

use App\Models\Server;
use phpseclib3\Net\SSH2;
use phpseclib3\Crypt\PublicKeyLoader;
use Exception;

class SshService
{
    protected ?SSH2 $ssh = null;

    /**
     * Test SSH connection to a server
     */
    public function testConnection(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $output = $ssh->exec('echo "Connection successful"');
            $ssh->disconnect();

            return [
                'success' => true,
                'message' => 'Connection successful',
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Connect to server via SSH
     */
    public function connect(Server $server): SSH2
    {
        $ssh = new SSH2($server->ip, $server->port, 10); // 10 second timeout

        if ($server->auth_type === 'password' || (!empty($server->password) && empty($server->ssh_key_path))) {
            // Password authentication
            $password = $server->getDecryptedPassword();
            if (!$ssh->login($server->username, $password)) {
                throw new Exception('SSH password authentication failed');
            }
        } elseif (!empty($server->ssh_key_path) && file_exists($server->ssh_key_path)) {
            // Key authentication
            $keyPassword = $server->getDecryptedKeyPassword();
            try {
                $key = PublicKeyLoader::load(
                    file_get_contents($server->ssh_key_path),
                    $keyPassword ?? false
                );
            } catch (Exception $e) {
                throw new Exception('Invalid SSH key: ' . $e->getMessage());
            }

            if (!$ssh->login($server->username, $key)) {
                throw new Exception('SSH key authentication failed');
            }
        } else {
            throw new Exception('No valid authentication method provided');
        }

        return $ssh;
    }

    /**
     * Fetch server metrics via SSH
     */
    public function getMetrics(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $metrics = $this->getMetricsFromConnection($ssh);
            $ssh->disconnect();
            
            return array_merge(['success' => true], $metrics);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get metrics from an existing SSH connection
     */
    public function getMetricsFromConnection(SSH2 $ssh): array
    {
        // 1. Get Initial States for Rate-based metrics (CPU, Network, Disk I/O)
        $cpuInitial = $this->getCpuStats($ssh);
        $networkInitial = $this->getNetworkStats($ssh);
        $diskIoInitial = $this->getDiskIoStats($ssh);

        // 2. Wait 1 second to calculate rates
        sleep(1);

        // 3. Get Final States
        $cpuFinal = $this->getCpuStats($ssh);
        $networkFinal = $this->getNetworkStats($ssh);
        $diskIoFinal = $this->getDiskIoStats($ssh);

        // 4. Calculate Rates
        $cpuUsage = $this->calculateCpuUsage($cpuInitial, $cpuFinal);
        $networkStats = $this->calculateNetworkSpeed($networkInitial, $networkFinal);
        $diskIoStats = $this->calculateDiskIoSpeed($diskIoInitial, $diskIoFinal);

        // 5. Get Instantaneous Metrics
        // RAM and Swap Usage
        $memoryInfo = $this->getMemoryInfo($ssh);
        $ramInfo = $memoryInfo['ram'];
        $swapInfo = $memoryInfo['swap'];

        // Disk Usage
        $diskInfo = $this->getDiskInfo($ssh);

        // Load Average
        $loadInfo = $this->getLoadAverage($ssh);

        // Uptime
        $uptime = $this->getUptime($ssh);

        // Top Processes
        $topProcesses = $this->getTopProcesses($ssh);

        // Service Status
        $serviceStatus = $this->getServiceStatus($ssh, $server->installed_services ?? []);

        $data = [
            'cpu_usage' => $cpuUsage,
            'ram_usage' => $ramInfo['usage'],
            'ram_total' => $ramInfo['total'],
            'ram_used' => $ramInfo['used'],
            'swap_usage' => $swapInfo['usage'],
            'swap_total' => $swapInfo['total'],
            'swap_used' => $swapInfo['used'],
            'disk_usage' => $diskInfo['usage'],
            'disk_total' => $diskInfo['total'],
            'disk_used' => $diskInfo['used'],
            'network_rx_kb' => $networkStats['rx_kb'],
            'network_tx_kb' => $networkStats['tx_kb'],
            'disk_read_kb' => $diskIoStats['read_kb'],
            'disk_write_kb' => $diskIoStats['write_kb'],
            'top_processes' => $topProcesses,
            'service_status' => $serviceStatus,
            'load_1' => $loadInfo['load_1'],
            'load_5' => $loadInfo['load_5'],
            'load_15' => $loadInfo['load_15'],
            'uptime_seconds' => $uptime,
        ];

        return $data;
    }

    /**
     * Run a service action (start, stop, restart, reload)
     */
    public function runServiceAction(Server $server, string $service, string $action): array
    {
        try {
            $ssh = $this->connect($server);
            
            // Validate action
            $allowedActions = ['start', 'stop', 'restart', 'reload', 'enable', 'disable'];
            if (!in_array($action, $allowedActions)) {
                throw new Exception("Invalid service action: $action");
            }

            // Construct command with sudo
            // Note: This assumes the user has NOPASSWD sudo or we'd need to handle password prompt
            $cmd = "sudo systemctl $action $service";
            $output = $ssh->exec($cmd);
            $exitStatus = $ssh->getExitStatus();
            
            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? "Service $service $action successfully" : ($output ?: "Command failed with status $exitStatus"),
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Tail a log file
     */
    public function tailLog(Server $server, string $path, int $lines = 100): array
    {
        try {
            $ssh = $this->connect($server);
            $cmd = "sudo tail -n $lines " . escapeshellarg($path);
            $output = $ssh->exec($cmd);
            $ssh->disconnect();

            return [
                'success' => true,
                'content' => $output,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Execute a raw command (for Remote Terminal)
     */
    public function executeRaw(Server $server, string $command): array
    {
        try {
            $ssh = $this->connect($server);
            
            // Set a timeout for the command to prevent hanging (e.g. 30 seconds)
            $ssh->setTimeout(30);
            
            // Combine stdout and stderr so we see errors too
            $output = $ssh->exec($command . ' 2>&1');
            
            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return [
                'success' => true,
                'output' => $output,
                'exit_status' => $exitStatus
            ];
        } catch (Exception $e) {
            return [
                'success' => false, 
                'message' => 'Command failed or timed out: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Read the Caddyfile from the server
     */
    public function readCaddyfile(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $path = '/etc/caddy/Caddyfile';
            
            // Check if file exists
            $exists = trim($ssh->exec("test -f $path && echo 'exists'"));
            if ($exists !== 'exists') {
                return ['success' => false, 'message' => "Caddyfile not found at $path"];
            }

            $content = $ssh->exec("sudo cat $path");
            $ssh->disconnect();

            return [
                'success' => true,
                'content' => $content
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Save Caddyfile with validation
     */
    public function saveCaddyfile(Server $server, string $content): array
    {
        try {
            $ssh = $this->connect($server);
            
            // 1. Write to a temporary file
            $tmpPath = '/tmp/Caddyfile.next';
            $contentEscaped = base64_encode($content);
            $ssh->exec("echo '$contentEscaped' | base64 -d > $tmpPath");
            
            // 2. Validate the new config
            $validateCmd = "caddy validate --config $tmpPath 2>&1";
            $validationOutput = trim($ssh->exec($validateCmd));
            $exitStatus = $ssh->getExitStatus();
            
            if ($exitStatus !== 0) {
                // Return validation error but keep the tmp file for debugging if needed? 
                // Better to just fail and report error.
                return [
                    'success' => false,
                    'message' => 'Configuration validation failed',
                    'output' => $validationOutput
                ];
            }

            // 3. Backup old config
            $finalPath = '/etc/caddy/Caddyfile';
            $ssh->exec("sudo cp $finalPath $finalPath.bak");

            // 4. Move new config to final location
            $ssh->exec("sudo mv $tmpPath $finalPath");

            // 5. Reload Caddy
            $ssh->exec("sudo systemctl reload caddy");
            
            $ssh->disconnect();

            return [
                'success' => true,
                'message' => 'Caddyfile saved and reloaded successfully'
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function getCpuStats(SSH2 $ssh): array
    {
        $output = $ssh->exec("grep 'cpu ' /proc/stat");
        preg_match('/cpu\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/', $output, $matches);

        if (count($matches) < 8) return ['total' => 0, 'used' => 0];

        $user = (int) $matches[1];
        $nice = (int) $matches[2];
        $system = (int) $matches[3];
        $idle = (int) $matches[4];
        $iowait = (int) $matches[5];
        $irq = (int) $matches[6];
        $softirq = (int) $matches[7];

        $total = $user + $nice + $system + $idle + $iowait + $irq + $softirq;
        $used = $total - $idle - $iowait;

        return ['total' => $total, 'used' => $used];
    }

    protected function calculateCpuUsage(array $initial, array $final): float
    {
        $totalDiff = $final['total'] - $initial['total'];
        $usedDiff = $final['used'] - $initial['used'];

        if ($totalDiff <= 0) return 0.0;

        return round(($usedDiff / $totalDiff) * 100, 2);
    }
    
    // Removed old getCpuUsage() as it's replaced by getCpuStats + calculateCpuUsage

    protected function getNetworkStats(SSH2 $ssh): array
    {
        // More robust awk command that handles interface colons correctly and sums all non-loopback interfaces
        $cmd = "awk '/:/ {if($1 !~ /lo/) {split($0, a, \":\"); split(a[2], b, \" \"); rx+=b[1]; tx+=b[9]}} END {print rx+0, tx+0}' /proc/net/dev";
        $output = trim($ssh->exec($cmd));
        $parts = preg_split('/\s+/', $output);
        
        $rx = isset($parts[0]) ? (float) $parts[0] : 0;
        $tx = isset($parts[1]) ? (float) $parts[1] : 0;
        
        return ['rx' => $rx, 'tx' => $tx];
    }

    protected function calculateNetworkSpeed(array $initial, array $final): array
    {
        $rxBytes = $final['rx'] - $initial['rx'];
        $txBytes = $final['tx'] - $initial['tx'];

        return [
            'rx_kb' => round(max(0, $rxBytes) / 1024, 2),
            'tx_kb' => round(max(0, $txBytes) / 1024, 2),
        ];
    }

    protected function getDiskIoStats(SSH2 $ssh): array
    {
        // Exclude loop, ram, and zram devices which often clutter diskstats and return zero i/o
        $cmd = "awk '$3 !~ /loop|ram|zram/ {rd+=$6; wr+=$10} END {print rd+0, wr+0}' /proc/diskstats";
        $output = trim($ssh->exec($cmd));
        $parts = preg_split('/\s+/', $output);

        return [
            'read_sectors' => isset($parts[0]) ? (float) $parts[0] : 0,
            'write_sectors' => isset($parts[1]) ? (float) $parts[1] : 0,
        ];
    }

    protected function calculateDiskIoSpeed(array $initial, array $final): array
    {
        $readSectors = $final['read_sectors'] - $initial['read_sectors'];
        $writeSectors = $final['write_sectors'] - $initial['write_sectors'];

        $readBytes = max(0, $readSectors) * 512;
        $writeBytes = max(0, $writeSectors) * 512;

        return [
            'read_kb' => round($readBytes / 1024, 2),
            'write_kb' => round($writeBytes / 1024, 2),
        ];
    }

    protected function getTopProcesses(SSH2 $ssh): array
    {
        // Simplified command to avoid awkward parsing
        $cmd = "ps -eo user,pcpu,pmem,comm --sort=-pcpu | head -n 6 | tail -n 5";
        $output = trim($ssh->exec($cmd));
        if (empty($output)) return [];

        $lines = explode("\n", $output);
        $processes = [];
        
        foreach ($lines as $line) {
            $parts = preg_split('/\s+/', trim($line), 4);
            if (count($parts) >= 4) {
                $processes[] = [
                    'user' => $parts[0],
                    'cpu' => (float) $parts[1],
                    'mem' => (float) $parts[2],
                    'command' => $parts[3],
                ];
            }
        }
        
        return $processes;
    }

    /**
     * Discover which supported services are installed on the server
     */
    public function discoverServices(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $supportedServices = ['nginx', 'apache2', 'mysql', 'mariadb', 'docker', 'redis', 'caddy'];
            $installed = [];

            foreach ($supportedServices as $service) {
                // Check if unit file exists
                $output = trim($ssh->exec("systemctl list-unit-files $service.service | grep $service.service"));
                if (!empty($output)) {
                    $installed[] = $service;
                }
            }

            // Check for PHP-FPM
            $phpFpm = trim($ssh->exec("systemctl list-unit-files | grep php.*-fpm | awk '{print $1}' | head -n 1"));
            if (!empty($phpFpm)) {
                $installed[] = 'php-fpm';
            }

            $ssh->disconnect();
            return $installed;
        } catch (Exception $e) {
            \Log::error("Discovery failed for {$server->name}: " . $e->getMessage());
            return [];
        }
    }

    protected function getServiceStatus(SSH2 $ssh, array $filterServices = []): array
    {
        $services = !empty($filterServices) ? $filterServices : ['nginx', 'apache2', 'mysql', 'mariadb', 'docker', 'redis', 'caddy', 'php-fpm'];
        $status = [];

        foreach ($services as $service) {
            if ($service === 'php-fpm') {
                $phpFpmStatusCmd = "systemctl list-units --type=service | grep php.*-fpm | awk '{print $1, $4}' | head -n 1";
                $phpFpmOutput = trim($ssh->exec($phpFpmStatusCmd));
                
                if (!empty($phpFpmOutput)) {
                    $parts = explode(' ', $phpFpmOutput);
                    $serviceName = $parts[0];
                    $isActive = $parts[1] === 'running' ? 'active' : 'inactive';
                    $status['php-fpm'] = [
                        'name' => $serviceName,
                        'status' => $isActive
                    ];
                } else {
                     // Try to find the name even if stopped
                     $serviceName = trim($ssh->exec("systemctl list-unit-files | grep php.*-fpm | awk '{print $1}' | head -n 1"));
                     if (!empty($serviceName)) {
                         $status['php-fpm'] = [
                            'name' => $serviceName,
                            'status' => 'inactive'
                        ];
                     }
                }
                continue;
            }

            // is-active returns 'active', 'inactive', 'failed', or 'unknown'
            $output = trim($ssh->exec("systemctl is-active $service 2>/dev/null"));
            
            // if systemctl returns empty or unknown, and we didn't have it in our filter, skip it
            if ((empty($output) || $output === 'unknown') && empty($filterServices)) continue;
            
            // If it's in the filter but currently unknown/empty, mark as inactive if we know it was installed
            $finalStatus = (empty($output) || $output === 'unknown') ? 'inactive' : $output;
            
            $status[$service] = $finalStatus;
        }

        return $status;
    }

    /**
     * Get RAM and Swap information
     */
    protected function getMemoryInfo(SSH2 $ssh): array
    {
        // Try free -m first
        $output = $ssh->exec("free -m");
        
        $ram = ['usage' => 0, 'total' => 0, 'used' => 0];
        $swap = ['usage' => 0, 'total' => 0, 'used' => 0];

        // Parse free -m output
        // Mem: 7961 1234 5678 ...
        // Swap: 2048 100 1948
        if (preg_match('/Mem:\s+(\d+)\s+(\d+)/', $output, $memMatches)) {
            $total = (float) $memMatches[1];
            $used = (float) $memMatches[2];
            $usage = $total > 0 ? round(($used / $total) * 100, 2) : 0;
            $ram = ['usage' => $usage, 'total' => $total, 'used' => $used];
        }

        if (preg_match('/Swap:\s+(\d+)\s+(\d+)/', $output, $swapMatches)) {
            $total = (float) $swapMatches[1];
            $used = (float) $swapMatches[2];
            $usage = $total > 0 ? round(($used / $total) * 100, 2) : 0;
            $swap = ['usage' => $usage, 'total' => $total, 'used' => $used];
        }

        // If simple parsing failed or gave zeros for RAM or SWAP (assuming swap might exist), try /proc/meminfo fallback
        // We check Swap Total == 0 because if parsing succeeded it should be > 0 (unless actually disabled).
        // If it really is disabled, meminfo will also return 0 or near 0, so no harm.
        if ($ram['total'] == 0 || $swap['total'] == 0) {
            $meminfo = $ssh->exec("cat /proc/meminfo");
            
            // Only update RAM if it wasn't valid from free -m
            if ($ram['total'] == 0) {
                preg_match('/MemTotal:\s+(\d+)\s+kB/', $meminfo, $memTotal);
                preg_match('/MemAvailable:\s+(\d+)\s+kB/', $meminfo, $memAvail);
                
                if (isset($memTotal[1]) && isset($memAvail[1])) {
                    $total = floor((float) $memTotal[1] / 1024);
                    $avail = floor((float) $memAvail[1] / 1024);
                    $used = $total - $avail; // MemAvailable is more accurate for "used" in modern linux than converting free+buffers
                    $usage = $total > 0 ? round(($used / $total) * 100, 2) : 0;
                    $ram = ['usage' => $usage, 'total' => $total, 'used' => $used];
                }
            }

            // Always try to improve Swap info if it was 0 from free command
            if ($swap['total'] == 0) {
                preg_match('/SwapTotal:\s+(\d+)\s+kB/', $meminfo, $swapTotal);
                preg_match('/SwapFree:\s+(\d+)\s+kB/', $meminfo, $swapFree);
                
                if (isset($swapTotal[1]) && isset($swapFree[1])) {
                    $total = floor((float) $swapTotal[1] / 1024);
                    $free = floor((float) $swapFree[1] / 1024);
                    $used = $total - $free;
                    $usage = $total > 0 ? round(($used / $total) * 100, 2) : 0;
                    $swap = ['usage' => $usage, 'total' => $total, 'used' => $used];
                }
            }
        }

        return ['ram' => $ram, 'swap' => $swap];
    }

    /**
     * Get Disk information (root partition)
     */
    protected function getDiskInfo(SSH2 $ssh): array
    {
        $output = $ssh->exec("df -BG / | tail -1");
        preg_match('/\S+\s+(\d+)G\s+(\d+)G\s+\d+G\s+(\d+)%/', $output, $matches);

        if (count($matches) < 4) {
            return ['usage' => 0, 'total' => 0, 'used' => 0];
        }

        return [
            'total' => (float) $matches[1],
            'used' => (float) $matches[2],
            'usage' => (float) $matches[3],
        ];
    }

    /**
     * Get Load Average
     */
    protected function getLoadAverage(SSH2 $ssh): array
    {
        $output = $ssh->exec("cat /proc/loadavg");
        preg_match('/(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)/', $output, $matches);

        if (count($matches) < 4) {
            return ['load_1' => 0, 'load_5' => 0, 'load_15' => 0];
        }

        return [
            'load_1' => (float) $matches[1],
            'load_5' => (float) $matches[2],
            'load_15' => (float) $matches[3],
        ];
    }

    /**
     * Get uptime in seconds
     */
    protected function getUptime(SSH2 $ssh): int
    {
        $output = $ssh->exec("cat /proc/uptime | awk '{print $1}'");
        return (int) floatval(trim($output));
    }
}
