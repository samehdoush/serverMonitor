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
import cronstrue from 'cronstrue';

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
    installed_services?: string[];
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
const activeTab = ref('stats'); // stats, logs, terminal, caddy, cron
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

// Cron Job State
const isCronLoading = ref(false);
const cronJobs = ref<any[]>([]);
const isCronSaving = ref(false);
const showAddCronModal = ref(false);
const newCronJob = ref({
    expression: '* * * * *',
    command: '',
    comment: '',
});
const editingCronIndex = ref<number | null>(null);

// Firewall State
const isFirewallLoading = ref(false);
const isFirewallInstalling = ref(false);
const isFirewallMissing = ref(false);
const firewallStatus = ref({ enabled: false, rules: [] as any[] });
const showAddFirewallModal = ref(false);
const newFirewallRule = ref({
    port: '',
    proto: 'tcp',
    action: 'allow',
    source_scope: 'all',
    source_ips: ''
});

// Recipes State
const isRecipesLoading = ref(false);
const recipes = ref<any[]>([]);
const isRecipeExecuting = ref(false);
const recipeExecutionResult = ref<any>(null);
const showRecipeOutputModal = ref(false);

// Database Manager State
const isDatabasesLoading = ref(false);
const databases = ref<any[]>([]);
const databasesError = ref<string | null>(null);
const isTransferring = ref(false);
const showTransferModal = ref(false);
const transferData = ref({
    database: '',
    destination_server_id: '',
    destination_database: '',
});
const transferOutput = ref<string | null>(null);
const showTransferOutputModal = ref(false);
const allServers = ref<any[]>([]);
const isRebooting = ref(false);

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

const fetchCronJobs = async () => {
    isCronLoading.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/crontab`);
        const data = await response.json();
        
        if (data.success) {
            cronJobs.value = data.parsed_jobs.map((job: any) => ({
                ...job,
                id: Math.random().toString(36).substr(2, 9), // Temp ID for UI key
                human_schedule: job.expression ? getHumanCron(job.expression) : (job.is_comment ? 'Comment' : 'Unknown'),
            }));
        } else {
            alert('Failed to fetch cron jobs: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to fetch cron jobs:', error);
    } finally {
        isCronLoading.value = false;
    }
};

const getHumanCron = (expression: string) => {
    try {
        return cronstrue.toString(expression);
    } catch (e) {
        return expression;
    }
};

const saveCronJobs = async () => {
    isCronSaving.value = true;
    
    // Reconstruct crontab file content
    let content = '';
    
    // Add environment variables first
    cronJobs.value.filter(j => j.type === 'env').forEach(j => {
        content += `${j.raw}\n`;
    });
    
    // Add jobs and comments
    cronJobs.value.filter(j => j.type !== 'env').forEach(j => {
        if (j.type === 'comment') {
            content += `${j.raw}\n`;
        } else {
            // It's a job
            if (j.is_disabled) {
                content += `# ${j.expression} ${j.command}\n`;
            } else {
                content += `${j.expression} ${j.command}\n`;
            }
        }
    });

    try {
        const response = await fetch(`/servers/${props.server.id}/crontab`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ content })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Cron jobs updated successfully');
            fetchCronJobs(); // Reload to confirm state
        } else {
            alert('Error saving cron jobs: ' + data.message);
        }
    } catch (error) {
        alert('Failed to save cron jobs');
    } finally {
        isCronSaving.value = false;
    }
};

const cronPresets = [
    { label: 'Common Presets...', value: '' },
    { label: 'Every Minute (* * * * *)', value: '* * * * *' },
    { label: 'Every 5 Minutes (*/5 * * * *)', value: '*/5 * * * *' },
    { label: 'Every Hour (0 * * * *)', value: '0 * * * *' },
    { label: 'Every Day at Midnight (0 0 * * *)', value: '0 0 * * *' },
    { label: 'Every Week (Sunday) (0 0 * * 0)', value: '0 0 * * 0' },
    { label: 'Every Month (1st) (0 0 1 * *)', value: '0 0 1 * *' },
];

const scheduleMode = ref('preset'); // 'preset' | 'custom'
const selectedPreset = ref('');
const customSchedule = ref({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
});

// Helper for toggling values in a list (e.g. 1,2,3)
const toggleCronListValue = (currentValue: string, newValue: string) => {
    if (currentValue === '*') return newValue;
    
    const parts = currentValue.split(',').filter(p => p !== '');
    if (parts.includes(newValue)) {
        const newParts = parts.filter(p => p !== newValue);
        return newParts.length > 0 ? newParts.join(',') : '*';
    } else {
        parts.push(newValue);
        return parts.sort((a, b) => parseInt(a) - parseInt(b)).join(',');
    }
};

const weekDays = [
    { label: 'Sun', value: '0' },
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
];

