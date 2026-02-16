<script setup lang="ts">
import { useForm, Link, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { ref } from 'vue';

interface Server {
    id?: number;
    name: string;
    ip: string;
    username: string;
    port: number;
    auth_type: 'key' | 'password';
    password?: string;
    ssh_key_path: string;
    key_password: string;
    db_username?: string;
    db_password?: string;
    cpu_threshold: number;
    ram_threshold: number;
    disk_threshold: number;
    is_active?: boolean;
}

const props = defineProps<{
    server: Server | null;
}>();

const isEditing = !!props.server?.id;

const form = useForm({
    name: props.server?.name ?? '',
    ip: props.server?.ip ?? '',
    username: props.server?.username ?? 'root',
    port: props.server?.port ?? 22,
    auth_type: props.server?.auth_type ?? 'key',
    password: '',
    ssh_key_path: props.server?.ssh_key_path ?? '',
    key_password: '',
    db_username: props.server?.db_username ?? '',
    db_password: '',
    cpu_threshold: props.server?.cpu_threshold ?? 80,
    ram_threshold: props.server?.ram_threshold ?? 80,
    disk_threshold: props.server?.disk_threshold ?? 80,
    is_active: props.server?.is_active ?? true,
});

const testingConnection = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

const selectSshKey = async () => {
    try {
        const response = await fetch('/select-ssh-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
        });
        const data = await response.json();
        if (data.path) {
            form.ssh_key_path = data.path;
        }
    } catch (error) {
        console.error('Error selecting SSH key:', error);
    }
};

const testConnection = async () => {
    testingConnection.value = true;
    testResult.value = null;

    try {
        const response = await fetch('/servers/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({
                ip: form.ip,
                username: form.username,
                port: form.port,
                auth_type: form.auth_type,
                password: form.password,
                ssh_key_path: form.ssh_key_path,
                key_password: form.key_password,
            }),
        });
        testResult.value = await response.json();
    } catch (error) {
        testResult.value = { success: false, message: 'Connection test failed' };
    } finally {
        testingConnection.value = false;
    }
};

const submit = () => {
    if (isEditing && props.server?.id) {
        form.put(`/servers/${props.server.id}`);
    } else {
        form.post('/servers');
    }
};
</script>

