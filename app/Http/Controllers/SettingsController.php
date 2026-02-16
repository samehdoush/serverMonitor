<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Native\Desktop\Facades\App;
use Native\Desktop\Facades\Settings;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings', [
            'settings' => [
                'start_on_boot' => Settings::get('start_on_boot', false),
                'monitoring_interval' => Settings::get('monitoring_interval', 60), // seconds
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'start_on_boot' => 'boolean',
            'monitoring_interval' => 'integer|min:30|max:600',
        ]);

        Settings::set('start_on_boot', $validated['start_on_boot'] ?? false);
        Settings::set('monitoring_interval', $validated['monitoring_interval'] ?? 60);

        // Configure start on boot
        if ($validated['start_on_boot'] ?? false) {
            App::openAtLogin(true);
        } else {
            App::openAtLogin(false);
        }

        return back()->with('success', 'Settings saved successfully');
    }
}