const months = [
    { label: 'Jan', value: '1' }, { label: 'Feb', value: '2' }, { label: 'Mar', value: '3' }, 
    { label: 'Apr', value: '4' }, { label: 'May', value: '5' }, { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' }, { label: 'Aug', value: '8' }, { label: 'Sep', value: '9' }, 
    { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' }
];

const toggleWeekday = (dayValue: string) => {
    customSchedule.value.weekday = toggleCronListValue(customSchedule.value.weekday, dayValue);
};

const toggleMonth = (monthValue: string) => {
    customSchedule.value.month = toggleCronListValue(customSchedule.value.month, monthValue);
};

// Check if a value is selected in the current list
const isSelected = (currentValue: string, checkValue: string) => {
    if (currentValue === '*') return false; // In "mode" * usually means "all", but visually for multi-select, * implies none specifically selected (or all implied). We'll treat * as "nothing highlighted" so user can start picking.
    // Actually, if it's *, user clicks one, it becomes that one.
    return currentValue.split(',').includes(checkValue);
};

// Watch preset selection to update expression
watch(selectedPreset, (newVal) => {
    if (newVal && scheduleMode.value === 'preset') {
        newCronJob.value.expression = newVal;
    }
});

// Watch custom inputs to update expression
watch(customSchedule, (newVal) => {
    if (scheduleMode.value === 'custom') {
        newCronJob.value.expression = `${newVal.minute} ${newVal.hour} ${newVal.day} ${newVal.month} ${newVal.weekday}`;
    }
}, { deep: true });

// Watch expression manually changed (e.g. from existing job)
watch(() => newCronJob.value.expression, (newVal) => {
    // Try to match preset
    const preset = cronPresets.find(p => p.value === newVal);
    if (preset) {
        scheduleMode.value = 'preset';
        selectedPreset.value = newVal;
    } else {
        // If not a preset, set to custom
        const parts = newVal.split(' ');
        if (parts.length === 5) {
            scheduleMode.value = 'custom';
            customSchedule.value = {
                minute: parts[0],
                hour: parts[1],
                day: parts[2],
                month: parts[3],
                weekday: parts[4]
            };
        }
    }
});

const openAddModal = () => {
    editingCronIndex.value = null;
    newCronJob.value = { expression: '* * * * *', command: '', comment: '' };
    scheduleMode.value = 'preset';
    selectedPreset.value = '* * * * *';
    showAddCronModal.value = true;
};

const openEditModal = (index: number) => {
    const job = cronJobs.value[index];
    editingCronIndex.value = index;
    newCronJob.value = {
        expression: job.expression,
        command: job.command,
        comment: job.comment || ''
    };
    showAddCronModal.value = true;
};

const saveCronJob = () => {
    if (!newCronJob.value.command) return alert('Command is required');
    
    // Construct the job object
    const jobData = {
        expression: newCronJob.value.expression,
        command: newCronJob.value.command,
        is_disabled: false,
        is_comment: false,
        human_schedule: getHumanCron(newCronJob.value.expression),
        raw: `${newCronJob.value.expression} ${newCronJob.value.command}`
    };

    if (editingCronIndex.value !== null) {
        // Update existing
        const existingId = cronJobs.value[editingCronIndex.value].id;
        cronJobs.value[editingCronIndex.value] = { 
            ...cronJobs.value[editingCronIndex.value], 
            ...jobData,
            id: existingId // Preserve ID
        };
    } else {
        // Add new
        cronJobs.value.push({
            id: Math.random().toString(36).substr(2, 9),
            ...jobData
        });
    }
    
    showAddCronModal.value = false;
    saveCronJobs();
};

const deleteCronJob = (index: number) => {
    if (confirm('Delete this cron job?')) {
        cronJobs.value.splice(index, 1);
        saveCronJobs();
    }
};

const toggleCronJob = (index: number) => {
    cronJobs.value[index].is_disabled = !cronJobs.value[index].is_disabled;
    saveCronJobs();
};

// Firewall Functions
const fetchFirewall = async () => {
    isFirewallLoading.value = true;
    isFirewallMissing.value = false;
    try {
        const response = await fetch(`/servers/${props.server.id}/firewall`);
        const data = await response.json();
        if (data.success) {
            firewallStatus.value = data.status;
        } else {
            if (data.is_missing) {
                isFirewallMissing.value = true;
            } else {
                alert('Failed to fetch firewall status: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Firewall fetch failed:', error);
    } finally {
        isFirewallLoading.value = false;
    }
};

const installFirewall = async () => {
    if (!confirm('This will attempt to install UFW on your server. Do you want to continue?')) return;
    
    isFirewallInstalling.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/firewall/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content }
        });
        const data = await response.json();
        if (data.success) {
            alert('UFW installed successfully!');
            fetchFirewall();
        } else {
            alert('Installation failed: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to install firewall:', error);
    } finally {
        isFirewallInstalling.value = false;
    }
};

const addFirewallRule = async () => {
    if (!newFirewallRule.value.port) return alert('Port is required');
    if (newFirewallRule.value.action === 'allow' && newFirewallRule.value.source_scope === 'specific' && !newFirewallRule.value.source_ips.trim()) {
        return alert('Please enter at least one source IP/CIDR');
    }

    const payload = {
        ...newFirewallRule.value,
        source_scope: newFirewallRule.value.action === 'allow' ? newFirewallRule.value.source_scope : 'all',
        source_ips: newFirewallRule.value.action === 'allow' && newFirewallRule.value.source_scope === 'specific'
            ? newFirewallRule.value.source_ips
            : ''
    };

    isFirewallLoading.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/firewall/rule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            showAddFirewallModal.value = false;
            newFirewallRule.value = { port: '', proto: 'tcp', action: 'allow', source_scope: 'all', source_ips: '' };
            fetchFirewall();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to add firewall rule:', error);
    } finally {
        isFirewallLoading.value = false;
    }
};

