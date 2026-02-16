<?php

namespace App\Providers;

use Illuminate\Support\Facades\Log;
use Native\Desktop\Contracts\ProvidesPhpIni;
use Native\Desktop\Facades\Menu;
use Native\Desktop\Facades\MenuBar;
use Native\Desktop\Facades\Window;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        Log::info('NativeApp boot started');

        try {
            Window::open('main')
                ->width(1280)
                ->height(800)
                ->title('Server Monitor')
                ->rememberState()
                ->showDevTools(false);

            Log::info('Window opened');

            $serverCount = 0;
            $activeCount = 0;
            try {
                $servers = \App\Models\Server::all();
                $serverCount = $servers->count();
                $activeCount = $servers->where('is_active', true)->count();
            } catch (\Exception $e) {
                Log::warning('Could not fetch servers for MenuBar label: '.$e->getMessage());
            }

            MenuBar::create()
                ->route('menubar.index')
                ->width(350)
                ->height(450)
                ->label($serverCount > 0 ? "{$activeCount}/{$serverCount} Online" : 'Monitor')
                ->tooltip('Server Monitor - Quick Status')
                ->withContextMenu(
                    Menu::make(
                        Menu::label('Server Monitor'),
                        Menu::separator(),
                        Menu::route('menubar.focus', 'Open Dashboard'),
                        Menu::route('menubar.open-settings', 'Settings'),
                        $serverCount > 0 ? Menu::label("Status: {$activeCount} of {$serverCount} active") : null,
                        Menu::separator(),
                        Menu::quit()
                    )
                );

            // Application Menu
            $serverMenu = Menu::make();
            try {
                $servers = \App\Models\Server::orderBy('sort_order')->get();
                if ($servers->isEmpty()) {
                    $serverMenu->label('No servers added')->disabled();
                } else {
                    foreach ($servers as $server) {
                        $serverMenu->add(
                            Menu::link(route('menubar.open-server', ['server' => $server->id]), $server->name)
                        );
                    }
                }
            } catch (\Exception $e) {
                $serverMenu->label('Error loading servers')->disabled();
            }

            Menu::create(
                Menu::app(),
                Menu::make(
                    Menu::route('menubar.focus', 'Dashboard', 'CmdOrCtrl+D'),
                    Menu::route('servers.create', 'Add New Server', 'CmdOrCtrl+N'),
                    Menu::separator(),
                    Menu::route('menubar.open-settings', 'Settings', 'CmdOrCtrl+,'),
                    Menu::separator(),
                    Menu::quit()
                )->label('File'),
                Menu::edit(),
                Menu::view(),
                $serverMenu->label('Servers'),
                Menu::make(
                    Menu::link('https://nativephp.com', 'NativePHP Docs'),
                    Menu::link('https://github.com', 'GitHub Repository')
                )->label('Help')
            );

            Log::info('MenuBar and Application Menu created');
        } catch (\Exception $e) {
            Log::error('NativeApp boot failed: '.$e->getMessage());
        }
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [
            'memory_limit' => '512M',
            'display_errors' => '0',
            'error_reporting' => 'E_ALL & ~E_DEPRECATED & ~E_STRICT',
            'max_execution_time' => '0',
            'max_input_time' => '0',
        ];
    }
}
