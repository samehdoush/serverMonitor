<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Metric extends Model
{
    protected $fillable = [
        'server_id',
        'cpu_usage',
        'ram_usage',
        'ram_total',
        'ram_used',
        'swap_usage',
        'swap_total',
        'swap_used',
        'disk_usage',
        'disk_total',
        'disk_used',
        'network_rx_kb',
        'network_tx_kb',
        'disk_read_kb',
        'disk_write_kb',
        'top_processes',
        'service_status',
        'load_1',
        'load_5',
        'load_15',
        'uptime_seconds',
        'recorded_at',
    ];

    protected $casts = [
        'cpu_usage' => 'float',
        'ram_usage' => 'float',
        'ram_total' => 'float',
        'ram_used' => 'float',
        'disk_usage' => 'float',
        'disk_total' => 'float',
        'disk_used' => 'float',
        'network_rx_kb' => 'float',
        'network_tx_kb' => 'float',
        'disk_read_kb' => 'float',
        'disk_write_kb' => 'float',
        'top_processes' => 'array',
        'service_status' => 'array',
        'load_1' => 'float',
        'load_5' => 'float',
        'load_15' => 'float',
        'uptime_seconds' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