const deleteFirewallRule = async (ruleNumber: number) => {
    if (!confirm(`Are you sure you want to delete rule #${ruleNumber}?`)) return;
    isFirewallLoading.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/firewall/rule`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ rule_number: ruleNumber })
        });
        const data = await response.json();
        if (data.success) {
            fetchFirewall();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to delete firewall rule:', error);
    } finally {
        isFirewallLoading.value = false;
    }
};

const toggleFirewall = async () => {
    const action = firewallStatus.value.enabled ? 'disable' : 'enable';
    if (!confirm(`Are you sure you want to ${action} UFW?`)) return;
    
    isFirewallLoading.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/firewall/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content },
            body: JSON.stringify({ enable: !firewallStatus.value.enabled })
        });
        const data = await response.json();
        if (data.success) {
            fetchFirewall();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to toggle firewall:', error);
    } finally {
        isFirewallLoading.value = false;
    }
};

// Recipe Functions
const fetchRecipes = async () => {
    isRecipesLoading.value = true;
    try {
        const response = await fetch('/api/recipes');
        recipes.value = await response.json();
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
    } finally {
        isRecipesLoading.value = false;
    }
};

const runRecipe = async (recipe: any) => {
    if (!confirm(`Are you sure you want to run recipe "${recipe.name}" on this server?`)) return;
    
    isRecipeExecuting.value = true;
    recipeExecutionResult.value = null;
    showRecipeOutputModal.value = true;
    
    try {
        const response = await fetch(`/servers/${props.server.id}/recipes/${recipe.id}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content }
        });
        const data = await response.json();
        recipeExecutionResult.value = data;
    } catch (error) {
        recipeExecutionResult.value = { success: false, output: 'Connection error or timeout.' };
    } finally {
        isRecipeExecuting.value = false;
    }
};

const fetchDatabases = async () => {
    isDatabasesLoading.value = true;
    databasesError.value = null;

    try {
        const response = await fetch(`/servers/${props.server.id}/databases`);
        
        // Check if response is ok first
        if (!response.ok) {
            databasesError.value = `Server error (${response.status}): ${response.statusText}`;
            databases.value = [];
            return;
        }

        // Try to parse as JSON
        let data;
        try {
            data = await response.json();
        } catch (jsonError: any) {
            // Response is not valid JSON - likely a server error
            const text = await response.text();
            databasesError.value = 'Server returned invalid response. Check server logs.';
            console.error('JSON parse error:', jsonError, 'Response text:', text);
            databases.value = [];
            return;
        }

        if (data.success) {
            databases.value = data.databases;
            databasesError.value = null;
        } else {
            databases.value = [];
            databasesError.value = data.message || 'No databases found (or access denied).';
        }
    } catch (error: any) {
        databases.value = [];
        databasesError.value = error?.message || 'Failed to fetch databases (connection error).';
        console.error('Failed to fetch databases:', error);
    } finally {
        isDatabasesLoading.value = false;
    }
};

const fetchAllServers = async () => {
    try {
        const response = await fetch('/servers');
        // Handle Inertia response if needed, but usually we can fetch as JSON if we have an API for it
        // Or just use props if shared. For now let's use a simple fetch or assume we need to list them.
        // Actually, let's just use the current servers from props if available or fetch them.
        const res = await fetch('/servers', { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        allServers.value = data.filter((s: any) => s.id !== props.server.id);
    } catch (error) {
        console.error('Failed to fetch servers:', error);
    }
};

const openTransferModal = (db: string) => {
    transferData.value.database = db;
    transferData.value.destination_database = db; // Suggest same name
    showTransferModal.value = true;
    if (allServers.value.length === 0) {
        fetchAllServers();
    }
};

const startDatabaseTransfer = async () => {
    if (!transferData.value.destination_server_id) {
        alert('Please select a destination server.');
        return;
    }

    isTransferring.value = true;
    showTransferModal.value = false;
    showTransferOutputModal.value = true;
    transferOutput.value = `Initializing Database Migration Pipeline...\n---------------------------------------\n[INIT] Connecting to Source: ${props.server.name}\n[INIT] Connecting to Destination...\n[AUTH] Establishing Secure Key Exchange...\n[FW] Whitelisting Source IP in Destination Firewall...\n[DATA] Starting Pipe: mysqldump -> ssh Destination -> mysql\n\n(Wait for data streaming... this may take time for large DBs)\n`;

    try {
        const response = await fetch(`/servers/${props.server.id}/databases/transfer`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content 
            },
            body: JSON.stringify(transferData.value)
        });
        const data = await response.json();
        
        if (data.success) {
            transferOutput.value += `\n[FINISH] Migration Successful! All tables and records transferred.\n[CLEAN] Firewall rules and temporary keys revoked.\n\n--- SERVER OUTPUT ---\n${data.output}`;
        } else {
            transferOutput.value += `\n[ERROR] Migration Failed.\n\n--- ERROR ---\n${data.message || data.output}`;
        }
    } catch (error) {
        transferOutput.value += `\n[ERROR] Connection lost during migration. Check server logs.`;
    } finally {
        isTransferring.value = false;
    }
};

