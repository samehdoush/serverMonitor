<script setup>
import { Head, Link, router } from '@inertiajs/vue3';
import { computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const props = defineProps({
    servers: Array,
    stats: Object
});

const handleAction = async (url) => {
    try {
        await axios.get(url);
    } catch (e) {
        console.error('Action failed', e);
        // Fallback to fetch if axios fails for some reason
        fetch(url);
    }
};

const openSettings = async () => {
    await handleAction('/menubar/settings');
};

let interval = null;

onMounted(() => {
    // Refresh data every 10 seconds to keep order and stats in sync
    interval = setInterval(() => {
        router.reload({ preserveScroll: true, only: ['servers', 'stats'] });
    }, 10000);
});

onUnmounted(() => {
    if (interval) clearInterval(interval);
});

const getStatusColor = (usage) => {
    if (usage > 90) return 'text-red-500';
    if (usage > 70) return 'text-yellow-500';
    return 'text-emerald-500';
};

const getStatusBg = (usage) => {
    if (usage > 90) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (usage > 70) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
};

const hasIssue = (server) => {
    return server.cpu_usage > 80 || server.ram_usage > 80 || server.disk_usage > 90;
};
</script>

<template>
    <Head title="Menu Bar" />
    
    <div class="flex flex-col h-screen bg-[#0F172A] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                <h1 class="text-sm font-semibold tracking-tight text-white/90">Server Monitor</h1>
            </div>
            <div class="flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50 animate-in fade-in slide-in-from-right-2 duration-500">
                <span class="text-[10px] font-medium text-slate-400 capitalize">{{ stats.active }} / {{ stats.total }} Online</span>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-2 p-3">
            <div class="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300">
                <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Servers</p>
                <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
            </div>
            <div :class="['p-3 rounded-2xl border transition-all duration-300', stats.issues > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-900/40 border-slate-800/50']">
                <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Alerts</p>
                <p class="text-2xl font-bold" :class="stats.issues > 0 ? 'text-red-400' : 'text-slate-400'">{{ stats.issues }}</p>
            </div>
        </div>

        <!-- Server List -->
        <div class="flex-1 overflow-y-auto px-1 custom-scrollbar pb-16">
            <div class="space-y-1">
                <div v-for="server in servers" :key="server.id" 
                    @click="handleAction(`/menubar/servers/${server.id}`)"
                    class="group relative mx-2 p-3 rounded-xl hover:bg-slate-800/40 transition-all duration-200 border border-transparent hover:border-slate-700/30 cursor-pointer active:scale-[0.98]">
                    
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2.5 overflow-hidden">
                            <div :class="['w-1.5 h-1.5 rounded-full shrink-0', server.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-600']"></div>
                            <span class="text-xs font-semibold text-slate-200 truncate">{{ server.name }}</span>
                        </div>
                        <span v-if="hasIssue(server)" class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 font-bold uppercase tracking-tight">Issue</span>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <div class="space-y-1">
                            <div class="flex justify-between text-[9px] text-slate-500 font-medium">
                                <span>CPU</span>
                                <span :class="getStatusColor(server.cpu_usage)">{{ Math.round(server.cpu_usage) }}%</span>
                            </div>
                            <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000" 
                                    :class="server.cpu_usage > 80 ? 'bg-red-500' : 'bg-indigo-500'"
                                    :style="{ width: `${server.cpu_usage}%` }"></div>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[9px] text-slate-500 font-medium">
                                <span>RAM</span>
                                <span :class="getStatusColor(server.ram_usage)">{{ Math.round(server.ram_usage) }}%</span>
                            </div>
                            <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000" 
                                    :class="server.ram_usage > 80 ? 'bg-red-500' : 'bg-cyan-500'"
                                    :style="{ width: `${server.ram_usage}%` }"></div>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[9px] text-slate-500 font-medium">
                                <span>DISK</span>
                                <span :class="getStatusColor(server.disk_usage)">{{ Math.round(server.disk_usage) }}%</span>
                            </div>
                            <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000" 
                                    :class="server.disk_usage > 90 ? 'bg-red-500' : 'bg-emerald-500'"
                                    :style="{ width: `${server.disk_usage}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div v-if="servers.length === 0" class="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-slate-800/50">
                    <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
                <div class="space-y-1">
                    <p class="text-xs font-semibold text-slate-400">No servers monitored</p>
                    <p class="text-[10px] text-slate-600">Add your first server to start monitoring.</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/50 flex gap-2">
            <button @click="handleAction('/menubar/focus')" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                Dashboard
            </button>
            <button @click="openSettings" class="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-all active:scale-95 border border-slate-700/50">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.1);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.2);
}
</style>
