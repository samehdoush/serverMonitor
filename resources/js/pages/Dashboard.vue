<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref, watch } from 'vue';
import Draggable from 'vuedraggable';

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
    sort_order?: number;
}

const props = defineProps<{
    servers: Server[];
}>();

// keep a local reactive copy for drag & drop
const serversList = ref<Server[]>(props.servers || []);
watch(() => props.servers, (v) => {
    serversList.value = v || [];
});

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

// persist order to the server
const persistOrder = async () => {
    try {
        await fetch('/servers/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content,
            },
            body: JSON.stringify({ order: serversList.value.map(s => s.id) }),
        });
    } catch (e) {
        // ignore for now — could show a toast
        console.error('Failed to persist server order', e);
    }
};

const onDragEnd = () => {
    persistOrder();
};

// Auto-refresh every 30 seconds
setInterval(refreshData, 30000);
</script>

<template>
    <AppLayout>
        <div class="dashboard">
            <header class="dashboard-header">
                <div class="header-title">
                    <h1>Dashboard</h1>
                    <p class="subtitle">Monitor and manage your infrastructure</p>
                </div>
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

            <draggable 
                v-else 
                tag="div" 
                class="servers-grid" 
                v-model="serversList" 
                item-key="id" 
                handle=".drag-handle" 
                @end="onDragEnd"
                ghost-class="sortable-ghost"
                drag-class="sortable-drag"
                :animation="200"
            >
                <template #item="{ element: server }">
                    <div class="server-card-wrapper">
                        <div class="server-card" :class="{ 'server-offline': !server.is_active }">
                            <div class="server-header">
                                <Link :href="`/servers/${server.id}`" class="server-identity-link">
                                    <div class="server-identity">
                                        <div class="server-status-indicator" :class="{ active: server.is_active }">
                                            <div v-if="server.is_active" class="status-pulse"></div>
                                        </div>
                                        <div class="server-info">
                                            <h3>{{ server.name }}</h3>
                                            <span class="server-ip">{{ server.ip }}</span>
                                        </div>
                                    </div>
                                </Link>
                                
                                <button class="drag-handle" title="Drag to reorder" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drag-icon">
                                        <circle cx="9" cy="12" r="1"></circle>
                                        <circle cx="9" cy="5" r="1"></circle>
                                        <circle cx="9" cy="19" r="1"></circle>
                                        <circle cx="15" cy="12" r="1"></circle>
                                        <circle cx="15" cy="5" r="1"></circle>
                                        <circle cx="15" cy="19" r="1"></circle>
                                    </svg>
                                </button>
                            </div>

                            <Link :href="`/servers/${server.id}`" class="metrics-link">
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
                                                :class="getStatusColor(server.cpu_usage, server.cpu_threshold)"
                                                :style="{ width: `${Math.min(server.cpu_usage, 100)}%` }"
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
                                                :class="getStatusColor(server.ram_usage, server.ram_threshold)"
                                                :style="{ width: `${Math.min(server.ram_usage, 100)}%` }"
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
                                                :class="getStatusColor(server.disk_usage, server.disk_threshold)"
                                                :style="{ width: `${Math.min(server.disk_usage, 100)}%` }"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div v-if="server.last_connected_at" class="server-footer">
                                <span class="last-update">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Updated {{ server.last_connected_at }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
    </AppLayout>
</template>

<style scoped>
.dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 2rem;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-title h1 {
    font-size: 2rem;
    font-weight: 800;
    color: white;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.subtitle {
    color: #94a3b8;
    margin: 0.25rem 0 0 0;
    font-size: 0.95rem;
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
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    text-decoration: none;
    height: 42px;
}

.btn-icon {
    width: 18px;
    height: 18px;
}

.btn-primary {
    background: #6366f1;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1);
}

.btn-primary:hover {
    background: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 8px 12px -1px rgba(99, 102, 241, 0.3), 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.btn-secondary {
    background: rgba(30, 41, 59, 0.5);
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
    background: rgba(49, 63, 204, 0.15);
    border-color: rgba(99, 102, 241, 0.4);
    color: #fff;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
    background: rgba(30, 41, 59, 0.3);
    border-radius: 1.5rem;
    border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon {
    width: 80px;
    height: 80px;
    color: #6366f1;
    margin-bottom: 2rem;
    opacity: 0.5;
}

.empty-state h2 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #e2e8f0;
    font-weight: 700;
}

.empty-state p {
    color: #94a3b8;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.servers-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
    .servers-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1280px) {
    .servers-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

.server-card {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.server-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    background: #253347;
    border-color: rgba(99, 102, 241, 0.3);
}

.server-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.server-identity-link {
    text-decoration: none;
    flex-grow: 1;
}

.server-identity {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05); /* Visible background */
    color: #cbd5e1; /* Lighter color */
    cursor: grab;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0;
    margin: 0;
    flex-shrink: 0;
}

.drag-handle:hover {
    background: rgba(99, 102, 241, 0.2);
    color: #fff;
    border-color: rgba(99, 102, 241, 0.3);
}

.drag-handle:active {
    cursor: grabbing;
    background: rgba(99, 102, 241, 0.3);
}

.drag-icon {
    width: 20px;
    height: 20px;
    opacity: 0.9;
}

/* Sortable specific styles */
.sortable-ghost {
    opacity: 0.3;
    background: rgba(99, 102, 241, 0.05) !important;
    border: 2px dashed rgba(99, 102, 241, 0.4) !important;
    box-shadow: none !important;
}

.sortable-ghost > * {
    visibility: hidden;
}

.sortable-drag {
    cursor: grabbing;
    background: #1e293b;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    transform: scale(1.02);
    z-index: 100;
    border: 1px solid rgba(99, 102, 241, 0.5);
}

.server-status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ef4444; /* Default offline color */
    box-shadow: 0 0 0 2px rgba(30, 41, 59, 1);
    position: relative;
    flex-shrink: 0;
}

.server-status-indicator.active {
    background: #22c55e;
    box-shadow: 0 0 0 2px rgba(30, 41, 59, 1), 0 0 10px rgba(34, 197, 94, 0.4);
}

.status-pulse {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: inherit;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    opacity: 0.4;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.5); opacity: 0; }
}

.server-info h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 0.15rem 0;
}

.server-ip {
    font-size: 0.8rem;
    color: #94a3b8;
    font-family: 'Fira Code', monospace;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.1rem 0.4rem;
    border-radius: 0.25rem;
}

.metrics-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

.metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.metric-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric-value {
    font-size: 0.9rem;
    font-weight: 700;
    font-family: 'Fira Code', monospace;
}

.metric-value.normal { color: #4ade80; }
.metric-value.warning { color: #fbbf24; }
.metric-value.critical { color: #f87171; }

.progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.normal { background-color: #22c55e; }
.progress-fill.warning { background-color: #f59e0b; }
.progress-fill.critical { background-color: #ef4444; }

.server-footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.last-update {
    font-size: 0.75rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

</style>