// Watch activeTab to load data
watch(activeTab, (newTab) => {
    if (newTab === 'caddy' && !caddyfileContent.value) {
        fetchCaddyfile();
    } else if (newTab === 'cron' && cronJobs.value.length === 0) {
        fetchCronJobs();
    } else if (newTab === 'firewall' && firewallStatus.value.rules.length === 0) {
        fetchFirewall();
    } else if (newTab === 'recipes' && recipes.value.length === 0) {
        fetchRecipes();
    } else if (newTab === 'databases' && databases.value.length === 0) {
        fetchDatabases();
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

const rebootServer = async () => {
    if (!confirm('Are you sure you want to REBOOT this server? All services will be temporarily unavailable.')) return;

    isRebooting.value = true;
    try {
        const response = await fetch(`/servers/${props.server.id}/reboot`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content 
            }
        });
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            isLive.value = false; // Pause monitoring as server goes down
        } else {
            alert('Reboot failed: ' + data.message);
        }
    } catch (error) {
        // We often get errors when the server disconnects during reboot, which is "success"
        alert('Reboot command sent. The server is now restarting.');
        isLive.value = false;
    } finally {
        isRebooting.value = false;
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
                   
                   // Add to local metrics (history)
                   localMetrics.value = [...localMetrics.value, newMetric].slice(-50);
                   
                   const latest = {
                       ...newMetric,
                       recorded_at: new Date().toISOString()
                   };

                   // Update server status only if it's a 'full' update
                   if (newMetric.is_full) {
                       localServer.value = {
                           ...localServer.value,
                           latest_metric: latest
                       };
                   } else {
                       // For 'light' updates, keep the existing service_status and disk info
                       // BUT update instantaneous stats like CPU, RAM, Network
                       localServer.value = {
                           ...localServer.value,
                           latest_metric: {
                               ...localServer.value.latest_metric,
                               ...latest,
                               service_status: localServer.value.latest_metric?.service_status,
                               disk_usage: localServer.value.latest_metric?.disk_usage,
                               disk_total: localServer.value.latest_metric?.disk_total,
                               disk_used: localServer.value.latest_metric?.disk_used,
                           }
                       };
                   }
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
                    <button class="btn btn-secondary reboot-btn" @click="rebootServer" :disabled="isRebooting">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                        </svg>
                        {{ isRebooting ? 'Rebooting...' : 'Reboot' }}
                    </button>
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
                <button 
                    :class="['tab-btn', { active: activeTab === 'cron' }]" 
                    @click="activeTab = 'cron'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4M12 2v4M12 18v4M16 2v4M8 2v4M22 12h-4"/></svg>
                    Cron Jobs
                </button>
                <button 
                    :class="['tab-btn', { active: activeTab === 'firewall' }]" 
                    @click="activeTab = 'firewall'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Firewall
                </button>
                <button 
                    :class="['tab-btn', { active: activeTab === 'recipes' }]" 
                    @click="activeTab = 'recipes'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Recipes
                </button>
                <!-- <button 
                    v-if="localServer.installed_services?.includes('mysql') || localServer.installed_services?.includes('mariadb')"
                    :class="['tab-btn', { active: activeTab === 'databases' }]" 
                    @click="activeTab = 'databases'"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    Databases
                </button> -->
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

            <!-- Cron Jobs Section -->
            <div v-if="activeTab === 'cron'" class="cron-section">
                <div class="info-card cron-card">
                    <div class="card-header-with-action">
                        <div class="header-title">
                            <h3>Cron Jobs Manager</h3>
                            <p class="text-sm text-slate-400">Manage scheduled tasks for this server.</p>
                        </div>
                        <button class="btn btn-primary" @click="openAddModal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Job
                        </button>
                    </div>

                    <div v-if="isCronLoading" class="loading-state">
                        <div class="mini-spinner"></div>
                        <span>Loading cron jobs...</span>
                    </div>

                    <div v-else-if="cronJobs.length === 0" class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p>No cron jobs found.</p>
                        <button class="btn btn-secondary btn-sm" @click="openAddModal">Create First Job</button>
                    </div>

                    <div v-else class="cron-list">
                        <div v-for="(job, index) in cronJobs" :key="job.id || index" class="cron-item" :class="{ disabled: job.is_disabled }">
                            <div class="cron-details">
                                <div class="cron-schedule">
                                    <span class="schedule-expression">{{ job.expression }}</span>
                                    <span class="schedule-human">{{ job.human_schedule }}</span>
                                </div>
                                <div class="cron-command">
                                    <code>{{ job.command }}</code>
                                </div>
                            </div>
                            <div class="cron-actions">
                                <button 
                                    class="toggle-btn" 
                                    :class="{ active: !job.is_disabled }"
                                    @click="toggleCronJob(index)"
                                    title="Toggle Enable/Disable"
                                >
                                    <span class="toggle-slider"></span>
                                </button>
                                <button class="btn-icon-only" @click="openEditModal(index)" title="Edit Job">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-icon-only delete" @click="deleteCronJob(index)" title="Delete Job">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Cron Job Modal -->
            <div v-if="showAddCronModal" class="modal-overlay" @click.self="showAddCronModal = false">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>{{ editingCronIndex !== null ? 'Edit Cron Job' : 'Add New Cron Job' }}</h3>
                        <button class="close-btn" @click="showAddCronModal = false">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Schedule Mode</label>
                            <div class="mode-tabs">
                                <button 
                                    :class="['mode-tab', { active: scheduleMode === 'preset' }]" 
                                    @click="scheduleMode = 'preset'"
                                >
                                    Common Presets
                                </button>
                                <button 
                                    :class="['mode-tab', { active: scheduleMode === 'custom' }]" 
                                    @click="scheduleMode = 'custom'"
                                >
                                    Custom Builder
                                </button>
                            </div>
                        </div>

                        <div v-if="scheduleMode === 'preset'" class="form-group">
                            <label>Common Schedules</label>
                            <select v-model="selectedPreset" class="form-select">
                                <option v-for="preset in cronPresets" :key="preset.value" :value="preset.value">
                                    {{ preset.label }}
                                </option>
                            </select>
                        </div>

                        <div v-if="scheduleMode === 'custom'" class="form-group">
                            <label>Custom Schedule Builder</label>
                            
                            <!-- Time Section -->
                            <div class="cron-builder-section">
                                <span class="section-label">Time</span>
                                <div class="cron-inputs-row">
                                    <div class="cron-input-group">
                                        <label>Minute (0-59)</label>
                                        <input v-model="customSchedule.minute" type="text" class="form-input text-center" placeholder="*" />
                                    </div>
                                    <div class="cron-separator">:</div>
                                    <div class="cron-input-group">
                                        <label>Hour (0-23)</label>
                                        <input v-model="customSchedule.hour" type="text" class="form-input text-center" placeholder="*" />
                                    </div>
                                </div>
                            </div>

                            <!-- Date Section -->
                            <div class="cron-builder-section">
                                <span class="section-label">Date</span>
                                <div class="cron-inputs-row">
                                    <div class="cron-input-group">
                                        <label>Day of Month (1-31)</label>
                                        <input v-model="customSchedule.day" type="text" class="form-input text-center" placeholder="*" />
                                    </div>
                                </div>
                            </div>

                            <!-- Weekday Selector -->
                            <div class="cron-builder-section">
                                <span class="section-label">Weekday</span>
                                <div class="cron-pills">
                                    <button 
                                        v-for="day in weekDays" 
                                        :key="day.value"
                                        class="cron-pill"
                                        :class="{ active: isSelected(customSchedule.weekday, day.value) }"
                                        @click="toggleWeekday(day.value)"
                                    >
                                        {{ day.label }}
                                    </button>
                                </div>
                                <div class="cron-input-group mt-2">
                                     <input v-model="customSchedule.weekday" type="text" class="form-input text-center small-input" placeholder="*" />
                                </div>
                            </div>

                            <!-- Month Selector -->
                            <div class="cron-builder-section">
                                <span class="section-label">Month</span>
                                <div class="cron-pills">
                                    <button 
                                        v-for="month in months" 
                                        :key="month.value"
                                        class="cron-pill"
                                        :class="{ active: isSelected(customSchedule.month, month.value) }"
                                        @click="toggleMonth(month.value)"
                                    >
                                        {{ month.label }}
                                    </button>
                                </div>
                                <div class="cron-input-group mt-2">
                                     <input v-model="customSchedule.month" type="text" class="form-input text-center small-input" placeholder="*" />
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Resulting Expression</label>
                            <input v-model="newCronJob.expression" type="text" class="form-input code-font" readonly />
                            <p class="preview-text" v-if="newCronJob.expression">Runs: {{ getHumanCron(newCronJob.expression) }}</p>
                        </div>

                        <div class="form-group">
                            <label>Command</label>
                            <input v-model="newCronJob.command" type="text" placeholder="/usr/bin/php /path/to/artisan schedule:run" class="form-input code-font" />
                            <p class="help-text">Ensure you include full paths to binaries.</p>
                        </div>
                    </div>
                <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showAddCronModal = false">Cancel</button>
                        <button class="btn btn-primary" @click="saveCronJob" :disabled="!newCronJob.command">
                            {{ editingCronIndex !== null ? 'Save Changes' : 'Add Job' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Firewall Section -->
            <div v-if="activeTab === 'firewall'" class="firewall-section">
                <div class="info-card firewall-card">
                    <div class="card-header-with-action">
                        <div class="header-title">
                            <h3>UFW Firewall Manager</h3>
                            <p class="text-sm text-slate-400">Manage open ports and security rules.</p>
                        </div>
                        <div class="header-actions">
                            <button 
                                :class="['btn', firewallStatus.enabled ? 'btn-danger' : 'btn-primary']" 
                                @click="toggleFirewall"
                                :disabled="isFirewallLoading"
                            >
                                {{ firewallStatus.enabled ? 'Disable Firewall' : 'Enable Firewall' }}
                            </button>
                            <button class="btn btn-primary" @click="showAddFirewallModal = true" :disabled="!firewallStatus.enabled">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Allow Port
                            </button>
                        </div>
                    </div>

                    <div v-if="isFirewallLoading" class="loading-state">
                        <div class="mini-spinner"></div>
                        <span>Loading firewall status...</span>
                    </div>

                    <div v-else-if="isFirewallMissing" class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon text-slate-500">
                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <p>UFW Firewall is not installed on this server.</p>
                        <button class="btn btn-primary btn-sm" @click="installFirewall" :disabled="isFirewallInstalling">
                             {{ isFirewallInstalling ? 'Installing...' : 'Install UFW' }}
                        </button>
                    </div>

                    <div v-else-if="!firewallStatus.enabled" class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon text-slate-500">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <p>UFW Firewall is currently inactive.</p>
                        <button class="btn btn-primary btn-sm" @click="toggleFirewall">Enable UFW</button>
                    </div>

                    <div v-else class="firewall-list">
                        <div class="table-responsive">
                            <table class="firewall-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Port / Service</th>
                                        <th>Action</th>
                                        <th>Direction</th>
                                        <th>From</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="rule in firewallStatus.rules" :key="rule.number">
                                        <td>{{ rule.number }}</td>
                                        <td><span class="port-badge">{{ rule.to }}</span></td>
                                        <td><span :class="['action-badge', rule.action.toLowerCase()]">{{ rule.action }}</span></td>
                                        <td>{{ rule.direction }}</td>
                                        <td>{{ rule.from }}</td>
                                        <td>
                                            <button class="btn-icon-only delete" @click="deleteFirewallRule(rule.number)" title="Delete Rule">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recipes Section -->
            <div v-if="activeTab === 'recipes'" class="recipes-section">
                <div class="info-card recipes-card">
                    <div class="card-header-with-action">
                        <div class="header-title">
                            <h3>Script Library (Recipes)</h3>
                            <p class="text-sm text-slate-400">Quick-run snippets and maintenance tasks.</p>
                        </div>
                        <Link href="/recipes" class="btn btn-secondary btn-sm">Manage Library</Link>
                    </div>

                    <div v-if="isRecipesLoading" class="loading-state">
                        <div class="mini-spinner"></div>
                        <span>Loading recipes...</span>
                    </div>

                    <div v-else-if="recipes.length === 0" class="empty-state">
                         <p>No recipes found in library.</p>
                         <Link href="/recipes" class="btn btn-primary btn-sm">Add First Recipe</Link>
                    </div>

                    <div v-else class="recipes-grid-sm">
                        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-item-card">
                            <div class="recipe-card-content">
                                <span class="category-pill">{{ recipe.category }}</span>
                                <h4>{{ recipe.name }}</h4>
                                <p>{{ recipe.description }}</p>
                                <code>{{ recipe.command }}</code>
                            </div>
                            <button class="btn btn-primary btn-block" @click="runRecipe(recipe)" :disabled="isRecipeExecuting">
                                Run Snippet
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Databases Section (Disabled due to 500 errors) -->
            <!-- <div v-if="activeTab === 'databases'" class="databases-section">
                <div class="info-card databases-card">
                    <div class="card-header-with-action">
                        <div class="header-title">
                            <h3>MySQL Database Manager <span class="beta-badge">Beta</span></h3>
                            <p class="text-sm text-slate-400">View databases and perform liquid migrations.</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" @click="fetchDatabases" :disabled="isDatabasesLoading">
                            <svg :class="{ 'spinning': isDatabasesLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            Refresh
                        </button>
                    </div>

                    <div v-if="isDatabasesLoading" class="loading-state">
                        <div class="mini-spinner"></div>
                        <span>Scanning databases...</span>
                    </div>

                    <div v-else-if="databases.length === 0" class="empty-state">
                         <p v-if="databasesError">{{ databasesError }}</p>
                         <p v-else>No databases found (or access denied).</p>
                    </div>

                    <div v-else class="database-list">
                        <div class="table-responsive">
                            <table class="db-table">
                                <thead>
                                    <tr>
                                        <th>Database Name</th>
                                        <th>Size</th>
                                        <th>Tables</th>
                                        <th class="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="db in databases" :key="db.name">
                                        <td>
                                            <div class="db-name-wrapper">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="db-icon">
                                                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                                                </svg>
                                                <span>{{ db.name }}</span>
                                            </div>
                                        </td>
                                        <td>{{ db.size_mb }} MB</td>
                                        <td>{{ db.tables_count }}</td>
                                        <td class="text-right">
                                            <button class="btn btn-outline btn-sm" @click="openTransferModal(db.name)">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                                Swift Migration
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div> -->

            <!-- Add Firewall Modal -->
            <div v-if="showAddFirewallModal" class="modal-overlay" @click.self="showAddFirewallModal = false">
                <div class="modal-content small">
                    <div class="modal-header">
                        <h3>Allow New Port</h3>
                        <button class="close-btn" @click="showAddFirewallModal = false">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Port (or Service Name)</label>
                            <input v-model="newFirewallRule.port" type="text" placeholder="80, 443, 8080 or 'nginx'" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Protocol</label>
                            <select v-model="newFirewallRule.proto" class="form-select">
                                <option value="tcp">TCP</option>
                                <option value="udp">UDP</option>
                                <option value="any">Any (Both)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Action</label>
                            <select v-model="newFirewallRule.action" class="form-select">
                                <option value="allow">Allow</option>
                                <option value="deny">Deny</option>
                                <option value="reject">Reject</option>
                            </select>
                        </div>
                        <div v-if="newFirewallRule.action === 'allow'" class="form-group">
                            <label>Allow Scope</label>
                            <select v-model="newFirewallRule.source_scope" class="form-select">
                                <option value="all">Allow from all IPs</option>
                                <option value="specific">Allow from specific IPs only</option>
                            </select>
                        </div>
                        <div v-if="newFirewallRule.action === 'allow' && newFirewallRule.source_scope === 'specific'" class="form-group">
                            <label>Source IPs / CIDRs</label>
                            <textarea
                                v-model="newFirewallRule.source_ips"
                                class="form-input"
                                rows="3"
                                placeholder="مثال: 203.0.113.10 أو 203.0.113.0/24، وافصل بين القيم بمسافة أو فاصلة أو سطر جديد"
                            ></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showAddFirewallModal = false">Cancel</button>
                        <button class="btn btn-primary" @click="addFirewallRule" :disabled="!newFirewallRule.port">Add Rule</button>
                    </div>
                </div>
            </div>

            <!-- Recipe Execution Output Modal -->
            <div v-if="showRecipeOutputModal" class="modal-overlay" @click.self="showRecipeOutputModal = false">
                <div class="modal-content large terminal-modal">
                    <div class="modal-header">
                        <h3>Execution Output</h3>
                        <button class="close-btn" @click="showRecipeOutputModal = false" :disabled="isRecipeExecuting">&times;</button>
                    </div>
                    <div class="modal-body terminal-body">
                        <div v-if="isRecipeExecuting" class="executing-state">
                            <div class="mini-spinner"></div>
                            <p>Running snippet on server...</p>
                        </div>
                        <div v-else-if="recipeExecutionResult" class="execution-result">
                            <div :class="['result-banner', recipeExecutionResult.success ? 'success' : 'error']">
                                {{ recipeExecutionResult.message }}
                                <span v-if="recipeExecutionResult.exit_status !== null">(Exit Status: {{ recipeExecutionResult.exit_status }})</span>
                            </div>
                            <div class="output-viewer">
                                <pre>{{ recipeExecutionResult.output || 'No output produced.' }}</pre>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showRecipeOutputModal = false" :disabled="isRecipeExecuting">Close</button>
                    </div>
                </div>
            </div>

            <!-- Database Transfer Modal (Disabled) -->
            <!-- <div v-if="showTransferModal" class="modal-overlay" @click.self="showTransferModal = false">
                <div class="modal-content small migration-modal">
                    <div class="modal-header">
                        <h3>Swift DB Migration</h3>
                        <button class="close-btn" @click="showTransferModal = false">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="migration-alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <p>This will pipe the database <strong>{{ transferData.database }}</strong> directly to the destination server.</p>
                        </div>

                        <div class="form-group">
                            <label>Destination Server</label>
                            <select v-model="transferData.destination_server_id" class="form-select">
                                <option value="" disabled>Select Target Server</option>
                                <option v-for="s in allServers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.ip }})</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Destination Database Name</label>
                            <input v-model="transferData.destination_database" type="text" class="form-input" placeholder="e.g. database_new">
                            <p class="help-text">Database will be created if it doesn't exist.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showTransferModal = false">Cancel</button>
                        <button class="btn btn-primary" @click="startDatabaseTransfer">
                            Initialize Migration
                        </button>
                    </div>
                </div>
            </div> -->

            <!-- Migration Output Modal (Disabled) -->
            <!-- <div v-if="showTransferOutputModal" class="modal-overlay" @click.self="!isTransferring && (showTransferOutputModal = false)">
                <div class="modal-content medium terminal-modal">
                    <div class="modal-header">
                        <h3>Migration Pipeline Output</h3>
                        <button v-if="!isTransferring" class="close-btn" @click="showTransferOutputModal = false">&times;</button>
                    </div>
                    <div class="modal-body terminal-body">
                        <pre>{{ transferOutput }}</pre>
                        <div v-if="isTransferring" class="terminal-loader">
                            <div class="mini-spinner"></div>
                            <span>Streaming database via secure pipe...</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button v-if="!isTransferring" class="btn btn-primary" @click="showTransferOutputModal = false">Close</button>
                    </div>
                </div>
            </div> -->
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

.beta-badge {
    background: #f59e0b;
    color: #000;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    text-transform: uppercase;
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
/* Cron Manager Styles */
.cron-card {
    min-height: 400px;
}

.header-title h3 {
    margin: 0;
    font-size: 1.125rem;
    color: #e2e8f0;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
    color: #64748b;
    text-align: center;
}

.empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.5;
}

.cron-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cron-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.2s;
}

.cron-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}

.cron-item.disabled {
    opacity: 0.6;
}

.cron-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.cron-schedule {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.schedule-expression {
    font-family: 'Fira Code', monospace;
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
    padding: 0.1rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.schedule-human {
    font-size: 0.875rem;
    color: #94a3b8;
}

.cron-command code {
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #e2e8f0;
    word-break: break-all;
}

.cron-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.toggle-btn {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    position: relative;
    cursor: pointer;
    border: none;
    transition: all 0.3s;
    padding: 2px;
}

.toggle-btn.active {
    background: #6366f1;
}

.toggle-slider {
    display: block;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s;
    transform: translateX(0);
}

.toggle-btn.active .toggle-slider {
    transform: translateX(20px);
}

.btn-icon-only {
    background: transparent;
    border: none;
    color: #64748b;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon-only svg {
    width: 18px;
    height: 18px;
}

.btn-icon-only:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
}

.btn-icon-only.delete:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-content {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh; /* Limit height */
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    animation: modalSlide 0.3s ease-out;
    display: flex; /* Use flexbox */
    flex-direction: column; /* Stack children */
}

@keyframes modalSlide {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0; /* Prevent header from shrinking */
}

/* ... existing button styles ... */

.modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto; /* Enable vertical scrolling */
    flex: 1; /* Allow body to take available space */
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    flex-shrink: 0; /* Prevent footer from shrinking */
}

/* Cron Builder Styles */
.mode-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.5rem;
    padding: 0.25rem;
    gap: 0.25rem;
}

.mode-tab {
    flex: 1;
    background: transparent;
    border: none;
    color: #64748b;
    padding: 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.mode-tab.active {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    font-weight: 500;
}

.form-select {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 0.625rem 1rem;
    color: #e2e8f0;
    width: 100%;
}

.form-select option {
    background: #0f172a;
    color: #e2e8f0;
}

.cron-builder-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.section-label {
    position: absolute;
    top: -0.6rem;
    left: 0.75rem;
    background: #0f172a; /* Match modal bg */
    padding: 0 0.5rem;
    color: #a5b4fc;
    font-size: 0.75rem;
    font-weight: 600;
}

.cron-inputs-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.cron-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.cron-input-group label {
    font-size: 0.75rem;
    color: #64748b;
}

.cron-input-group input {
    width: 100%;
}

.cron-separator {
    color: #64748b;
    font-weight: bold;
    padding-top: 1rem;
}

.cron-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.cron-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 2.5rem;
    text-align: center;
}

.cron-pill:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

.cron-pill.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

.small-input {
    font-size: 0.75rem;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #64748b;
}

.text-center {
    text-align: center;
}

.code-font {
    font-family: 'Fira Code', monospace;
    color: #a5b4fc;
}
/* Firewall & Recipes Styling */
.firewall-section, .recipes-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.firewall-table {
    width: 100%;
    border-collapse: collapse;
}

.firewall-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.firewall-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    color: #e2e8f0;
    font-size: 0.875rem;
}

