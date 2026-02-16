<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useTimeAgo } from '@vueuse/core';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-nginx';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Metric {
    id?: number;
    cpu_usage: number;
    ram_usage: number;
    ram_total?: number;
    ram_used?: number;
    swap_usage: number;
    swap_total?: number;
    swap_used?: number;
    disk_usage: number;
    disk_total?: number;
    disk_used?: number;
    network_rx_kb?: number;
    network_tx_kb?: number;
    disk_read_kb?: number;
    disk_write_kb?: number;
    top_processes?: Array<{
        user: string;
        pid: string;
        cpu: number;
        mem: number;
        command: string;
    }>;
    service_status?: Record<string, string>;
    recorded_at: string;
}

interface Server {
    id: number;
    name: string;
    ip: string;
    username: string;
    port: number;
    is_active: boolean;
    last_connected_at: string | null;
    cpu_threshold: number;
    ram_threshold: number;
    disk_threshold: number;
    latest_metric?: Metric;
}

const props = defineProps<{
    server: Server;
    metrics: Metric[];
}>();

const isLive = ref(false);
const localMetrics = ref<Metric[]>(props.metrics);
const localServer = ref<Server>(props.server);
const isRefreshing = ref(false);
const streamTimer = ref<ReturnType<typeof setInterval> | null>(null);

// New features state
const activeTab = ref('stats'); // stats, logs, terminal
const serviceLoading = ref<string | null>(null);
const logPath = ref('/var/log/nginx/error.log');
const logContent = ref('');
const isLogLoading = ref(false);
const terminalCommand = ref('');
const terminalLines = ref<string[]>([]);
const isTerminalLoading = ref(false);
const isDiscovering = ref(false);
const terminalContainer = ref<HTMLElement | null>(null);

const caddyfileContent = ref('');
const isCaddyLoading = ref(false);
const isCaddySaving = ref(false);
const caddyValidationOutput = ref<string>('');
const highlightedCaddyCode = ref('');
const caddyTextarea = ref<HTMLTextAreaElement | null>(null);

let term: Terminal | null = null;
let fitAddon: FitAddon | null = null;
const terminalDom = ref<HTMLElement | null>(null);
const terminalSession = ref(Math.random().toString(36).substring(7));

const syncScroll = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    const overlay = textarea.previousElementSibling as HTMLElement;
    if (overlay) {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    }
};

const highlightCode = () => {
    // We use nginx syntax as it's the closest to Caddyfile structure
    highlightedCaddyCode.value = Prism.highlight(
        caddyfileContent.value || '',
        Prism.languages.nginx,
        'nginx'
    ) + '\n'; // Add trailing newline to match textarea behavior
};

watch(caddyfileContent, () => {
    highlightCode();
});

const lastConnectedAt = computed(() => localServer.value.last_connected_at ? new Date(localServer.value.last_connected_at) : new Date());
const timeAgo = useTimeAgo(lastConnectedAt);

const formattedDate = computed(() => {
    if (!localServer.value.last_connected_at) return 'Never';
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium',
    }).format(new Date(localServer.value.last_connected_at));
});

// Helper for service status display
const getStatusClass = (status: any) => {
    const s = typeof status === 'object' ? status.status : status;
    if (s === 'active' || s === 'running') return 'running';
    if (s === 'failed') return 'failed';
    return 'stopped';
};

const getStatusLabel = (status: any) => {
    return typeof status === 'object' ? status.status : status;
};

