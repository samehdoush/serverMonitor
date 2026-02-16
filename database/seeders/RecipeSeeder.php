<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recipes = [
            [
                'name' => 'Update & Upgrade',
                'description' => 'Update package lists and upgrade all packages.',
                'command' => 'sudo apt update && sudo apt upgrade -y',
                'category' => 'System',
            ],
            [
                'name' => 'Docker Cleanup',
                'description' => 'Clean up unused Docker images, containers, and networks.',
                'command' => 'sudo docker system prune -f',
                'category' => 'Docker',
            ],
            [
                'name' => 'Laravel Clear Cache',
                'description' => 'Clear all Laravel caches (config, route, view, etc.).',
                'command' => 'php artisan optimize:clear',
                'category' => 'Laravel',
            ],
            [
                'name' => 'Caddy Server Restart',
                'description' => 'Restart the Caddy web server.',
                'command' => 'sudo systemctl restart caddy',
                'category' => 'System',
            ],
            [
                'name' => 'Check Disk Space',
                'description' => 'Check available disk space on all mounted partitions.',
                'command' => 'df -h',
                'category' => 'System',
            ],
        ];

        foreach ($recipes as $recipe) {
            \App\Models\Recipe::updateOrCreate(['name' => $recipe['name']], $recipe);
        }
    }
}
