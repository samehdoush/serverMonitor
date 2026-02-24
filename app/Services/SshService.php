<?php

namespace App\Services;

use App\Models\Server;
use Exception;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Net\SSH2;

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

        if ($server->auth_type === 'password' || (! empty($server->password) && empty($server->ssh_key_path))) {
            // Password authentication
            $password = $server->getDecryptedPassword();
            if (! $ssh->login($server->username, $password)) {
                throw new Exception('SSH password authentication failed');
            }
        } elseif (! empty($server->ssh_key_path) && file_exists($server->ssh_key_path)) {
            // Key authentication
            $keyPassword = $server->getDecryptedKeyPassword();
            try {
                $key = PublicKeyLoader::load(
                    file_get_contents($server->ssh_key_path),
                    $keyPassword ?? false
                );
            } catch (Exception $e) {
                throw new Exception('Invalid SSH key: '.$e->getMessage());
            }

            if (! $ssh->login($server->username, $key)) {
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
    public function getMetrics(Server $server, bool $full = true): array
    {
        try {
            $ssh = $this->connect($server);
            $metrics = $this->getMetricsFromConnection($ssh, $full, $server);
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
    public function getMetricsFromConnection(SSH2 $ssh, bool $full = true, ?Server $server = null): array
    {
        // 1. Get Initial States for Rate-based metrics (CPU, Network, Disk I/O)
        $cpuInitial = $this->getCpuStats($ssh);
        $networkInitial = $this->getNetworkStats($ssh);
        $diskIoInitial = $full ? $this->getDiskIoStats($ssh) : null;

        // 2. Wait 0.5 - 1.0 second to calculate rates.
        // For live stream we can use a shorter window to feel more responsive.
        usleep($full ? 1000000 : 500000); // 1s for full, 0.5s for light

        // 3. Get Final States
        $cpuFinal = $this->getCpuStats($ssh);
        $networkFinal = $this->getNetworkStats($ssh);
        $diskIoFinal = $full ? $this->getDiskIoStats($ssh) : null;

        // 4. Calculate Rates
        $cpuUsage = $this->calculateCpuUsage($cpuInitial, $cpuFinal);
        $networkStats = $this->calculateNetworkSpeed($networkInitial, $networkFinal);
        $diskIoStats = $full ? $this->calculateDiskIoSpeed($diskIoInitial, $diskIoFinal) : ['read_kb' => 0, 'write_kb' => 0];

        // 5. Get Instantaneous Metrics
        $memoryInfo = $this->getMemoryInfo($ssh);
        $ramInfo = $memoryInfo['ram'];
        $swapInfo = $memoryInfo['swap'];

        // Optional/Expensive Metrics
        $diskInfo = $full ? $this->getDiskInfo($ssh) : ['usage' => 0, 'total' => 0, 'used' => 0];
        $loadInfo = $full ? $this->getLoadAverage($ssh) : ['load_1' => 0, 'load_5' => 0, 'load_15' => 0];
        $uptime = $full ? $this->getUptime($ssh) : 0;
        $topProcesses = $full ? $this->getTopProcesses($ssh) : [];
        $serviceStatus = $full ? $this->getServiceStatus($ssh, $server?->installed_services ?? []) : null;

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
            'is_full' => $full,
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
            if (! in_array($action, $allowedActions)) {
                throw new Exception("Invalid service action: $action");
            }

            // Construct command with sudo
            $cmd = $this->wrapSudo("sudo systemctl $action $service", $server);
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
            $cmd = "sudo tail -n $lines ".$this->escapeRemote($path);
            $finalCmd = $this->wrapSudo($cmd, $server);
            $output = $ssh->exec($finalCmd);
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
     * Wrap a command with sudo and handle password if available
     */
    protected function wrapSudo(string $command, Server $server): string
    {
        // If command doesn't use sudo, or if we're root, just return it
        if (! str_contains($command, 'sudo') || $server->username === 'root') {
            return $command;
        }

        $password = $server->getDecryptedPassword();
        if (empty($password)) {
            return $command;
        }

        // Standard Linux escape for password
        $escapedPassword = str_replace("'", "'\\''", $password);

        // Use a regex to find 'sudo ' (even with multiple spaces) and replace it
        return preg_replace('/sudo\s+/', "echo '$escapedPassword' | sudo -S ", $command);
    }

    /**
     * Escape an argument for a Linux (POSIX) remote shell
     */
    protected function escapeRemote(string $arg): string
    {
        return "'".str_replace("'", "'\\''", $arg)."'";
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

            // Wrap with sudo handling
            $finalCommand = $this->wrapSudo($command, $server);

            // Combine stdout and stderr so we see errors too
            $output = $ssh->exec($finalCommand.' 2>&1');

            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return [
                'success' => true,
                'output' => $output,
                'exit_status' => $exitStatus,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Command failed or timed out: '.$e->getMessage(),
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

            $content = $ssh->exec($this->wrapSudo("sudo cat $path", $server));
            $ssh->disconnect();

            return [
                'success' => true,
                'content' => $content,
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
                    'output' => $validationOutput,
                ];
            }

            // 3. Backup old config
            $finalPath = '/etc/caddy/Caddyfile';
            $ssh->exec($this->wrapSudo("sudo cp $finalPath $finalPath.bak", $server));

            // 4. Move new config to final location
            $ssh->exec($this->wrapSudo("sudo mv $tmpPath $finalPath", $server));

            // 5. Reload Caddy
            $ssh->exec($this->wrapSudo('sudo systemctl reload caddy', $server));

            $ssh->disconnect();

            return [
                'success' => true,
                'message' => 'Caddyfile saved and reloaded successfully',
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function getCpuStats(SSH2 $ssh): array
    {
        $output = $ssh->exec("grep 'cpu ' /proc/stat");
        preg_match('/cpu\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/', $output, $matches);

        if (count($matches) < 8) {
            return ['total' => 0, 'used' => 0];
        }

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

        if ($totalDiff <= 0) {
            return 0.0;
        }

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
        $cmd = 'ps -eo user,pcpu,pmem,comm --sort=-pcpu | head -n 6 | tail -n 5';
        $output = trim($ssh->exec($cmd));
        if (empty($output)) {
            return [];
        }

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
                if (! empty($output)) {
                    $installed[] = $service;
                }
            }

            // Check for PHP-FPM
            $phpFpm = trim($ssh->exec("systemctl list-unit-files | grep php.*-fpm | awk '{print $1}' | head -n 1"));
            if (! empty($phpFpm)) {
                $installed[] = 'php-fpm';
            }

            $ssh->disconnect();

            return $installed;
        } catch (Exception $e) {
            \Log::error("Discovery failed for {$server->name}: ".$e->getMessage());

            return [];
        }
    }

    protected function getServiceStatus(SSH2 $ssh, array $filterServices = []): array
    {
        $services = ! empty($filterServices) ? $filterServices : ['nginx', 'apache2', 'mysql', 'mariadb', 'docker', 'redis', 'caddy', 'php-fpm'];
        $status = [];

        foreach ($services as $service) {
            if ($service === 'php-fpm') {
                $phpFpmStatusCmd = "systemctl list-units --type=service | grep php.*-fpm | awk '{print $1, $4}' | head -n 1";
                $phpFpmOutput = trim($ssh->exec($phpFpmStatusCmd));

                if (! empty($phpFpmOutput)) {
                    $parts = explode(' ', $phpFpmOutput);
                    $serviceName = $parts[0];
                    $isActive = $parts[1] === 'running' ? 'active' : 'inactive';
                    $status['php-fpm'] = [
                        'name' => $serviceName,
                        'status' => $isActive,
                    ];
                } else {
                    // Try to find the name even if stopped
                    $serviceName = trim($ssh->exec("systemctl list-unit-files | grep php.*-fpm | awk '{print $1}' | head -n 1"));
                    if (! empty($serviceName)) {
                        $status['php-fpm'] = [
                            'name' => $serviceName,
                            'status' => 'inactive',
                        ];
                    }
                }

                continue;
            }

            // is-active returns 'active', 'inactive', 'failed', or 'unknown'
            $output = trim($ssh->exec("systemctl is-active $service 2>/dev/null"));

            // if systemctl returns empty or unknown, and we didn't have it in our filter, skip it
            if ((empty($output) || $output === 'unknown') && empty($filterServices)) {
                continue;
            }

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
        $output = $ssh->exec('free -m');

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
            $meminfo = $ssh->exec('cat /proc/meminfo');

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
        $output = $ssh->exec('df -BG / | tail -1');
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
        $output = $ssh->exec('cat /proc/loadavg');
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

    /**
     * Get uptime in seconds
     */
    protected function getUptime(SSH2 $ssh): int
    {
        $output = $ssh->exec("cat /proc/uptime | awk '{print $1}'");

        return (int) floatval(trim($output));
    }

    /**
     * Fetch raw crontab content
     */
    public function fetchCrontab(Server $server): array
    {
        try {
            $ssh = $this->connect($server);

            // Getting crontab can fail if empty, return empty string in that case
            $content = $ssh->exec('crontab -l 2>/dev/null');
            $exitStatus = $ssh->getExitStatus();

            // If exit status is non-zero, it usually means no crontab for user, which is fine (empty)
            if ($exitStatus !== 0 && empty($content)) {
                $content = '';
            }

            $ssh->disconnect();

            return [
                'success' => true,
                'content' => $content,
                'parsed_jobs' => $this->parseCrontab($content),
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Parse raw crontab into structured array
     */
    protected function parseCrontab(string $content): array
    {
        $lines = explode("\n", $content);
        $jobs = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }

            $isComment = str_starts_with($line, '#');

            // Check if it's a commented-out job (common pattern for disabling)
            // e.g. "# * * * * * command"
            // vs "# Just a comment"
            // Simple heuristic: if it looks like a cron schedule after removing #, treat as disabled job

            $cleanLine = $isComment ? trim(substr($line, 1)) : $line;

            // Standard cron regex (5 parts + command) or special strings (@reboot etc)
            // Special strings: @reboot, @yearly, @annually, @monthly, @weekly, @daily, @midnight, @hourly
            $specialPattern = '/^(@reboot|@yearly|@annually|@monthly|@weekly|@daily|@midnight|@hourly)\s+(.+)$/';
            $standardPattern = '/^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/';

            $job = [
                'raw' => $line,
                'is_comment' => $isComment,
                'is_disabled' => false,
                'schedule' => '',
                'command' => '',
                'expression' => '', // Full cron expression part
            ];

            if (preg_match($specialPattern, $cleanLine, $matches)) {
                $job['expression'] = $matches[1];
                $job['schedule'] = $matches[1];
                $job['command'] = $matches[2];
                if ($isComment) {
                    $job['is_disabled'] = true;
                } else {
                    $job['is_comment'] = false;
                } // It's a valid job line

                $jobs[] = $job;
            } elseif (preg_match($standardPattern, $cleanLine, $matches)) {
                $expr = "{$matches[1]} {$matches[2]} {$matches[3]} {$matches[4]} {$matches[5]}";
                $job['expression'] = $expr;
                $job['schedule'] = $expr;
                $job['command'] = $matches[6];
                if ($isComment) {
                    $job['is_disabled'] = true;
                } else {
                    $job['is_comment'] = false;
                }

                $jobs[] = $job;
            } else {
                // Determine if it's a variable assignment (often at top of crontab) or just a comment
                if (str_contains($line, '=')) {
                    $jobs[] = ['type' => 'env', 'raw' => $line];
                } else {
                    $jobs[] = ['type' => 'comment', 'raw' => $line];
                }
            }
        }

        return $jobs;
    }

    /**
     * Save updated crontab
     */
    public function saveCrontab(Server $server, string $content): array
    {
        try {
            $ssh = $this->connect($server);

            // Write to temp file first
            $tmpPath = '/tmp/crontab_'.uniqid();

            // Using base64 to avoid escaping issues with complex characters in cron commands
            $encoded = base64_encode($content);
            $ssh->exec("echo '$encoded' | base64 -d > $tmpPath");

            // Install new crontab
            $output = $ssh->exec("crontab $tmpPath 2>&1");
            $exitStatus = $ssh->getExitStatus();

            // Cleanup
            $ssh->exec("rm $tmpPath");

            if ($exitStatus !== 0) {
                $ssh->disconnect();

                return ['success' => false, 'message' => "Crontab install failed: $output"];
            }

            $ssh->disconnect();

            return ['success' => true, 'message' => 'Crontab updated successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get UFW status and rules
     */
    public function getUfwStatus(Server $server): array
    {
        try {
            $ssh = $this->connect($server);

            // First check if ufw binary exists
            $checkUfw = trim($ssh->exec('which ufw'));
            if (empty($checkUfw)) {
                return [
                    'success' => false,
                    'is_missing' => true,
                    'message' => 'UFW is not installed on this server.',
                ];
            }

            // Check if UFW is installed and get status
            $statusOutput = trim($ssh->exec($this->wrapSudo('sudo ufw status numbered 2>&1', $server)));
            $exitStatus = $ssh->getExitStatus();

            if ($exitStatus !== 0) {
                return [
                    'success' => false,
                    'is_missing' => false,
                    'message' => 'UFW is installed but not accessible (check sudo permissions).',
                    'output' => $statusOutput,
                ];
            }

            $ssh->disconnect();

            return [
                'success' => true,
                'status' => $this->parseUfwStatus($statusOutput),
                'raw' => $statusOutput,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Install UFW on the server
     */
    public function installUfw(Server $server): array
    {
        try {
            $ssh = $this->connect($server);

            // Detect OS and use appropriate package manager
            $osData = $ssh->exec('cat /etc/os-release');

            if (str_contains(strtolower($osData), 'ubuntu') || str_contains(strtolower($osData), 'debian')) {
                $cmd = 'sudo apt-get update && sudo apt-get install -y ufw';
            } elseif (str_contains(strtolower($osData), 'centos') || str_contains(strtolower($osData), 'fedora') || str_contains(strtolower($osData), 'rhel')) {
                $cmd = 'sudo yum install -y ufw || sudo dnf install -y ufw';
            } else {
                return ['success' => false, 'message' => 'Unsupported OS for automatic UFW installation. Please install it manually.'];
            }

            $output = $ssh->exec($this->wrapSudo($cmd, $server));
            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? 'UFW installed successfully' : "Installation failed: $output",
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Parse UFW status output
     */
    protected function parseUfwStatus(string $output): array
    {
        $lines = explode("\n", $output);
        $rules = [];
        $isEnabled = ! str_contains($output, 'Status: inactive');

        foreach ($lines as $line) {
            $line = trim($line);
            // Match "[ 1] 80/tcp ALLOW IN Anywhere"
            if (preg_match('/^\[\s*(\d+)\]\s+(.*?)\s+(ALLOW|DENY|REJECT)\s+(IN|OUT)\s+(.*)$/i', $line, $matches)) {
                $rules[] = [
                    'number' => (int) $matches[1],
                    'to' => trim($matches[2]),
                    'action' => trim($matches[3]),
                    'direction' => trim($matches[4]),
                    'from' => trim($matches[5]),
                ];
            }
        }

        return [
            'enabled' => $isEnabled,
            'rules' => $rules,
        ];
    }

    /**
     * Add a UFW rule
     */
    public function addUfwRule(Server $server, string $port, string $proto = 'tcp', string $action = 'allow'): array
    {
        try {
            $ssh = $this->connect($server);
            $target = $proto === '' ? $port : $port.'/'.$proto;
            $cmd = "sudo ufw $action $target";
            $output = $ssh->exec($this->wrapSudo($cmd, $server));
            $exitStatus = $ssh->getExitStatus() ?? 1;

            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? 'Rule added successfully' : 'Failed to add rule: '.$output,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Add allow rules from specific source IPs/CIDRs
     */
    public function addUfwRuleWithSources(Server $server, string $port, string $proto = 'tcp', array $sourceIps = []): array
    {
        try {
            $ssh = $this->connect($server);
            $lastOutput = '';
            $exitStatus = 0;

            foreach ($sourceIps as $sourceIp) {
                $command = $proto === ''
                    ? 'sudo ufw allow from '.$sourceIp.' to any port '.$port
                    : 'sudo ufw allow from '.$sourceIp.' to any port '.$port.' proto '.$proto;

                $lastOutput = $ssh->exec($this->wrapSudo($command, $server));
                $exitStatus = $ssh->getExitStatus() ?? 1;

                if ($exitStatus !== 0) {
                    break;
                }
            }

            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? 'Rule added successfully' : 'Failed to add rule: '.$lastOutput,
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Delete a UFW rule
     */
    public function deleteUfwRule(Server $server, int $ruleNumber): array
    {
        try {
            $ssh = $this->connect($server);
            // --force to bypass confirmation prompt
            $cmd = "sudo ufw --force delete $ruleNumber";
            $output = $ssh->exec($this->wrapSudo($cmd, $server));
            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? 'Rule deleted successfully' : "Failed to delete rule: $output",
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Enable/Disable UFW
     */
    public function toggleUfw(Server $server, bool $enable): array
    {
        try {
            $ssh = $this->connect($server);
            $action = $enable ? 'enable' : 'disable';
            // enable usually needs confirmation, we can pipe 'y'
            $cmd = $enable ? "echo 'y' | sudo ufw enable" : 'sudo ufw disable';
            $output = $ssh->exec($this->wrapSudo($cmd, $server));
            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return [
                'success' => $exitStatus === 0,
                'message' => $exitStatus === 0 ? 'UFW '.($enable ? 'enabled' : 'disabled').' successfully' : "Failed to toggle UFW: $output",
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Ensure rsync is installed on the server
     */
    public function ensureRsync(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $check = trim($ssh->exec('which rsync'));
            if (! empty($check)) {
                $ssh->disconnect();

                return ['success' => true, 'message' => 'rsync already installed'];
            }

            // Detect OS and install
            $osData = $ssh->exec('cat /etc/os-release');
            if (str_contains(strtolower($osData), 'ubuntu') || str_contains(strtolower($osData), 'debian')) {
                $cmd = 'sudo apt-get update && sudo apt-get install -y rsync';
            } else {
                $cmd = 'sudo yum install -y rsync || sudo dnf install -y rsync';
            }

            $ssh->exec($this->wrapSudo($cmd, $server));
            $exitStatus = $ssh->getExitStatus();
            $ssh->disconnect();

            return ['success' => $exitStatus === 0, 'message' => $exitStatus === 0 ? 'rsync installed' : 'rsync installation failed'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get or generate a public key on the source server
     */
    public function getSourceServerPublicKey(Server $server): string
    {
        $ssh = $this->connect($server);
        $pubKey = trim($ssh->exec('cat ~/.ssh/id_rsa.pub 2>/dev/null'));

        if (empty($pubKey)) {
            // Generate key pair if doesn't exist (no passphrase)
            $ssh->exec("ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ''");
            $pubKey = trim($ssh->exec('cat ~/.ssh/id_rsa.pub'));
        }

        $ssh->disconnect();

        return $pubKey;
    }

    /**
     * Add a key to authorized_keys on destination
     */
    public function authorizePublicKey(Server $server, string $publicKey): bool
    {
        $ssh = $this->connect($server);
        $publicKey = trim($publicKey);
        // Ensure ~/.ssh exists
        $ssh->exec('mkdir -p ~/.ssh && chmod 700 ~/.ssh');
        // Avoid duplicates
        $ssh->exec("grep -qF '$publicKey' ~/.ssh/authorized_keys 2>/dev/null || echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys");
        $exitStatus = $ssh->getExitStatus();
        $ssh->disconnect();

        return $exitStatus === 0;
    }

    /**
     * Remove a key from authorized_keys on destination
     */
    public function revokePublicKey(Server $server, string $publicKey): void
    {
        $ssh = $this->connect($server);
        $publicKey = trim($publicKey);
        // Use a safer way to escape for sed
        $escaped = preg_quote($publicKey, '/');
        $ssh->exec("sed -i '/$escaped/d' ~/.ssh/authorized_keys");
        $ssh->disconnect();
    }

    /**
     * Allow an IP to connect to SSH (port 22) on destination
     */
    public function allowIpInFirewall(Server $server, string $ip): void
    {
        $status = $this->getUfwStatus($server);
        if ($status['success'] && $status['status']['enabled']) {
            $ssh = $this->connect($server);
            $cmd = "sudo ufw allow from $ip to any port {$server->port} proto tcp";
            $ssh->exec($this->wrapSudo($cmd, $server));
            $ssh->disconnect();
        }
    }

    /**
     * Revoke IP allowance in firewall
     */
    public function revokeIpInFirewall(Server $server, string $ip): void
    {
        $status = $this->getUfwStatus($server);
        if ($status['success'] && $status['status']['enabled']) {
            $ssh = $this->connect($server);
            $cmd = "sudo ufw delete allow from $ip to any port {$server->port} proto tcp";
            $ssh->exec($this->wrapSudo($cmd, $server));
            $ssh->disconnect();
        }
    }

    /**
     * Get mysql command with auth or sudo
     */
    protected function getMysqlBaseCmd(Server $server, string $tool = 'mysql'): string
    {
        $user = $server->db_username;
        $pass = $server->getDecryptedDbPassword();

        if ($user && $pass) {
            // Use standard auth WITHOUT sudo to avoid socket/auth conflicts and sudo config issues
            $cmd = "$tool -u".$this->escapeRemote($user).' -p'.$this->escapeRemote($pass);

            return $cmd;
        }

        // Default to sudo if no credentials provided (root bypass)
        return $this->wrapSudo("sudo $tool", $server);
    }

    /**
     * Get list of MySQL databases
     */
    public function getDatabases(Server $server): array
    {
        try {
            $ssh = $this->connect($server);
            $baseCmd = $this->getMysqlBaseCmd($server);
            // Ignore stderr to filter out password warnings, or capture everything and filter later
            // It's safer to capture stderr (2>&1) and filter warnings manually so we don't miss errors
            $cmd = "$baseCmd -e 'SHOW DATABASES;' -s -N 2>&1";

            $output = trim($ssh->exec($cmd));
            $ssh->disconnect();

            if (empty($output) || (str_contains($output, 'ERROR') && ! str_contains($output, '[Warning]'))) {
                // If real error
                if (str_contains($output, 'ERROR')) {
                    return [substr($output, 0, 100)];
                }

                return [];
            }

            $lines = explode("\n", $output);
            // Filter out warnings
            $dbs = array_filter($lines, function ($line) {
                return ! str_contains($line, '[Warning]') && ! empty(trim($line));
            });

            return array_filter($dbs, function ($db) {
                return ! in_array($db, ['information_schema', 'mysql', 'performance_schema', 'sys']);
            });
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get database size and basic stats
     */
    public function getDatabaseStats(Server $server, string $database): array
    {
        try {
            $ssh = $this->connect($server);
            $baseCmd = $this->getMysqlBaseCmd($server);
            $query = 'SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb, COUNT(*) as tables_count FROM information_schema.TABLES WHERE table_schema = '.$this->escapeRemote($database);
            // Redirect stderr to ignore warnings, same as getDatabases
            $output = trim($ssh->exec("$baseCmd -e \"$query\" -s -N 2>&1"));
            $ssh->disconnect();

            // Clean user warnings from output
            $lines = explode("\n", $output);
            $cleanLines = array_filter($lines, function ($line) {
                return ! str_contains($line, '[Warning]') && ! empty(trim($line));
            });
            $cleanOutput = implode(' ', $cleanLines); // Should be single line: size count

            $parts = preg_split('/\s+/', trim($cleanOutput));

            return [
                'size_mb' => round((float) ($parts[0] ?? 0), 2),
                'tables_count' => (int) ($parts[1] ?? 0),
            ];
        } catch (Exception $e) {
            return ['size_mb' => 0, 'tables_count' => 0];
        }
    }

    /**
     * Fast Pipeline Transfer: Source -> Destination
     */
    public function transferDatabase(Server $source, Server $destination, string $dbName, string $destDbName): array
    {
        try {
            // 1. Ensure security
            $pubKey = $this->getSourceServerPublicKey($source);
            $this->authorizePublicKey($destination, $pubKey);
            $this->allowIpInFirewall($destination, $source->ip);

            // 2. Prepare command
            $sourceDump = $this->getMysqlBaseCmd($source, 'mysqldump').' --opt '.$this->escapeRemote($dbName);
            $destBase = $this->getMysqlBaseCmd($destination, 'mysql');

            // Remote command needs careful quoting
            $remoteCmd = "$destBase -e 'CREATE DATABASE IF NOT EXISTS ".$this->escapeRemote($destDbName).";' && $destBase ".$this->escapeRemote($destDbName);

            $cmd = "$sourceDump | ssh -p {$destination->port} -o StrictHostKeyChecking=no {$destination->username}@{$destination->ip} ".$this->escapeRemote($remoteCmd);

            // 3. Execute from source
            $result = $this->executeRaw($source, $cmd);

            // 4. Cleanup
            $this->revokePublicKey($destination, $pubKey);
            $this->revokeIpInFirewall($destination, $source->ip);

            return $result;
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Reboot the server
     */
    public function rebootServer(Server $server): array
    {
        try {
            $ssh = $this->connect($server);

            // Reboot command usually kills the connection, so we don't expect a clean discharge
            $ssh->setTimeout(5);
            $cmd = $this->wrapSudo('sudo reboot', $server);
            $ssh->exec($cmd);

            // We disconnect manually if the server hasn't already closed it
            try {
                $ssh->disconnect();
            } catch (Exception $e) {
            }

            return [
                'success' => true,
                'message' => 'Reboot command sent successfully. Server is restarting.',
            ];
        } catch (Exception $e) {
            // If connection is lost immediately, it might actually be a success
            if (str_contains($e->getMessage(), 'Connection lost') || str_contains($e->getMessage(), 'Broken pipe')) {
                return [
                    'success' => true,
                    'message' => 'Reboot command sent. Connection lost as expected.',
                ];
            }

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