<template>
    <AppLayout>
        <div class="form-page">
            <header class="page-header">
                <Link href="/servers" class="back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    Back to Servers
                </Link>
                <h1>{{ isEditing ? 'Edit Server' : 'Add Server' }}</h1>
            </header>

            <form @submit.prevent="submit" class="server-form">
                <div class="form-section">
                    <h2>Server Information</h2>

                    <div class="form-group">
                        <label for="name">Server Name</label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            placeholder="My Server"
                            class="form-input"
                            :class="{ error: form.errors.name }"
                        />
                        <span v-if="form.errors.name" class="error-message">{{ form.errors.name }}</span>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ip">IP Address</label>
                            <input
                                id="ip"
                                v-model="form.ip"
                                type="text"
                                placeholder="192.168.1.1"
                                class="form-input"
                                :class="{ error: form.errors.ip }"
                            />
                            <span v-if="form.errors.ip" class="error-message">{{ form.errors.ip }}</span>
                        </div>

                        <div class="form-group">
                            <label for="port">SSH Port</label>
                            <input
                                id="port"
                                v-model.number="form.port"
                                type="number"
                                min="1"
                                max="65535"
                                class="form-input"
                                :class="{ error: form.errors.port }"
                            />
                            <span v-if="form.errors.port" class="error-message">{{ form.errors.port }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="username">Username</label>
                        <input
                            id="username"
                            v-model="form.username"
                            type="text"
                            placeholder="root"
                            class="form-input"
                            :class="{ error: form.errors.username }"
                        />
                        <span v-if="form.errors.username" class="error-message">{{ form.errors.username }}</span>
                    </div>
                </div>

                <div class="form-section">
                    <h2>Authentication</h2>

                    <div class="form-group">
                        <label>Authentication Method</label>
                        <div class="auth-type-selector">
                            <label class="radio-label">
                                <input type="radio" v-model="form.auth_type" value="key" name="auth_type">
                                <span>SSH Key</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" v-model="form.auth_type" value="password" name="auth_type">
                                <span>Password</span>
                            </label>
                        </div>
                    </div>

                    <div v-if="form.auth_type === 'key'" class="auth-fields-group">
                        <div class="form-group">
                            <label for="ssh_key_path">SSH Key File</label>
                            <div class="file-input-wrapper">
                                <input
                                    id="ssh_key_path"
                                    v-model="form.ssh_key_path"
                                    type="text"
                                    placeholder="C:\Users\...\.ssh\id_rsa"
                                    class="form-input"
                                    :class="{ error: form.errors.ssh_key_path }"
                                    readonly
                                />
                                <button type="button" class="btn btn-secondary" @click="selectSshKey">
                                    Browse...
                                </button>
                            </div>
                            <span v-if="form.errors.ssh_key_path" class="error-message">{{ form.errors.ssh_key_path }}</span>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="key_password">Key Passphrase</label>
                                <input
                                    id="key_password"
                                    v-model="form.key_password"
                                    type="password"
                                    placeholder="Empty if no passphrase"
                                    class="form-input"
                                />
                            </div>
                            <div class="form-group">
                                <label for="sudo_password">Sudo Password (Optional)</label>
                                <input
                                    id="sudo_password"
                                    v-model="form.password"
                                    type="password"
                                    placeholder="For sudo commands"
                                    class="form-input"
                                />
                            </div>
                        </div>
                        <p class="help-text">Adding a sudo password allows executing commands that require elevated permissions without manual interaction.</p>
                    </div>

                    <div v-if="form.auth_type === 'password'" class="auth-fields-group">
                        <div class="form-group">
                            <label for="password">SSH Password</label>
                            <input
                                id="password"
                                v-model="form.password"
                                type="password"
                                placeholder="Enter SSH password"
                                class="form-input"
                                :class="{ error: form.errors.password }"
                            />
                            <span v-if="form.errors.password" class="error-message">{{ form.errors.password }}</span>
                        </div>
                    </div>

                    <div class="form-section-inner">
                        <h3>Database Credentials (Optional)</h3>
                        <p class="help-text-sm">Providing these allows managing MySQL. If empty, we'll try 'sudo' bypass.</p>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="db_username">DB Username</label>
                                <input
                                    id="db_username"
                                    v-model="form.db_username"
                                    type="text"
                                    placeholder="forge"
                                    class="form-input"
                                />
                            </div>
                            <div class="form-group">
                                <label for="db_password">DB Password</label>
                                <input
                                    id="db_password"
                                    v-model="form.db_password"
                                    type="password"
                                    placeholder="MySQL Password"
                                    class="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Test Connection -->
                    <div class="test-connection">
                        <button
                            type="button"
                            class="btn btn-outline"
                            :disabled="testingConnection || !form.ip || (form.auth_type === 'key' && !form.ssh_key_path) || (form.auth_type === 'password' && !form.password)"
                            @click="testConnection"
                        >
                            <svg v-if="testingConnection" class="btn-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {{ testingConnection ? 'Testing...' : 'Test Connection' }}
                        </button>

                        <div v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
                            <svg v-if="testResult.success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {{ testResult.message }}
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h2>Alert Thresholds</h2>

                    <div class="form-row thirds">
                        <div class="form-group">
                            <label for="cpu_threshold">CPU Alert (%)</label>
                            <input
                                id="cpu_threshold"
                                v-model.number="form.cpu_threshold"
                                type="number"
                                min="1"
                                max="100"
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label for="ram_threshold">RAM Alert (%)</label>
                            <input
                                id="ram_threshold"
                                v-model.number="form.ram_threshold"
                                type="number"
                                min="1"
                                max="100"
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label for="disk_threshold">Disk Alert (%)</label>
                            <input
                                id="disk_threshold"
                                v-model.number="form.disk_threshold"
                                type="number"
                                min="1"
                                max="100"
                                class="form-input"
                            />
                        </div>
                    </div>
                </div>

                <div v-if="isEditing" class="form-section">
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input
                                v-model="form.is_active"
                                type="checkbox"
                                class="checkbox"
                            />
                            <span>Active (include in monitoring)</span>
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <Link href="/servers" class="btn btn-secondary">Cancel</Link>
                    <button type="submit" class="btn btn-primary" :disabled="form.processing">
                        {{ form.processing ? 'Saving...' : (isEditing ? 'Update Server' : 'Add Server') }}
                    </button>
                </div>
            </form>
        </div>
    </AppLayout>
</template>

<style scoped>
.form-page {
    max-width: 700px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    transition: color 0.2s;
}

.back-link:hover {
    color: #a5b4fc;
}

.back-link svg {
    width: 16px;
    height: 16px;
}

.page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
}

.server-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-section {
    background: rgba(15, 15, 26, 0.8);
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
}

.form-section h2 {
    font-size: 1rem;
    font-weight: 600;
    color: #a5b4fc;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 0.5rem;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(30, 30, 50, 0.5);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.error {
    border-color: #ef4444;
}

.form-input::placeholder {
    color: #64748b;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-row.thirds {
    grid-template-columns: repeat(3, 1fr);
}

.error-message {
    display: block;
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
}

.file-input-wrapper {
    display: flex;
    gap: 0.5rem;
}

.file-input-wrapper .form-input {
    flex: 1;
}

.test-connection {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.test-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
}

.test-result svg {
    width: 18px;
    height: 18px;
}

.test-result.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.test-result.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.checkbox-group {
    margin: 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
}

.checkbox {
    width: 18px;
    height: 18px;
    accent-color: #6366f1;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
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

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
    background: rgba(99, 102, 241, 0.2);
}

.btn-outline {
    background: transparent;
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-outline:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.1);
}

.btn-outline:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.auth-type-selector {
    display: flex;
    gap: 2rem;
    margin-bottom: 0.5rem;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #e2e8f0;
    font-size: 0.875rem;
}

.auth-fields-group {
    border-top: 1px solid rgba(99, 102, 241, 0.1);
    padding-top: 1.5rem;
    margin-top: 1rem;
}

.form-section-inner {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.form-section-inner h3 {
    font-size: 0.875rem;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
}

.help-text-sm {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 1rem;
}
</style>