const handleServiceAction = async (service: string, action: string) => {
    const serviceKey = typeof service === 'object' ? (service as any).name : service;
    if (serviceLoading.value) return;
    
    if (!confirm(`Are you sure you want to ${action} ${serviceKey}?`)) return;

    serviceLoading.value = serviceKey;
    try {
        const response = await fetch(`/servers/${props.server.id}/service-action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ service: serviceKey, action })
        });
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            refreshMetrics(); // Refresh to see updated status
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Action failed:', error);
    } finally {
        serviceLoading.value = null;
    }
};

const fetchLog = async () => {
    if (isLogLoading.value) return;
    isLogLoading.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/fetch-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ path: logPath.value, lines: 100 })
        });
        const data = await response.json();
        if (data.success) {
            logContent.value = data.content;
        } else {
            logContent.value = 'Failed to fetch log: ' + data.message;
        }
    } catch (error) {
        logContent.value = 'Error connecting to server.';
    } finally {
        isLogLoading.value = false;
    }
};

const initTerminal = () => {
    if (!terminalDom.value || term) return;

    term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Fira Code', 'Courier New', monospace",
        theme: {
            background: '#0d0d17',
            foreground: '#e2e8f0',
            cursor: '#a5b4fc',
            selectionBackground: 'rgba(165, 180, 252, 0.3)',
        },
        convertEol: true,
    });

    fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalDom.value);
    fitAddon.fit();

    term.writeln('\x1b[38;5;105mRemote Terminal Connected\x1b[0m');
    term.writeln('Ready for commands...\n');
};

onMounted(() => {
    if (activeTab.value === 'terminal') {
        initTerminal();
    }
});

watch(activeTab, (newTab) => {
    if (newTab === 'terminal') {
        nextTick(() => {
            initTerminal();
            fitAddon?.fit();
        });
    }
});

const executeCommand = async () => {
    if (!terminalCommand.value.trim() || isTerminalLoading.value || !term) return;
    
    const cmd = terminalCommand.value;
    term.writeln(`\x1b[38;5;165m$ ${cmd}\x1b[0m`);
    isTerminalLoading.value = true;
    terminalCommand.value = '';

    try {
        const response = await fetch(`/servers/${props.server.id}/terminal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ command: cmd, session: terminalSession.value })
        });
        const data = await response.json();
        
        if (data.success) {
            if (data.output) {
                term.write(data.output + '\n');
            } else {
                term.writeln('\x1b[38;5;244m(Executed with no output)\x1b[0m');
            }
        } else {
            term.writeln(`\x1b[31mError: ${data.message}\x1b[0m`);
        }
    } catch (error) {
        term.writeln('\x1b[31mConnection error or timeout.\x1b[0m');
    } finally {
        isTerminalLoading.value = false;
    }
};

const clearTerminal = () => {
    term?.clear();
    term?.writeln('\x1b[38;5;105mTerminal Cleared\x1b[0m\n');
};

const discoverServices = async () => {
    if (isDiscovering.value) return;
    isDiscovering.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/discover-services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content }
        });
        const data = await response.json();
        if (data.success) {
            localServer.value.installed_services = data.services;
            alert('Discovery complete. Found: ' + (data.services.join(', ') || 'None'));
            refreshMetrics();
        }
    } catch (error) {
        console.error('Discovery failed:', error);
    } finally {
        isDiscovering.value = false;
    }
};

