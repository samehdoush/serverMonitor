<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileSyncTask extends Model
{
    protected $fillable = [
        'name',
        'source_server_id',
        'destination_server_id',
        'source_path',
        'destination_path',
        'delete_extra',
        'last_run_at',
        'last_status',
        'last_output',
    ];

    protected $casts = [
        'delete_extra' => 'boolean',
        'last_run_at' => 'datetime',
    ];

    public function sourceServer()
    {
        return $this->belongsTo(Server::class, 'source_server_id');
    }

    public function destinationServer()
    {
        return $this->belongsTo(Server::class, 'destination_server_id');
    }
}
