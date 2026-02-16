<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Servers
Route::resource('servers', ServerController::class);
Route::post('/servers/test-connection', [ServerController::class, 'testConnection'])->name('servers.test-connection');

// Reorder servers (drag & drop)
Route::post('/servers/reorder', [ServerController::class, 'reorder'])->name('servers.reorder');
Route::get('/servers/{server}/metrics', [ServerController::class, 'getMetrics'])->name('servers.metrics');
Route::get('/servers/{server}/fetch-live', [ServerController::class, 'fetchLive'])->name('servers.fetch-live');
Route::post('/servers/{server}/stream', [ServerController::class, 'startStream'])->name('servers.stream');
Route::post('/servers/{server}/service-action', [ServerController::class, 'serviceAction'])->name('servers.service-action');
Route::post('/servers/{server}/fetch-log', [ServerController::class, 'fetchLog'])->name('servers.fetch-log');
Route::post('/servers/{server}/terminal', [ServerController::class, 'executeTerminal'])->name('servers.terminal');
Route::post('/servers/{server}/discover-services', [ServerController::class, 'discoverServices'])->name('servers.discover-services');
Route::post('/servers/{server}/reboot', [ServerController::class, 'reboot'])->name('servers.reboot');
Route::get('/servers/{server}/caddyfile', [ServerController::class, 'getCaddyfile'])->name('servers.caddyfile');
Route::post('/servers/{server}/caddyfile', [ServerController::class, 'saveCaddyfile'])->name('servers.caddyfile.save');
Route::post('/select-ssh-key', [ServerController::class, 'selectSshKey'])->name('select-ssh-key');
Route::get('/servers/{server}/crontab', [ServerController::class, 'getCrontab'])->name('servers.crontab');
Route::post('/servers/{server}/crontab', [ServerController::class, 'saveCrontab'])->name('servers.crontab.save');
Route::get('/servers/{server}/firewall', [ServerController::class, 'getFirewall'])->name('servers.firewall');
Route::post('/servers/{server}/firewall/rule', [ServerController::class, 'addFirewallRule'])->name('servers.firewall.rule');
Route::delete('/servers/{server}/firewall/rule', [ServerController::class, 'deleteFirewallRule'])->name('servers.firewall.rule.delete');
Route::post('/servers/{server}/firewall/toggle', [ServerController::class, 'toggleFirewall'])->name('servers.firewall.toggle');
Route::post('/servers/{server}/firewall/install', [ServerController::class, 'installFirewall'])->name('servers.firewall.install');
Route::get('/servers/{server}/databases', [ServerController::class, 'getDatabases'])->name('servers.databases');
Route::post('/servers/{server}/databases/transfer', [ServerController::class, 'transferDatabase'])->name('servers.databases.transfer');

// Recipes
use App\Http\Controllers\RecipeController;

Route::resource('recipes', RecipeController::class);
Route::get('/api/recipes', [RecipeController::class, 'getAll'])->name('recipes.all');
Route::post('/servers/{server}/recipes/{recipe}/run', [RecipeController::class, 'run'])->name('servers.recipes.run');

// File Sync
use App\Http\Controllers\FileSyncController;

Route::resource('file-sync', FileSyncController::class);
Route::post('/file-sync/{file_sync}/run', [FileSyncController::class, 'run'])->name('file-sync.run');

// Backup & Restore
Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
Route::post('/backup/export', [BackupController::class, 'export'])->name('backup.export');
Route::post('/backup/import', [BackupController::class, 'import'])->name('backup.import');

// Settings
Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

// Menu Bar
Route::get('/menubar', [\App\Http\Controllers\MenuBarController::class, 'index'])->name('menubar.index');
Route::get('/menubar/focus', [\App\Http\Controllers\MenuBarController::class, 'focusMain'])->name('menubar.focus');
Route::get('/menubar/servers/{server}', [\App\Http\Controllers\MenuBarController::class, 'openServer'])->name('menubar.open-server');
Route::get('/menubar/settings', [\App\Http\Controllers\MenuBarController::class, 'openSettings'])->name('menubar.open-settings');
