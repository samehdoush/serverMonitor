<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Servers
Route::resource('servers', ServerController::class);
Route::post('/servers/test-connection', [ServerController::class, 'testConnection'])->name('servers.test-connection');
Route::get('/servers/{server}/metrics', [ServerController::class, 'getMetrics'])->name('servers.metrics');
Route::get('/servers/{server}/fetch-live', [ServerController::class, 'fetchLive'])->name('servers.fetch-live');
Route::post('/servers/{server}/stream', [ServerController::class, 'startStream'])->name('servers.stream');
Route::post('/servers/{server}/service-action', [ServerController::class, 'serviceAction'])->name('servers.service-action');
Route::post('/servers/{server}/fetch-log', [ServerController::class, 'fetchLog'])->name('servers.fetch-log');
Route::post('/servers/{server}/terminal', [ServerController::class, 'executeTerminal'])->name('servers.terminal');
Route::post('/servers/{server}/discover-services', [ServerController::class, 'discoverServices'])->name('servers.discover-services');
Route::get('/servers/{server}/caddyfile', [ServerController::class, 'getCaddyfile'])->name('servers.caddyfile');
Route::post('/servers/{server}/caddyfile', [ServerController::class, 'saveCaddyfile'])->name('servers.caddyfile.save');
Route::post('/select-ssh-key', [ServerController::class, 'selectSshKey'])->name('select-ssh-key');

// Backup & Restore
Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
Route::post('/backup/export', [BackupController::class, 'export'])->name('backup.export');
Route::post('/backup/import', [BackupController::class, 'import'])->name('backup.import');

// Settings
Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
