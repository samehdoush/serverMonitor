<?php

namespace App\Providers;

use Native\Desktop\Facades\Window;
use Native\Desktop\Facades\MenuBar;
use Native\Desktop\Facades\System;
use Native\Desktop\Contracts\ProvidesPhpIni;
use Illuminate\Support\Facades\Log;

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
            Window::open()
                ->width(1280)
                ->height(800)
                ->title('Server Monitor')
                ->rememberState()
                ->showDevTools(false);
                
            Log::info('Window opened');
                
            MenuBar::create()
                ->icon(public_path('images/tray-icon.png'))
                ->withContextMenu(function ($menu) {
                    $menu->link('https://nativephp.com', 'Documentation');
                    $menu->separator();
                    $menu->quit();
                });
                
            Log::info('MenuBar created');
        } catch (\Exception $e) {
            Log::error('NativeApp boot failed: ' . $e->getMessage());
        }
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [
        ];
    }
}
