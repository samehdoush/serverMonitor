<?php

namespace App\Http\Controllers;

use App\Models\FileSyncTask;
use App\Models\Server;
use App\Services\SshService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FileSyncController extends Controller
{
    public function index()
    {
        return Inertia::render('FileSync/Index', [
            'tasks' => FileSyncTask::with(['sourceServer', 'destinationServer'])->get(),
            'servers' => Server::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'source_server_id' => 'required|exists:servers,id',
            'destination_server_id' => 'required|exists:servers,id|different:source_server_id',
            'source_path' => 'required|string',
            'destination_path' => 'required|string',
            'delete_extra' => 'boolean',
        ]);

        FileSyncTask::create($validated);

        return back()->with('success', 'Sync task created successfully');
    }

    public function update(Request $request, FileSyncTask $fileSync)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'source_server_id' => 'required|exists:servers,id',
            'destination_server_id' => 'required|exists:servers,id|different:source_server_id',
            'source_path' => 'required|string',
            'destination_path' => 'required|string',
            'delete_extra' => 'boolean',
        ]);

        $fileSync->update($validated);

        return back()->with('success', 'Sync task updated successfully');
    }

    public function destroy(FileSyncTask $fileSync)
    {
        $fileSync->delete();

        return back()->with('success', 'Sync task deleted');
    }

    public function run(FileSyncTask $fileSync, SshService $sshService)
    {
        $task = $fileSync; // Matching route param name
        $source = $task->sourceServer;
        $dest = $task->destinationServer;

        try {
            // 1. Ensure rsync on both
            $sshService->ensureRsync($source);
            $sshService->ensureRsync($dest);

            // 2. Prepare Source SSH Key
            $pubKey = $sshService->getSourceServerPublicKey($source);

            // 3. Authorize on Destination
            $sshService->authorizePublicKey($dest, $pubKey);
            $sshService->allowIpInFirewall($dest, $source->ip);

            // 4. Run Sync from Source
            // Format: rsync -avz --delete -e "ssh -p PORT -o StrictHostKeyChecking=no" /source/ user@dest-ip:/dest/
            $delete = $task->delete_extra ? '--delete' : '';
            // Ensure paths end with / if we want to sync contents, but usually user provides what they want.
            // Let's assume absolute paths.
            $rsyncCmd = "rsync -avz $delete -e \"ssh -p {$dest->port} -o StrictHostKeyChecking=no\" {$task->source_path} {$dest->username}@{$dest->ip}:{$task->destination_path}";

            // We use executeRaw which already handles terminal output and timeout
            $result = $sshService->executeRaw($source, $rsyncCmd);

            // 5. Cleanup
            $sshService->revokePublicKey($dest, $pubKey);
            $sshService->revokeIpInFirewall($dest, $source->ip);

            // 6. Update Task
            $task->update([
                'last_run_at' => now(),
                'last_status' => ($result['success'] && (isset($result['exit_status']) && $result['exit_status'] === 0)) ? 'success' : 'failed',
                'last_output' => $result['output'] ?? ($result['message'] ?? 'Unknown error'),
            ]);

            return response()->json([
                'success' => ($result['success'] && (isset($result['exit_status']) && $result['exit_status'] === 0)),
                'output' => $result['output'] ?? ($result['message'] ?? 'Unknown error'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
