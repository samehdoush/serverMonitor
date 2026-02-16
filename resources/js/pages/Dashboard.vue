<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

interface Server {
    id: number;
    name: string;
    ip: string;
    is_active: boolean;
    last_connected_at: string | null;
    cpu_usage: number;
    ram_usage: number;
    disk_usage: number;
    cpu_threshold: number;
    ram_threshold: number;
    disk_threshold: number;
}

defineProps<{
    servers: Server[];
}>();

const getStatusColor = (value: number, threshold: number): string => {
    if (value >= threshold) return 'critical';
    if (value >= threshold * 0.8) return 'warning';
    return 'normal';
};

const getProgressColor = (status: string): string => {
    switch (status) {
        case 'critical': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#22c55e';
    }
};

const refreshData = () => {
    router.reload({ only: ['servers'] });
};

// Auto-refresh every 30 seconds
setInterval(refreshData, 30000);
</script>

<template>
    <AppLayout>
        <div class="dashboard">
            <header class="dashboard-header">
                <h1>Dashboard</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary" @click="refreshData">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Refresh
                    </button>
                    <Link href="/servers/create" class="btn btn-primary">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Server
                    </Link>
                </div>
            </header>

            <div v-if="servers.length === 0" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                    <circle cx="6" cy="6" r="1" fill="currentColor" />
                    <circle cx="6" cy="18" r="1" fill="currentColor" />
                </svg>
                <h2>No Servers Added</h2>
                <p>Add your first server to start monitoring</p>
                <Link href="/servers/create" class="btn btn-primary">
                    Add Your First Server
                </Link>
            </div>

            <div v-else class="servers-grid">
                <Link
                    v-for="server in servers"
                    :key="server.id"
                    :href="`/servers/${server.id}`"
                    class="server-card"
                >
                    <div class="server-header">
                        <div class="server-status" :class="{ active: server.is_active }"></div>
                        <div class="server-info">
                            <h3>{{ server.name }}</h3>
                            <span class="server-ip">{{ server.ip }}</span>
                        </div>
                    </div>

                    <div class="metrics">
                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label">CPU</span>
                                <span class="metric-value" :class="getStatusColor(server.cpu_usage, server.cpu_threshold)">
                                    {{ server.cpu_usage.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: `${Math.min(server.cpu_usage, 100)}%`,
                                        backgroundColor: getProgressColor(getStatusColor(server.cpu_usage, server.cpu_threshold))
                                    }"
                                ></div>
                            </div>
                        </div>

                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label">RAM</span>
                                <span class="metric-value" :class="getStatusColor(server.ram_usage, server.ram_threshold)">
                                    {{ server.ram_usage.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: `${Math.min(server.ram_usage, 100)}%`,
                                        backgroundColor: getProgressColor(getStatusColor(server.ram_usage, server.ram_threshold))
                                    }"
                                ></div>
                            </div>
                        </div>

                        <div class="metric">
                            <div class="metric-header">
                                <span class="metric-label">Disk</span>
                                <span class="metric-value" :class="getStatusColor(server.disk_usage, server.disk_threshold)">
                                    {{ server.disk_usage.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: `${Math.min(server.disk_usage, 100)}%`,
                                        backgroundColor: getProgressColor(getStatusColor(server.disk_usage, server.disk_threshold))
                                    }"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div v-if="server.last_connected_at" class="server-footer">
                        <span class="last-update">Last update: {{ server.last_connected_at }}</span>
                    </div>
                </Link>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.dashboard {
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.dashboard-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fff, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    text-decoration: none;
}

.btn-icon {
    width: 18px;
    height: 18px;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
    background: rgba(99, 102, 241, 0.2);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(15, 15, 26, 0.5);
    border-radius: 1rem;
    border: 1px dashed rgba(99, 102, 241, 0.3);
}

.empty-icon {
    width: 80px;
    height: 80px;
    color: #6366f1;
    margin-bottom: 1.5rem;
    opacity: 0.5;
}

.empty-state h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #e2e8f0;
}

.empty-state p {
    color: #64748b;
    margin-bottom: 1.5rem;
}

.servers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.server-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.25rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    display: block;
}

.server-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.server-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.server-status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #64748b;
}

.server-status.active {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.server-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
}

.server-ip {
    font-size: 0.75rem;
    color: #64748b;
    font-family: 'Fira Code', monospace;
}

.metrics {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric-value {
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Fira Code', monospace;
}

.metric-value.normal {
    color: #22c55e;
}

.metric-value.warning {
    color: #f59e0b;
}

.metric-value.critical {
    color: #ef4444;
}

.progress-bar {
    height: 6px;
    background: rgba(100, 116, 139, 0.2);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.server-footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.last-update {
    font-size: 0.75rem;
    color: #64748b;
}
</style>
