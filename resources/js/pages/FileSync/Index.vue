<script setup lang="ts">
import { Head, useForm, Link } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref } from 'vue';

const props = defineProps<{
    tasks: any[];
    servers: any[];
}>();

const showModal = ref(false);
const editingTask = ref<any>(null);
const showOutputModal = ref(false);
const executionOutput = ref<string | null>(null);
const isExecuting = ref(false);

const form = useForm({
    name: '',
    source_server_id: '',
    destination_server_id: '',
    source_path: '',
    destination_path: '',
    delete_extra: false,
});

const openCreateModal = () => {
    editingTask.value = null;
    form.reset();
    showModal.value = true;
};

const openEditModal = (task: any) => {
    editingTask.value = task;
    form.name = task.name;
    form.source_server_id = task.source_server_id;
    form.destination_server_id = task.destination_server_id;
    form.source_path = task.source_path;
    form.destination_path = task.destination_path;
    form.delete_extra = task.delete_extra;
    showModal.value = true;
};

const submit = () => {
    if (editingTask.value) {
        form.put(`/file-sync/${editingTask.value.id}`, {
            onSuccess: () => {
                showModal.value = false;
                form.reset();
            },
        });
    } else {
        form.post('/file-sync', {
            onSuccess: () => {
                showModal.value = false;
                form.reset();
            },
        });
    }
};

const deleteTask = (task: any) => {
    if (confirm('Are you sure you want to delete this sync task?')) {
        form.delete(`/file-sync/${task.id}`);
    }
};

