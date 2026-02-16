<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { onMounted, onUnmounted, ref } from 'vue';

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
    latest_metric?: {
        cpu_usage: number;
        ram_usage: number;
        disk_usage: number;
    };
}

defineProps<{
    servers: Server[];
}>();

const getStatusColor = (value: number, threshold: number): string => {
    if (value >= threshold) return 'critical';
    if (value >= threshold * 0.8) return 'warning';
    return 'normal';
};

const timer = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(() => {
    timer.value = setInterval(() => {
        router.reload({ only: ['servers'] });
    }, 30000); // Refresh every 30 seconds
});

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value);
});

const deleteServer = (server: Server) => {
    if (confirm(`Are you sure you want to delete "${server.name}"? This action cannot be undone.`)) {
        router.delete(`/servers/${server.id}`);
    }
};
</script>

<template>
    <AppLayout>
        <div class="servers-page">
            <header class="page-header">
                <h1>Servers</h1>
                <Link href="/servers/create" class="btn btn-primary">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Server
                </Link>
            </header>

            <div v-if="servers.length === 0" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                </svg>
                <h2>No Servers</h2>
                <p>Add your first server to start monitoring</p>
            </div>

            <table v-else class="servers-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>IP Address</th>
                        <th>CPU</th>
                        <th>RAM</th>
                        <th>Disk</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="server in servers" :key="server.id">
                        <td>
                            <span :class="['status-badge', server.is_active ? 'active' : 'inactive']">
                                {{ server.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td>
                            <Link :href="`/servers/${server.id}`" class="server-name">
                                {{ server.name }}
                            </Link>
                        </td>
                        <td class="ip-cell">{{ server.ip }}</td>
                        <td>
                            <span :class="['metric-value', getStatusColor(server.latest_metric?.cpu_usage ?? 0, server.cpu_threshold)]">
                                {{ server.latest_metric?.cpu_usage?.toFixed(1) || '0.0' }}%
                            </span>
                        </td>
                        <td>
                            <span :class="['metric-value', getStatusColor(server.latest_metric?.ram_usage ?? 0, server.ram_threshold)]">
                                {{ server.latest_metric?.ram_usage?.toFixed(1) || '0.0' }}%
                            </span>
                        </td>
                        <td>
                            <span :class="['metric-value', getStatusColor(server.latest_metric?.disk_usage ?? 0, server.disk_threshold)]">
                                {{ server.latest_metric?.disk_usage?.toFixed(1) || '0.0' }}%
                            </span>
                        </td>
                        <td class="actions-cell">
                            <Link :href="`/servers/${server.id}`" class="action-btn view">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </Link>
                            <Link :href="`/servers/${server.id}/edit`" class="action-btn edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </Link>
                            <button @click="deleteServer(server)" class="action-btn delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppLayout>
</template>

<style scoped>
.servers-page {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
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
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(15, 15, 26, 0.5);
    border-radius: 1rem;
    border: 1px dashed rgba(99, 102, 241, 0.3);
}

.empty-icon {
    width: 64px;
    height: 64px;
    color: #6366f1;
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h2 {
    color: #e2e8f0;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #64748b;
}

.servers-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(15, 15, 26, 0.8);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.servers-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    background: rgba(15, 15, 26, 0.5);
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.servers-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.05);
}

.servers-table tr:last-child td {
    border-bottom: none;
}

.servers-table tr:hover td {
    background: rgba(99, 102, 241, 0.05);
}

.status-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-badge.active {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.inactive {
    background: rgba(100, 116, 139, 0.1);
    color: #64748b;
    border: 1px solid rgba(100, 116, 139, 0.3);
}

.server-name {
    color: #e2e8f0;
    text-decoration: none;
    font-weight: 500;
}

.server-name:hover {
    color: #a5b4fc;
}

.ip-cell {
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #94a3b8;
}

.metric-value {
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    font-weight: 500;
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

.actions-cell {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 0.375rem;
    transition: all 0.2s;
}

.action-btn svg {
    width: 16px;
    height: 16px;
}

.action-btn.view {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
}

.action-btn.view:hover {
    background: rgba(99, 102, 241, 0.2);
}

.action-btn.edit {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
}

.action-btn.edit:hover {
    background: rgba(245, 158, 11, 0.2);
}

.action-btn.delete {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    cursor: pointer;
    border: none;
}

.action-btn.delete:hover {
    background: rgba(239, 68, 68, 0.2);
}
</style>
