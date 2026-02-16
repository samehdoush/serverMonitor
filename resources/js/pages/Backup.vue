<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

const props = defineProps<{
    flash?: {
        success?: string;
        error?: string;
    }
}>();

const form = useForm({});

const exportBackup = () => {
    form.post('/backup/export');
};

const importBackup = () => {
    form.post('/backup/import');
};
</script>

<template>
    <AppLayout>
        <div class="backup-page">
            <header class="page-header">
                <h1>Backup & Restore</h1>
            </header>

            <div v-if="$page.props.flash?.success" class="alert success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {{ $page.props.flash.success }}
            </div>

            <div v-if="$page.props.flash?.error" class="alert error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {{ $page.props.flash.error }}
            </div>

            <div class="cards-grid">
                <div class="card">
                    <div class="card-icon export">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <h2>Export Servers</h2>
                    <p>
                        Export all your server configurations to a JSON file. 
                        This includes server names, IPs, ports, and alert thresholds.
                    </p>
                    <button class="btn btn-primary" @click="exportBackup" :disabled="form.processing">
                        {{ form.processing ? 'Processing...' : 'Export Backup' }}
                    </button>
                </div>

                <div class="card">
                    <div class="card-icon import">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h2>Import Servers</h2>
                    <p>
                        Restore server configurations from a previously exported JSON file.
                        Existing servers with the same IP will be skipped.
                    </p>
                    <button class="btn btn-secondary" @click="importBackup" :disabled="form.processing">
                        {{ form.processing ? 'Processing...' : 'Import Backup' }}
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.backup-page {
    max-width: 900px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e2e8f0;
}

.alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
}

.alert svg {
    width: 20px;
    height: 20px;
}

.alert.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.alert.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.card-icon {
    width: 64px;
    height: 64px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.card-icon svg {
    width: 32px;
    height: 32px;
}

.card-icon.export {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
}

.card-icon.import {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
}

.card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.75rem;
}

.card p {
    color: #94a3b8;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.btn {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
}

.btn-secondary {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.2);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
