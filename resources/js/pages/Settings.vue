<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

const props = defineProps<{
    settings: {
        start_on_boot: boolean;
        monitoring_interval: number;
    }
}>();

const form = useForm({
    start_on_boot: props.settings.start_on_boot,
    monitoring_interval: props.settings.monitoring_interval,
});

const submit = () => {
    form.post('/settings', {
        preserveScroll: true,
    });
};
</script>

<template>
    <AppLayout>
        <div class="settings-page">
            <header class="page-header">
                <h1>Settings</h1>
            </header>

            <form @submit.prevent="submit" class="settings-form">
                <div class="form-section">
                    <h2>Application Preferences</h2>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input
                                v-model="form.start_on_boot"
                                type="checkbox"
                                class="checkbox"
                            />
                            <div class="checkbox-text">
                                <span class="label-text">Start on Boot</span>
                                <span class="description">Automatically launch the application when Windows starts.</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="monitoring_interval">Monitoring Interval (Seconds)</label>
                        <select
                            id="monitoring_interval"
                            v-model.number="form.monitoring_interval"
                            class="form-select"
                        >
                            <option value="30">30 Seconds</option>
                            <option value="60">1 Minute</option>
                            <option value="300">5 Minutes</option>
                            <option value="600">10 Minutes</option>
                        </select>
                        <span class="description">How often to check server status and collect metrics.</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" :disabled="form.processing">
                        {{ form.processing ? 'Saving...' : 'Save Settings' }}
                    </button>

                    <div v-if="form.recentlySuccessful" class="success-message">
                        Settings saved successfully!
                    </div>
                </div>
            </form>
        </div>
    </AppLayout>
</template>

<style scoped>
.settings-page {
    max-width: 700px;
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

.settings-form {
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
    font-size: 1.125rem;
    font-weight: 600;
    color: #a5b4fc;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
}

.checkbox-group .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    cursor: pointer;
}

.checkbox {
    width: 20px;
    height: 20px;
    accent-color: #6366f1;
    margin-top: 2px;
}

.checkbox-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.label-text {
    font-weight: 500;
    color: #e2e8f0;
}

.description {
    font-size: 0.875rem;
    color: #94a3b8;
}

.form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(30, 30, 50, 0.5);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    transition: all 0.2s;
    cursor: pointer;
}

.form-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-select option {
    background: #1a1a2e;
    color: #e2e8f0;
}

.form-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
}

.btn {
    padding: 0.75rem 2rem;
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

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.success-message {
    color: #22c55e;
    font-size: 0.875rem;
    font-weight: 500;
    animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
}
</style>
