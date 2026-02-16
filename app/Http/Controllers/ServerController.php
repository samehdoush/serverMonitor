<?php

namespace App\Http\Controllers;

use App\Jobs\StreamServerMetrics;
use App\Models\Metric;
use App\Models\Server;
use App\Services\SshService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Native\Desktop\Dialog;
use Native\Desktop\Facades\Notification;

class ServerController extends Controller
{
    public function startStream(Server $server)
    {
        $lockKey = "stream_lock_{$server->id}";

        // Use a lock for 60 seconds to prevent multiple clicks/dispatches
        if (\Illuminate\Support\Facades\Cache::lock($lockKey, 60)->get()) {
            StreamServerMetrics::dispatch($server);

            return back()->with('message', 'Streaming started');
        }

        return back()->with('warning', 'Streaming already in progress');
    }

    public function index()
    {
        $servers = Server::with('latestMetric')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Servers/Index', [
            'servers' => $servers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Servers/Form', [
            'server' => null,
        ]);
    }

    public function store(Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ip' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'auth_type' => 'required|in:key,password',
            'password' => 'nullable|string|required_if:auth_type,password',
            'ssh_key_path' => 'nullable|string|required_if:auth_type,key',
            'key_password' => 'nullable|string',
            'cpu_threshold' => 'required|integer|min:1|max:100',
            'ram_threshold' => 'required|integer|min:1|max:100',
            'disk_threshold' => 'required|integer|min:1|max:100',
        ]);

        // set position at the end by default
        $validated['sort_order'] = (int) Server::max('sort_order') + 1;

        $server = Server::create($validated);

        // Auto-discover services immediately
        try {
            $services = $sshService->discoverServices($server);
            $server->update(['installed_services' => $services]);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::warning("Auto-discovery failed for new server {$server->name}: ".$e->getMessage());
        }

        return redirect()->route('servers.index')
            ->with('success', 'Server added successfully');
    }

    public function show(Server $server)
    {
        $metrics = $server->metrics()
            ->where('recorded_at', '>=', now()->subDays(3))
            ->orderBy('recorded_at', 'asc')
            ->get();
    

        return Inertia::render('Servers/Show', [
            'server' => $server->load('latestMetric'),
            'metrics' => $metrics,
        ]);
    }

    public function edit(Server $server)
    {
        return Inertia::render('Servers/Form', [
            'server' => $server,
        ]);
    }

    public function update(Request $request, Server $server)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ip' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'auth_type' => 'required|in:key,password',
            'password' => 'nullable|string', // Only update if provided
            'ssh_key_path' => 'nullable|string|required_if:auth_type,key',
            'key_password' => 'nullable|string',
            'cpu_threshold' => 'required|integer|min:1|max:100',
            'ram_threshold' => 'required|integer|min:1|max:100',
            'disk_threshold' => 'required|integer|min:1|max:100',
            'db_username' => 'nullable|string|max:255',
            'db_password' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Only update passwords if provided
        if (empty($validated['key_password'])) {
            unset($validated['key_password']);
        }
        if (empty($validated['password']) && $request->auth_type === 'password') {
            // If switching to password but no new password provided, keep old one?
            // Actually, usually users re-enter pass. But let's assume if empty we keep old one.
            // However, for security, usually re-entry is required when changing auth type.
            // But if updating other fields, we don't want to wipe password.
            // If auth_type changed to password, password is required.
            if ($server->auth_type !== 'password') {
                $request->validate(['password' => 'required']);
            } else {
                unset($validated['password']);
            }
        } elseif (! empty($validated['password'])) {
            // Password provided, update it
        } else {
            unset($validated['password']);
        }

        if (empty($validated['db_password'])) {
            unset($validated['db_password']);
        }

        $server->update($validated);

        // In NativePHP, we might want to stay on the page or go back
        return to_route('servers.index')
            ->with('success', 'Server updated successfully');
    }

    public function destroy(Server $server)
    {
        $server->delete();

        return to_route('servers.index')
            ->with('success', 'Server deleted successfully');
    }

    public function testConnection(Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'ip' => 'required|string',
            'username' => 'required|string',
            'port' => 'required|integer',
            'auth_type' => 'required|in:key,password',
            'password' => 'nullable|string|required_if:auth_type,password',
            'ssh_key_path' => 'nullable|string|required_if:auth_type,key',
            'key_password' => 'nullable|string',
        ]);

        // Create a temporary server object for testing
        $server = new Server($validated);

        $result = $sshService->testConnection($server);

        return response()->json($result);
    }

    public function selectSshKey()
    {
        $path = Dialog::new()
            ->title('Select SSH Key')
            ->filter('SSH Keys', ['pem', 'ppk', 'key', ''])
            ->filter('All Files', ['*'])
            ->open();

        return response()->json(['path' => $path]);
    }

    public function getMetrics(Server $server)
    {
        $metrics = $server->metrics()
            ->orderBy('recorded_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'server' => $server->load('latestMetric'),
            'metrics' => $metrics,
        ]);
    }

    public function fetchLive(Server $server, SshService $sshService)
    {
        $result = $sshService->getMetrics($server);

        if ($result['success']) {
            Metric::create([
                'server_id' => $server->id,
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

            $server->update(['last_connected_at' => now()]);

            // Check thresholds for immediate notification
            $alerts = [];
            if ($result['cpu_usage'] >= $server->cpu_threshold) {
                $alerts[] = "CPU at {$result['cpu_usage']}%";
            }
            if ($result['ram_usage'] >= $server->ram_threshold) {
                $alerts[] = "RAM at {$result['ram_usage']}%";
            }
            if ($result['disk_usage'] >= $server->disk_threshold) {
                $alerts[] = "Disk at {$result['disk_usage']}%";
            }

            if (! empty($alerts)) {
                Notification::title("⚠️ Alert: {$server->name}")
                    ->message(implode(', ', $alerts))
                    ->show();
            }
        }

        return $this->getMetrics($server);
    }

    public function serviceAction(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'service' => 'required|string',
            'action' => 'required|string|in:start,stop,restart,reload',
        ]);

        $result = $sshService->runServiceAction($server, $validated['service'], $validated['action']);

        return response()->json($result);
    }

    public function fetchLog(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'path' => 'required|string',
            'lines' => 'nullable|integer|min:1|max:1000',
        ]);

        $result = $sshService->tailLog($server, $validated['path'], $validated['lines'] ?? 100);

        return response()->json($result);
    }

    public function executeTerminal(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'command' => 'required|string',
        ]);

        $result = $sshService->executeRaw($server, $validated['command']);

        return response()->json($result);
    }

    public function discoverServices(Server $server, SshService $sshService)
    {
        $services = $sshService->discoverServices($server);
        $server->update(['installed_services' => $services]);

        return response()->json([
            'success' => true,
            'services' => $services,
        ]);
    }

    /**
     * Reorder servers (persist sort_order)
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:servers,id',
        ]);

        \DB::transaction(function () use ($validated) {
            foreach ($validated['order'] as $index => $id) {
                Server::where('id', $id)->update(['sort_order' => $index]);
            }
        });

        return response()->json(['success' => true]);
    }

    public function getCaddyfile(Server $server, SshService $sshService)
    {
        $result = $sshService->readCaddyfile($server);

        return response()->json($result);
    }

    public function saveCaddyfile(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $result = $sshService->saveCaddyfile($server, $validated['content']);

        return response()->json($result);
    }

    public function getCrontab(Server $server, SshService $sshService)
    {
        $result = $sshService->fetchCrontab($server);

        return response()->json($result);
    }

    public function saveCrontab(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $result = $sshService->saveCrontab($server, $validated['content']);

        return response()->json($result);
    }

    public function getFirewall(Server $server, SshService $sshService)
    {
        $result = $sshService->getUfwStatus($server);

        return response()->json($result);
    }

    public function addFirewallRule(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'port' => 'required|string',
            'proto' => 'required|string|in:tcp,udp,any',
            'action' => 'required|string|in:allow,deny,reject',
        ]);

        $proto = $validated['proto'] === 'any' ? '' : $validated['proto'];
        $result = $sshService->addUfwRule($server, $validated['port'], $proto, $validated['action']);

        return response()->json($result);
    }

    public function deleteFirewallRule(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'rule_number' => 'required|integer',
        ]);

        $result = $sshService->deleteUfwRule($server, $validated['rule_number']);

        return response()->json($result);
    }

    public function toggleFirewall(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'enable' => 'required|boolean',
        ]);

        $result = $sshService->toggleUfw($server, $validated['enable']);

        return response()->json($result);
    }

    public function installFirewall(Server $server, SshService $sshService)
    {
        $result = $sshService->installUfw($server);

        return response()->json($result);
    }

    public function getDatabases(Server $server, SshService $sshService)
    {
        try {
            $databases = $sshService->getDatabases($server);

            // If SshService returned nothing, surface a helpful error to the UI so
            // the user can verify DB credentials / sudo permissions on the remote host.
            if (empty($databases)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No databases found or access denied. Verify DB credentials, sudo permissions, and that the `mysql` client is installed on the server.',
                ]);
            }

            // SshService may return an error string as a single-array element (e.g. "ERROR: ...").
            if (count($databases) === 1 && is_string($databases[0]) && preg_match('/error/i', $databases[0])) {
                return response()->json([
                    'success' => false,
                    'message' => $databases[0],
                ]);
            }

            $results = [];

            foreach ($databases as $db) {
                $results[] = array_merge(['name' => $db], $sshService->getDatabaseStats($server, $db));
            }

            return response()->json([
                'success' => true,
                'databases' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving databases: '.$e->getMessage(),
            ]);
        }
    }

    public function transferDatabase(Server $server, Request $request, SshService $sshService)
    {
        $validated = $request->validate([
            'database' => 'required|string',
            'destination_server_id' => 'required|exists:servers,id',
            'destination_database' => 'required|string',
        ]);

        $destination = Server::findOrFail($validated['destination_server_id']);

        $result = $sshService->transferDatabase($server, $destination, $validated['database'], $validated['destination_database']);

        return response()->json($result);
    }
}