.port-badge {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
}

.action-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.action-badge.allow { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.action-badge.deny { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.action-badge.reject { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.recipes-grid-sm {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
}

.recipe-item-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s;
}

.recipe-item-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
}

.recipe-card-content {
    margin-bottom: 1.25rem;
}

.category-pill {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.recipe-item-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #e2e8f0;
}

.recipe-item-card p {
    margin: 0 0 1rem 0;
    font-size: 0.8125rem;
    color: #94a3b8;
    line-height: 1.4;
}

.recipe-item-card code {
    display: block;
    background: #0d0d17;
    padding: 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.75rem;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.btn-block { width: 100%; justify-content: center; }

/* Execution Result Styles */
.terminal-modal .modal-content { max-width: 800px; }
.terminal-body { padding: 0 !important; background: #0d0d17; min-height: 400px; }
.executing-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 1rem;
    color: #64748b;
}

.result-banner {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.result-banner.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-bottom: 1px solid rgba(34, 197, 94, 0.2); }
.result-banner.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-bottom: 1px solid rgba(239, 68, 68, 0.2); }

.output-viewer {
    padding: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
}

.output-viewer pre {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.8125rem;
    color: #e2e8f0;
    white-space: pre-wrap;
    line-height: 1.6;
}
/* Database Management Styles */
.db-table {
    width: 100%;
    border-collapse: collapse;
}

.db-table th {
    text-align: left;
    padding: 1rem;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.db-table td {
    padding: 1rem;
    color: #e2e8f0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.db-name-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
}

.db-icon {
    width: 18px;
    height: 18px;
    color: #6366f1;
}

.btn-outline {
    background: transparent;
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
}

.btn-outline:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: #6366f1;
}

.migration-alert {
    display: flex;
    gap: 1rem;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    padding: 1rem;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    color: #f59e0b;
    font-size: 0.875rem;
}

.migration-alert .alert-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.terminal-loader {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    color: #6366f1;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.3);
}

.text-right { text-align: right; }
</style>