const fetchCaddyfile = async () => {
    isCaddyLoading.value = true;
    caddyValidationOutput.value = '';
    try {
        const response = await fetch(`/servers/${props.server.id}/caddyfile`);
        const data = await response.json();
        if (data.success) {
            caddyfileContent.value = data.content;
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Caddyfile fetch failed:', error);
    } finally {
        isCaddyLoading.value = false;
    }
};

const saveCaddyfile = async () => {
    if (isCaddySaving.value) return;
    
    if (!confirm('This will validate and reload Caddy. Are you sure?')) return;

    isCaddySaving.value = true;
    caddyValidationOutput.value = '';
    
    try {
        const response = await fetch(`/servers/${props.server.id}/caddyfile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ content: caddyfileContent.value })
        });
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
        } else {
            caddyValidationOutput.value = data.output || data.message;
            alert('Save failed. See validation error below.');
        }
    } catch (error) {
        console.error('Caddyfile save failed:', error);
    } finally {
        isCaddySaving.value = false;
    }
};

// Watch activeTab to load Caddyfile
watch(activeTab, (newTab) => {
    if (newTab === 'caddy' && !caddyfileContent.value) {
        fetchCaddyfile();
    }
});

const commonLogPaths = [
    { label: 'Nginx Error', path: '/var/log/nginx/error.log', service: 'nginx' },
    { label: 'Nginx Access', path: '/var/log/nginx/access.log', service: 'nginx' },
    { label: 'Apache Error', path: '/var/log/apache2/error.log', service: 'apache2' },
    { label: 'MySQL Error', path: '/var/log/mysql/error.log', service: 'mysql' },
    { label: 'Syslog', path: '/var/log/syslog' },
    { label: 'Auth Log', path: '/var/log/auth.log' },
    { label: 'Caddy', path: '/var/log/caddy/caddy.log', service: 'caddy' },
];

const availableCommonLogs = computed(() => {
    return commonLogPaths.filter(log => {
        if (!log.service) return true; // Always show general logs like syslog
        return localServer.value.installed_services?.includes(log.service);
    });
});

const selectLogPath = (path: string) => {
    logPath.value = path;
    fetchLog();
};

// ... (rest of the file remains similar, adding only styles at the end)

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#94a3b8',
            }
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#94a3b8',
                maxTicksLimit: 8,
            }
        }
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const cpuData = computed(() => {
    return {
        labels: localMetrics.value.map(m => formatDate(m.recorded_at)),
        datasets: [{
            label: 'CPU Usage (%)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.4,
            data: localMetrics.value.map(m => m.cpu_usage)
        }]
    };
});

const ramData = computed(() => {
    return {
        labels: localMetrics.value.map(m => formatDate(m.recorded_at)),
        datasets: [{
            label: 'RAM Usage (%)',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            borderColor: '#8b5cf6',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.4,
            data: localMetrics.value.map(m => m.ram_usage)
        }]
    };
});

const swapData = computed(() => {
    return {
        labels: localMetrics.value.map(m => formatDate(m.recorded_at)),
        datasets: [{
            label: 'Swap Usage (%)',
            backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink
            borderColor: '#ec4899',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.4,
            data: localMetrics.value.map(m => m.swap_usage)
        }]
    };
});

const diskData = computed(() => {
    return {
        labels: localMetrics.value.map(m => formatDate(m.recorded_at)),
        datasets: [{
            label: 'Disk Usage (%)',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            borderColor: '#a855f7',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.4,
            data: localMetrics.value.map(m => m.disk_usage)
        }]
    };
});

const deleteServer = () => {
    if (confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
        router.delete(`/servers/${props.server.id}`);
    }
};



const startStreaming = () => {
    isLive.value = true;
    router.post(`/servers/${props.server.id}/stream`, {}, {
        preserveScroll: true,
    });

    // Re-trigger job every 55 seconds to keep the stream alive
    streamTimer.value = setInterval(() => {
        if (!isLive.value) return;
        router.post(`/servers/${props.server.id}/stream`, {}, { preserveScroll: true });
    }, 55000);
};

const stopStreaming = () => {
    isLive.value = false;
    if (streamTimer.value) clearInterval(streamTimer.value);
};

const toggleLive = () => {
    if (isLive.value) {
        stopStreaming();
    } else {
        startStreaming();
    }
};

// Polling fallback if broadcasting fails or just to sync history occasionaly
const refreshMetrics = async () => {
    if (isLive.value) return; // Don't manual refresh if live
    
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    
    try {
        const response = await fetch(`/servers/${props.server.id}/metrics`);
        const data = await response.json();
        
        localMetrics.value = data.metrics;
        localServer.value = data.server;
    } catch (error) {
        console.error('Failed to refresh metrics:', error);
    } finally {
        isRefreshing.value = false;
    }
};

const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(() => {
    localMetrics.value = props.metrics;
    localServer.value = props.server;

    // Listen for events - Check for Native object directly as fallback
    if (window.Echo) {
        window.Echo.channel('nativephp')
            .listen('ServerMetricsUpdated', (e: any) => {
                if (e.serverId === props.server.id && isLive.value) {
                   const newMetric = e.metrics;
                   // Add to local metrics and keep last 50
                   localMetrics.value = [...localMetrics.value, newMetric].slice(-50);
                   
                   const latest = {
                       ...newMetric,
                       recorded_at: new Date().toISOString()
                   };

                   localServer.value = {
                       ...localServer.value,
                       latest_metric: latest
                   };
                }
            });
    }

    // Fallback refresh every minute for non-live
    refreshTimer.value = setInterval(refreshMetrics, 60000); 
});

onUnmounted(() => {
    stopStreaming();
    if (refreshTimer.value) clearInterval(refreshTimer.value);
});
</script>

<template>
    <AppLayout>
        <div class="server-details">
            <header class="page-header">
                <div class="header-left">
                    <Link href="/servers" class="back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <h1>{{ localServer.name }}</h1>
                    <span :class="['status-badge', localServer.is_active ? 'active' : 'inactive']">
                        {{ localServer.is_active ? 'Active' : 'Inactive' }}
                    </span>
                    <div :class="['live-indicator', { active: isLive }]" @click="toggleLive">
                        <span class="pulse-dot"></span>
                        {{ isLive ? 'Live Monitoring' : 'Real-time Paused' }}
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" @click="refreshMetrics">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Refresh
                    </button>
                    <Link :href="`/servers/${server.id}/edit`" class="btn btn-primary">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </Link>
                    <button class="btn btn-danger" @click="deleteServer">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </button>
                </div>
            </header>

            <div class="server-info-card">
                <div class="info-item">
                    <span class="label">IP Address</span>
                    <span class="value">{{ localServer.ip }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Username</span>
                    <span class="value">{{ localServer.username }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Port</span>
                    <span class="value">{{ localServer.port }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Last Connection</span>
                    <div class="value-group">
                        <span class="value primary">{{ timeAgo }}</span>
                        <span class="value secondary">{{ formattedDate }}</span>
                    </div>
                </div>
            </div>

            <div v-if="!localServer.last_connected_at && !localServer.latest_metric" class="waiting-alert">
                <div class="alert-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon spinning">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <div>
                        <h3>Waiting for Connection</h3>
                        <p>Initial connection pending. Please wait approximately one minute for monitoring data to begin appearing.</p>
                    </div>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <div class="tabs-nav">
                <button :class="['tab-btn', { active: activeTab === 'stats' }]" @click="activeTab = 'stats'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                    Statistics
                </button>
                <button :class="['tab-btn', { active: activeTab === 'logs' }]" @click="activeTab = 'logs'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Log Viewer
                </button>
                <button :class="['tab-btn', { active: activeTab === 'terminal' }]" @click="activeTab = 'terminal'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                    Remote Terminal
                </button>
                <button 
                    v-if="localServer.installed_services?.includes('caddy')" 
                    :class="['tab-btn', { active: activeTab === 'caddy' }]" 
                    @click="activeTab = 'caddy'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Caddy Config
                </button>
            </div>

            <div v-if="activeTab === 'stats'">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="label">Current CPU</span>
                            <span :class="['stat-value', { warning: (localServer.latest_metric?.cpu_usage ?? 0) >= server.cpu_threshold }]">
                                {{ localServer.latest_metric?.cpu_usage ?? 0 }}%
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill cpu" :style="{ width: (localServer.latest_metric?.cpu_usage ?? 0) + '%' }"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="label">Current RAM</span>
                            <span :class="['stat-value', { warning: (localServer.latest_metric?.ram_usage ?? 0) >= server.ram_threshold }]">
                                {{ localServer.latest_metric?.ram_usage ?? 0 }}%
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ram" :style="{ width: (localServer.latest_metric?.ram_usage ?? 0) + '%' }"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="label">Current Swap</span>
                            <span class="stat-value">
                                {{ localServer.latest_metric?.swap_usage ?? 0 }}%
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill swap" :style="{ width: (localServer.latest_metric?.swap_usage ?? 0) + '%' }"></div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="label">Disk Usage</span>
                            <span :class="['stat-value', { warning: (localServer.latest_metric?.disk_usage ?? 0) >= server.disk_threshold }]">
                                {{ localServer.latest_metric?.disk_usage ?? 0 }}%
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill disk" :style="{ width: (localServer.latest_metric?.disk_usage ?? 0) + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>CPU History</h3>
                            <span class="current-badge cpu">{{ localServer.latest_metric?.cpu_usage ?? 0 }}%</span>
                        </div>
                        <div class="chart-container">
                            <Line :data="cpuData" :options="chartOptions" />
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>RAM History</h3>
                            <span class="current-badge ram">{{ localServer.latest_metric?.ram_usage ?? 0 }}%</span>
                        </div>
                        <div class="chart-container">
                            <Line :data="ramData" :options="chartOptions" />
                        </div>
                    </div>
                </div>

                <div class="advanced-metrics-grid" v-if="localServer.latest_metric">
                    <div class="info-card">
                        <h3>Network Traffic</h3>
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-label">Download (RX)</span>
                                <span class="stat-val">{{ localServer.latest_metric.network_rx_kb?.toFixed(2) ?? '0.00' }} KB/s</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Upload (TX)</span>
                                <span class="stat-val">{{ localServer.latest_metric.network_tx_kb?.toFixed(2) ?? '0.00' }} KB/s</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <h3>Disk I/O</h3>
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-label">Read</span>
                                <span class="stat-val">{{ localServer.latest_metric.disk_read_kb?.toFixed(2) ?? '0.00' }} KB/s</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Write</span>
                                <span class="stat-val">{{ localServer.latest_metric.disk_write_kb?.toFixed(2) ?? '0.00' }} KB/s</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-2-col" v-if="localServer.latest_metric">
                    <!-- Top Processes -->
                    <div class="info-card processes-card" v-if="localServer.latest_metric.top_processes?.length">
                        <h3>Top Processes (by CPU)</h3>
                        <div class="table-responsive">
                            <table class="processes-table">
                                <thead>
                                    <tr>
                                        <th>CMD</th>
                                        <th>User</th>
                                        <th>CPU%</th>
                                        <th>Mem%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(proc, index) in localServer.latest_metric.top_processes" :key="index">
                                        <td class="cmd-cell" :title="proc.command">{{ proc.command }}</td>
                                        <td>{{ proc.user }}</td>
                                        <td :class="{ 'high-usage': proc.cpu > 50 }">{{ proc.cpu }}%</td>
                                        <td>{{ proc.mem }}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Service Status with Controls -->
                    <div class="info-card services-card">
                        <div class="card-header-with-action">
                            <h3 class="no-margin">Service Management</h3>
                            <button class="btn-refresh-small" @click="discoverServices" :disabled="isDiscovering">
                                <svg :class="{ 'spinning': isDiscovering }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                Scan Services
                            </button>
                        </div>

                        <div v-if="localServer.installed_services && localServer.installed_services.length > 0" class="services-list">
                            <div 
                                v-for="(status, service) in localServer.latest_metric?.service_status" 
                                :key="service" 
                                class="service-item-complex"
                                v-show="localServer.installed_services.includes(service)"
                            >
                                <div class="service-main">
                                    <span :class="['status-dot', getStatusClass(status)]"></span>
                                    <div class="service-meta">
                                        <span class="service-name">{{ service }}</span>
                                        <span :class="['service-status-text', getStatusClass(status)]">{{ getStatusLabel(status) }}</span>
                                    </div>
                                </div>
                                <div class="service-actions" v-if="serviceLoading !== (typeof service === 'object' ? (service as any).name : service)">
                                    <button @click="handleServiceAction(service, 'restart')" title="Restart" class="action-btn restart">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                    </button>
                                    <button v-if="getStatusClass(status) === 'running'" @click="handleServiceAction(service, 'stop')" title="Stop" class="action-btn stop">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"/></svg>
                                    </button>
                                    <button v-else @click="handleServiceAction(service, 'start')" title="Start" class="action-btn start">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    </button>
                                    <button v-if="service === 'caddy' || service === 'nginx'" @click="handleServiceAction(service, 'reload')" title="Reload Config" class="action-btn reload">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                                    </button>
                                </div>
                                <div v-else class="service-loading-spinner">
                                    <div class="mini-spinner"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-services">
                            <p>No services discovered yet.</p>
                            <button class="btn btn-secondary btn-sm" @click="discoverServices">Discovery Supported Services</button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'logs'" class="logs-section">
                <div class="info-card">
                    <div class="log-selection-grid">
                        <div class="quick-logs">
                            <span class="quick-logs-label">Quick Selection:</span>
                            <div class="log-chips">
                                <button 
                                    v-for="log in availableCommonLogs" 
                                    :key="log.path" 
                                    class="log-chip"
                                    :class="{ active: logPath === log.path }"
                                    @click="selectLogPath(log.path)"
                                >
                                    {{ log.label }}
                                </button>
                            </div>
                        </div>
                        
                        <div class="log-controls">
                            <div class="input-group">
                                <label>Log Path</label>
                                <input v-model="logPath" type="text" placeholder="/var/log/nginx/error.log" class="form-input">
                            </div>
                            <button class="btn btn-primary" @click="fetchLog" :disabled="isLogLoading">
                                {{ isLogLoading ? 'Fetching...' : 'Fetch Log' }}
                            </button>
                        </div>
                    </div>
                    
                    <div class="log-viewer">
                        <pre v-if="logContent">{{ logContent }}</pre>
                        <div v-else class="empty-log">Select a quick path or enter a custom one and click fetch.</div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'terminal'" class="terminal-section">
                <div class="info-card terminal-card">
                    <div class="terminal-header">
                        <div class="terminal-title">
                            <span class="status-dot running"></span>
                            <h3>SSH Session: {{ server.username }}@{{ server.ip }}</h3>
                        </div>
                        <button class="btn btn-secondary btn-sm" @click="clearTerminal">Clear</button>
                    </div>

                    <div class="xterm-wrapper">
                        <div ref="terminalDom" class="xterm-container"></div>
                    </div>

                    <div class="terminal-input-area">
                        <span class="terminal-prompt">$</span>
                        <input 
                            v-model="terminalCommand" 
                            @keyup.enter="executeCommand"
                            type="text" 
                            placeholder="Type command and press Enter..." 
                            class="terminal-input"
                            :disabled="isTerminalLoading"
                        >
                        <div v-if="isTerminalLoading" class="mini-spinner"></div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'caddy'" class="caddy-section">
                <div class="info-card caddy-editor-card">
                    <div class="editor-header">
                        <div class="editor-title">
                            <h3>/etc/caddy/Caddyfile</h3>
                            <span class="badge-blue" v-if="isCaddyLoading">Loading...</span>
                        </div>
                        <div class="editor-actions">
                            <button class="btn btn-secondary" @click="fetchCaddyfile" :disabled="isCaddyLoading || isCaddySaving">
                                Reset
                            </button>
                            <button class="btn btn-primary" @click="saveCaddyfile" :disabled="isCaddyLoading || isCaddySaving">
                                {{ isCaddySaving ? 'Validating & Saving...' : 'Save & Reload' }}
                            </button>
                        </div>
                    </div>
                    
                    <div v-if="caddyValidationOutput" class="validation-error">
                        <div class="error-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Validation Error
                        </div>
                        <pre>{{ caddyValidationOutput }}</pre>
                    </div>

                        <div class="caddy-editor-container">
                            <pre class="caddy-highlight-overlay" aria-hidden="true"><code class="language-nginx" v-html="highlightedCaddyCode"></code></pre>
                            <textarea 
                                v-model="caddyfileContent" 
                                class="caddy-textarea"
                                spellcheck="false"
                                placeholder="# Enter Caddy configuration here..."
                                @scroll="syncScroll"
                                ref="caddyTextarea"
                            ></textarea>
                        </div>
                    
                    <div class="editor-footer">
                        <p class="hint">Your configuration is automatically validated using <code>caddy validate</code> before being applied.</p>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.server-details {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-left h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
}

.back-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;
}

.back-link:hover {
    color: #a5b4fc;
}

.back-link svg {
    width: 16px;
    height: 16px;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.status-badge {
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

.btn-secondary {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
    background: rgba(99, 102, 241, 0.2);
}

.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
    background: rgba(239, 68, 68, 0.2);
}

.server-info-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item .label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.info-item .value {
    font-family: 'Fira Code', monospace;
    font-size: 1rem;
    color: #e2e8f0;
    font-weight: 500;
}

.value-group {
    display: flex;
    flex-direction: column;
}

.value-group .value.primary {
    font-size: 1rem;
    color: #e2e8f0;
}

.value-group .value.secondary {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.125rem;
}

.charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

.chart-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
}

.chart-card h3 {
    font-size: 1.125rem;
    color: #e2e8f0;
    margin-bottom: 1.5rem;
    font-weight: 600;
}

.chart-container {
    height: 300px;
    width: 100%;
}

/* Live Indicator */
.live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(15, 15, 26, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.3s ease;
}

.live-indicator.active {
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.05);
}

.pulse-dot {
    width: 8px;
    height: 8px;
    background-color: #64748b;
    border-radius: 50%;
    display: inline-block;
    transition: all 0.3s ease;
}

.live-indicator.active .pulse-dot {
    background-color: #6366f1;
    box-shadow: 0 0 0 rgba(99, 102, 241, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.25rem;
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.stat-header .label {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #e2e8f0;
}

.stat-value.warning {
    color: #ef4444;
}

.progress-bar {
    height: 6px;
    background: rgba(30, 30, 50, 0.5);
    border-radius: 999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
}

.progress-fill.cpu { background: #6366f1; }
.progress-fill.ram { background: #8b5cf6; }
.progress-fill.swap { background: #ec4899; }
.progress-fill.disk { background: #a855f7; }

/* Chart Enhancements */
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.chart-header h3 {
    margin-bottom: 0 !important;
}

.current-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.current-badge.cpu { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.current-badge.ram { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.current-badge.swap { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
.current-badge.disk { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

.waiting-alert {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    color: #fbbf24;
}

.alert-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.alert-icon {
    width: 32px;
    height: 32px;
    color: #f59e0b;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Advanced Metrics Styles */
.advanced-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.info-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
}

.info-card h3 {
    font-size: 1.125rem;
    color: #e2e8f0;
    margin-bottom: 1rem;
    font-weight: 600;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.stat-val {
    font-size: 1.5rem;
    color: #e2e8f0;
    font-weight: 700;
    font-family: 'Fira Code', monospace;
}

.grid-2-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;
}

.processes-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.processes-table th {
    text-align: left;
    color: #94a3b8;
    padding: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.processes-table td {
    padding: 0.5rem;
    color: #e2e8f0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.processes-table .cmd-cell {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Fira Code', monospace;
    color: #a5b4fc;
}

.high-usage {
    color: #ef4444;
    font-weight: bold;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}

.service-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.5rem;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
}

.status-dot.running {
    background-color: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.status-dot.stopped {
    background-color: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.service-info {
    display: flex;
    flex-direction: column;
}

.service-name {
    font-weight: 600;
    color: #e2e8f0;
    font-size: 0.875rem;
}

.service-status {
    font-size: 0.75rem;
    text-transform: capitalize;
}

.service-status.running {
    color: #22c55e;
}

.service-status.stopped {
    color: #ef4444;
}

.waiting-alert h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    color: #fbbf24;
}

.waiting-alert p {
    margin: 0;
    font-size: 0.875rem;
    color: #e2e8f0;
    opacity: 0.9;
}
/* Tabs Navigation */
.tabs-nav {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 0.5rem;
}

.tab-btn {
    background: transparent;
    border: none;
    color: #64748b;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.tab-btn svg { width: 16px; height: 16px; }

.tab-btn:hover {
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.03);
}

.tab-btn.active {
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
}

/* Service List Enhancements */
.services-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.service-item-complex {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.service-main {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.service-meta {
    display: flex;
    flex-direction: column;
}

.service-status-text {
    font-size: 0.75rem;
    text-transform: capitalize;
}

.service-status-text.running { color: #22c55e; }
.service-status-text.failed { color: #ef4444; }
.service-status-text.stopped { color: #64748b; }

.service-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 32px;
    height: 32px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 15, 26, 0.5);
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn svg { width: 14px; height: 14px; }

.action-btn:hover { background: #1e1e2e; color: #e2e8f0; }
.action-btn.restart:hover { color: #6366f1; border-color: #6366f1; }
.action-btn.stop:hover { color: #ef4444; border-color: #ef4444; }
.action-btn.start:hover { color: #22c55e; border-color: #22c55e; }
.action-btn.reload:hover { color: #a855f7; border-color: #a855f7; }

/* Logs Section */
.log-controls {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 1.5rem;
}

.form-input {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 0.625rem 1rem;
    color: #e2e8f0;
    width: 300px;
}

.log-viewer {
    background: #000;
    border-radius: 0.75rem;
    padding: 1.5rem;
    height: 500px;
    overflow-y: auto;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.1);
}

.log-viewer pre { margin: 0; white-space: pre-wrap; }
.empty-log { color: #64748b; text-align: center; margin-top: 4rem; }

/* Terminal Styles */
.terminal-window {
    background: #000;
    border-radius: 0.75rem 0.75rem 0 0;
    padding: 1.5rem;
    height: 400px;
    overflow-y: auto;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #a5b4fc;
}

.terminal-line { margin-bottom: 0.25rem; white-space: pre-wrap; }

.terminal-input-area {
    background: #111;
    padding: 1rem 1.5rem;
    border-radius: 0 0 0.75rem 0.75rem;
    display: flex;
    gap: 0.75rem;
}

.terminal-prompt { color: #6366f1; font-weight: bold; }

.terminal-input {
    background: transparent;
    border: none;
    color: #e2e8f0;
    flex: 1;
    font-family: 'Fira Code', monospace;
    outline: none;
}

.terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.btn-clear {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #64748b;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
}

.btn-clear:hover { color: #ef4444; }

.mini-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.card-header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.no-margin { margin-bottom: 0 !important; }

.btn-refresh-small {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.btn-refresh-small:hover {
    background: rgba(99, 102, 241, 0.2);
}

.btn-refresh-small svg { width: 14px; height: 14px; }

.empty-services {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}

.empty-services p { margin-bottom: 1rem; }

.btn-sm { padding: 0.4rem 0.75rem; font-size: 0.75rem; }

/* Caddy Editor Styles */
.caddy-editor-card {
    padding: 0 !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.editor-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.editor-title h3 { margin: 0; font-size: 1rem; }

.editor-actions {
    display: flex;
    gap: 0.75rem;
}

.caddy-editor-container {
    padding: 0;
    background: #0d0d17;
    position: relative;
    height: 600px;
}

.caddy-textarea, .caddy-highlight-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 1.5rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    tab-size: 4;
    white-space: pre-wrap;
    word-break: break-all;
    overflow: auto;
}

.caddy-textarea {
    background: transparent;
    border: none;
    color: transparent;
    caret-color: #e2e8f0;
    outline: none;
    resize: none;
    z-index: 2;
}

.caddy-highlight-overlay {
    z-index: 1;
    pointer-events: none;
    background: transparent;
    border: none;
}

.caddy-highlight-overlay code {
    font-family: inherit !important;
    font-size: inherit !important;
    background: transparent !important;
    padding: 0 !important;
    color: #e2e8f0;
}

/* Custom adjustment for comments in tomorrow theme */
.token.comment {
    color: #64748b !important;
    font-style: italic;
}

.token.string { color: #10b981 !important; }
.token.number { color: #f59e0b !important; }
.token.directive { color: #a5b4fc !important; font-weight: 600; }
.token.boolean { color: #f43f5e !important; }

.editor-footer {
    padding: 1rem 1.5rem;
    background: rgba(15, 23, 42, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.hint {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
}

.hint code {
    color: #a5b4fc;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
}

.validation-error {
    margin: 1.5rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.5rem;
}

.error-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #f87171;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.error-header svg { width: 16px; height: 16px; }

.validation-error pre {
    margin: 0;
    font-size: 0.75rem;
    color: #fca5a5;
    white-space: pre-wrap;
    font-family: 'Fira Code', monospace;
}

.badge-blue {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    padding: 0.2rem 0.6rem;
    border-radius: 2rem;
    font-size: 0.7rem;
    font-weight: 600;
}

/* Log Viewer Enhancements */
.log-selection-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.quick-logs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.quick-logs-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.log-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.log-chip {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    padding: 0.4rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.log-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
}

.log-chip.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
    color: #a5b4fc;
}

.log-controls {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Terminal Styles */
.terminal-card {
    padding: 0 !important;
    background: #0d0d17 !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
}

.terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.terminal-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.terminal-title h3 {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
}

.xterm-wrapper {
    padding: 1rem;
    background: #0d0d17;
    flex-grow: 1;
    min-height: 450px;
}

.xterm-container {
    height: 100%;
}

.terminal-input-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.01);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.terminal-prompt {
    color: #a5b4fc;
    font-family: inherit;
    font-weight: bold;
}

.terminal-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    outline: none;
}

.btn-clear {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
}

.btn-clear:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
}
</style>
