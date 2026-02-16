<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Native\Desktop\Dialog;
use App\Models\Metric;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BackupController extends Controller
{
    public function index()
    {
        return Inertia::render('Backup');
    }

    public function export()
    {
        $path = Dialog::new()
            ->title('Export Servers Backup')
            ->filter('JSON Files', ['json'])
            ->defaultPath('servers_backup_' . date('Y-m-d') . '.json')
            ->save();

        if (!$path) {
            return back()->with('error', 'Export cancelled');
        }

        $data = [
            'exported_at' => now()->toIso8601String(),
            'servers' => Server::all()->map(function ($server) {
                return [
                    'name' => $server->name,
                    'ip' => $server->ip,
                    'username' => $server->username,
                    'port' => $server->port,
                    'auth_type' => $server->auth_type,
                    'password' => $server->getDecryptedPassword(), // Export plain password? Be careful.
                    'ssh_key_path' => $server->ssh_key_path,
                    'cpu_threshold' => $server->cpu_threshold,
                    'ram_threshold' => $server->ram_threshold,
                    'disk_threshold' => $server->disk_threshold,
                    'is_active' => $server->is_active,
                ];
            })->toArray(),
        ];

        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));

        return back()->with('success', 'Backup exported successfully to: ' . $path);
    }

    public function import()
    {
        $path = Dialog::new()
            ->title('Import Servers Backup')
            ->filter('JSON Files', ['json'])
            ->open();

        if (!$path) {
            return back()->with('error', 'Import cancelled');
        }

        $content = file_get_contents($path);
        // Sometimes Dialog returns path with quotes? No, NativePHP simplified that.
        // But let's check if path is actually content if something weird happens? No.
        
        $data = json_decode($content, true);

        if (!isset($data['servers']) || !is_array($data['servers'])) {
            return back()->with('error', 'Invalid backup file format');
        }

        $imported = 0;
        $skipped = 0;

        foreach ($data['servers'] as $serverData) {
            // Check if server with same IP already exists
            $existing = Server::where('ip', $serverData['ip'])->first();

            if ($existing) {
                $skipped++;
                continue;
            }

            Server::create([
                'name' => $serverData['name'],
                'ip' => $serverData['ip'],
                'username' => $serverData['username'],
                'port' => $serverData['port'] ?? 22,
                'auth_type' => $serverData['auth_type'] ?? 'key',
                'password' => $serverData['password'] ?? null,
                'ssh_key_path' => $serverData['ssh_key_path'] ?? null,
                'cpu_threshold' => $serverData['cpu_threshold'] ?? 80,
                'ram_threshold' => $serverData['ram_threshold'] ?? 80,
                'disk_threshold' => $serverData['disk_threshold'] ?? 80,
                'is_active' => $serverData['is_active'] ?? true,
            ]);

            $imported++;
        }

        return back()->with('success', "Imported {$imported} servers, skipped {$skipped} duplicates");
    }
}