const runTask = async (task: any) => {
    isExecuting.value = true;
    executionOutput.value = 'Initializing Secure Sync Pipeline...\n----------------------------------\n[STEP 1] Checking rsync on Source & Destination...\n[STEP 2] Generating/Exchanging SSH Keys...\n[STEP 3] Authorizing Source IP in Destination Firewall...\n[STEP 4] Starting Rsync Process...\n\n(Wait for incremental transfer to complete...)\n';
    showOutputModal.value = true;

    try {
        const response = await fetch(`/file-sync/${task.id}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any).content,
            },
        });
        const data = await response.json();
        executionOutput.value += `\n[FINISH] Synchronization completed.\n\n--- OUTPUT ---\n${data.output}`;
    } catch (error) {
        executionOutput.value += `\n[ERROR] Connection lost or orchestration failed.`;
    } finally {
        isExecuting.value = false;
    }
};

const formatDate = (date: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
};

const getStatusClass = (status: string) => {
    if (status === 'success') return 'status-success';
    if (status === 'failed') return 'status-failed';
    return 'status-pending';
};
</script>

<template>
    <Head title="File Sync Manager" />

    <AppLayout>
        <div class="file-sync-page">
            <header class="page-header">
                <div class="header-content">
                    <h1>File Sync Manager <span class="beta-badge">Beta</span></h1>
                    <p>Efficiently synchronize files between servers using encrypted rsync pipelines.</p>
                </div>
                <button class="btn btn-primary" @click="openCreateModal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Sync Task
                </button>
            </header>

            <div v-if="tasks.length === 0" class="empty-state">
                <div class="empty-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
                         <path d="M7 15l5 5 5-5M7 9l5-5 5 5M12 4v16" />
                    </svg>
                </div>
                <h3>No sync tasks yet</h3>
                <p>Create your first task to start synchronizing data between your servers.</p>
                <button class="btn btn-primary" @click="openCreateModal">Get Started</button>
            </div>

            <div v-else class="tasks-grid">
                <div v-for="task in tasks" :key="task.id" class="task-card">
                    <div class="task-card-header">
                        <div class="task-info">
                            <h3>{{ task.name }}</h3>
                            <span :class="['status-badge', getStatusClass(task.last_status)]">
                                {{ task.last_status || 'Never Run' }}
                            </span>
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon-only" @click="openEditModal(task)" title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button class="btn-icon-only delete" @click="deleteTask(task)" title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="task-card-body">
                        <div class="sync-pipeline">
                            <div class="pipeline-node source">
                                <span class="node-label">Source</span>
                                <span class="server-name">{{ task.source_server.name }}</span>
                                <code class="path-preview">{{ task.source_path }}</code>
                            </div>
                            <div class="pipeline-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                            <div class="pipeline-node destination">
                                <span class="node-label">Destination</span>
                                <span class="server-name">{{ task.destination_server.name }}</span>
                                <code class="path-preview">{{ task.destination_path }}</code>
                            </div>
                        </div>

                        <div class="task-meta">
                            <div class="meta-item">
                                <span class="label">Last Run:</span>
                                <span class="value">{{ formatDate(task.last_run_at) }}</span>
                            </div>
                            <div v-if="task.delete_extra" class="meta-item warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                </svg>
                                <span>Destructive Sync (--delete)</span>
                            </div>
                        </div>
                    </div>

                    <div class="task-card-footer">
                        <button class="btn btn-primary btn-block" @click="runTask(task)" :disabled="isExecuting">
                            <svg v-if="!isExecuting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" /><path d="M21 3v9h-9" />
                            </svg>
                            <div v-else class="mini-spinner sm"></div>
                            {{ isExecuting ? 'Orchestrating...' : 'Start Sync Now' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>{{ editingTask ? 'Edit Sync Task' : 'New Sync Task' }}</h2>
                        <button class="close-btn" @click="showModal = false">&times;</button>
                    </div>
                    <form @submit.prevent="submit" class="modal-body">
                        <div class="form-group">
                            <label>Task Name</label>
                            <input v-model="form.name" type="text" placeholder="e.g., Sync Media to Mirror" class="form-input" required />
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Source Server</label>
                                <select v-model="form.source_server_id" class="form-select" required>
                                    <option value="" disabled>Select Source</option>
                                    <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }}</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Destination Server</label>
                                <select v-model="form.destination_server_id" class="form-select" required>
                                    <option value="" disabled>Select Destination</option>
                                    <option v-for="s in servers" :key="s.id" :value="s.id">{{ s.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Source Path</label>
                            <input v-model="form.source_path" type="text" placeholder="/var/www/html/storage/app/public/" class="form-input code-font" required />
                            <p class="help-text">Tip: End with / to sync contents, or omit / to sync the folder itself.</p>
                        </div>

                        <div class="form-group">
                            <label>Destination Path</label>
                            <input v-model="form.destination_path" type="text" placeholder="/var/www/html/storage/app/public/" class="form-input code-font" required />
                        </div>

                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input v-model="form.delete_extra" type="checkbox" class="checkbox" />
                                <span>Delete files on destination that are not present in source (--delete)</span>
                            </label>
                        </div>
                    </form>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="submit" :disabled="form.processing">
                            {{ editingTask ? 'Save Changes' : 'Create Task' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Execution Output Modal -->
            <div v-if="showOutputModal" class="modal-overlay" @click.self="!isExecuting && (showOutputModal = false)">
                <div class="modal-content terminal-modal">
                    <div class="modal-header">
                        <h2>Sync Execution Output</h2>
                        <button v-if="!isExecuting" class="close-btn" @click="showOutputModal = false">&times;</button>
                    </div>
                    <div class="modal-body terminal-body">
                        <pre>{{ executionOutput }}</pre>
                        <div v-if="isExecuting" class="terminal-loader">
                            <div class="mini-spinner"></div>
                            <span>Transferring data...</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button v-if="!isExecuting" class="btn btn-primary" @click="showOutputModal = false">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.file-sync-page {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
}

.header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #e2e8f0;
}

.header-content p {
    color: #94a3b8;
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

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.task-card {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    transition: all 0.2s ease;
}

.task-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.task-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.task-info h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.status-badge {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
}

.status-success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.status-failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.status-pending { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }

.sync-pipeline {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 1.25rem;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
}

.pipeline-node {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.node-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
}

.server-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #a5b4fc;
}

.path-preview {
    font-family: 'Fira Code', monospace;
    font-size: 0.75rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pipeline-arrow {
    color: #334155;
    flex-shrink: 0;
}

.pipeline-arrow svg { width: 20px; height: 20px; }

.task-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
}

.meta-item .label { color: #64748b; }
.meta-item .value { color: #94a3b8; }

.meta-item.warning {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    width: fit-content;
}

.mini-icon { width: 14px; height: 14px; }

.task-card-footer {
    margin-top: auto;
}

.empty-state {
    text-align: center;
    padding: 5rem 2rem;
    background: rgba(15, 15, 26, 0.4);
    border: 2px dashed rgba(99, 102, 241, 0.1);
    border-radius: 1.5rem;
}

.empty-icon-wrapper {
    width: 64px;
    height: 64px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
}

.empty-icon {
    width: 32px;
    height: 32px;
    color: #6366f1;
}

/* Modal and General UI elements from previous implementation */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-content {
    background: #0f0f1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    width: 100%;
    max-width: 600px;
}

.terminal-modal {
    max-width: 800px;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 1.5rem;
}

.terminal-body {
    background: #05050a;
    padding: 1.5rem;
    min-height: 400px;
    max-height: 60vh;
    overflow-y: auto;
    position: relative;
}

.terminal-body pre {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: #e2e8f0;
    white-space: pre-wrap;
    line-height: 1.5;
}

.terminal-loader {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    color: #6366f1;
    font-weight: 600;
}

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.5rem; }
.form-input, .form-select {
    width: 100%;
    background: #161625;
    border: 1px solid #2d2d3f;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    color: #e2e8f0;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.code-font { font-family: 'Fira Code', monospace; font-size: 0.875rem; }

.btn-block { width: 100%; justify-content: center; }
.btn-icon-only { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.5rem; }
.btn-icon-only:hover { color: #e2e8f0; }
.delete:hover { color: #ef4444; }

.mini-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
.mini-spinner.sm { width: 16px; height: 16px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
