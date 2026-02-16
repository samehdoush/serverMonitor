<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Server extends Model
{
    protected $fillable = [
        'name',
        'ip',
        'username',
        'port',
        'auth_type',
        'password',
        'ssh_key_path',
        'key_password',
        'cpu_threshold',
        'ram_threshold',
        'disk_threshold',
        'installed_services',
        'is_active',
        'last_connected_at',
    ];

    protected $casts = [
        'port' => 'integer',
        'cpu_threshold' => 'integer',
        'ram_threshold' => 'integer',
        'disk_threshold' => 'integer',
        'installed_services' => 'array',
        'is_active' => 'boolean',
        'last_connected_at' => 'datetime',
    ];

    protected $hidden = [
        'key_password',
        'password',
    ];

    protected $appends = [
        'cpu_usage',
        'ram_usage',
        'disk_usage',
    ];

    public function getCpuUsageAttribute(): float
    {
        return $this->latestMetric?->cpu_usage ?? 0.0;
    }

    public function getRamUsageAttribute(): float
    {
        return $this->latestMetric?->ram_usage ?? 0.0;
    }

    public function getDiskUsageAttribute(): float
    {
        return $this->latestMetric?->disk_usage ?? 0.0;
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(Metric::class);
    }

    public function latestMetric(): HasOne
    {
        return $this->hasOne(Metric::class)->latest('recorded_at');
    }

    /**
     * Get decrypted key password
     */
    public function getDecryptedKeyPassword(): ?string
    {
        if (empty($this->key_password)) {
            return null;
        }

        return decrypt($this->key_password);
    }

    /**
     * Set encrypted key password
     */
    public function setKeyPasswordAttribute($value): void
    {
        $this->attributes['key_password'] = $value ? encrypt($value) : null;
    }

    /**
     * Get decrypted password
     */
    public function getDecryptedPassword(): ?string
    {
        if (empty($this->password)) {
            return null;
        }

        return decrypt($this->password);
    }

    /**
     * Set encrypted password
     */
    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = $value ? encrypt($value) : null;
    }
}
