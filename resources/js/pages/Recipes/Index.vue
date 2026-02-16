<script setup lang="ts">
import { ref } from 'vue';
import { useForm, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';

interface Recipe {
    id: number;
    name: string;
    description: string | null;
    command: string;
    category: string;
}

const props = defineProps<{
    recipes: Recipe[];
}>();

const showModal = ref(false);
const editingRecipe = ref<Recipe | null>(null);

const form = useForm({
    name: '',
    description: '',
    command: '',
    category: 'General',
});

const openCreateModal = () => {
    editingRecipe.value = null;
    form.reset();
    showModal.value = true;
};

const openEditModal = (recipe: Recipe) => {
    editingRecipe.value = recipe;
    form.name = recipe.name;
    form.description = recipe.description || '';
    form.command = recipe.command;
    form.category = recipe.category;
    showModal.value = true;
};

const submit = () => {
    if (editingRecipe.value) {
        form.put(`/recipes/${editingRecipe.value.id}`, {
            onSuccess: () => {
                showModal.value = false;
                form.reset();
            },
        });
    } else {
        form.post('/recipes', {
            onSuccess: () => {
                showModal.value = false;
                form.reset();
            },
        });
    }
};

const deleteRecipe = (recipe: Recipe) => {
    if (confirm(`Are you sure you want to delete snippet "${recipe.name}"?`)) {
        router.delete(`/recipes/${recipe.id}`);
    }
};

const categories = ['General', 'System', 'Docker', 'Laravel', 'Database', 'Security'];
</script>

<template>
    <AppLayout>
        <div class="recipes-page">
            <header class="page-header">
                <div class="header-content">
                    <h1>Script Library</h1>
                    <p class="text-slate-400">Save and organize frequently used commands and snippets.</p>
                </div>
                <button class="btn btn-primary" @click="openCreateModal">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Snippet
                </button>
            </header>

            <div v-if="recipes.length === 0" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <h2>Library is Empty</h2>
                <p>Create your first command snippet to start building your library.</p>
                <button class="btn btn-primary mt-4" @click="openCreateModal">Create Snippet</button>
            </div>

            <div v-else class="recipes-table-container">
                <table class="recipes-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Command</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="recipe in recipes" :key="recipe.id">
                            <td class="name-cell">
                                <div class="recipe-info">
                                    <span class="recipe-name">{{ recipe.name }}</span>
                                    <span class="recipe-desc" v-if="recipe.description">{{ recipe.description }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="category-badge">{{ recipe.category }}</span>
                            </td>
                            <td class="command-cell">
                                <code>{{ recipe.command }}</code>
                            </td>
                            <td class="actions-cell">
                                <button @click="openEditModal(recipe)" class="action-btn edit" title="Edit">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button @click="deleteRecipe(recipe)" class="action-btn delete" title="Delete">
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

            <!-- Create/Edit Modal -->
            <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>{{ editingRecipe ? 'Edit Snippet' : 'New Snippet' }}</h3>
                        <button class="close-btn" @click="showModal = false">&times;</button>
                    </div>
                    <form @submit.prevent="submit">
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Name</label>
                                <input v-model="form.name" type="text" placeholder="e.g. Update System" class="form-input" required>
                                <span v-if="form.errors.name" class="error">{{ form.errors.name }}</span>
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <div class="category-selector">
                                    <select v-model="form.category" class="form-select">
                                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                                    </select>
                                    <input v-if="!categories.includes(form.category)" v-model="form.category" type="text" class="form-input mt-2" placeholder="Custom category...">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description (Optional)</label>
                                <textarea v-model="form.description" placeholder="What does this snippet do?" class="form-textarea" rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Command</label>
                                <textarea v-model="form.command" placeholder="sudo apt update && sudo apt upgrade -y" class="form-textarea code-font" rows="4" required></textarea>
                                <p class="help-text">You can use multi-line commands. They will be executed as a single batch.</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
                            <button type="submit" class="btn btn-primary" :disabled="form.processing">
                                {{ editingRecipe ? 'Save Changes' : 'Create Snippet' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.recipes-page {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 0.25rem;
}

.recipes-table-container {
    background: rgba(15, 15, 26, 0.8);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.recipes-table {
    width: 100%;
    border-collapse: collapse;
}

.recipes-table th {
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

.recipes-table td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.05);
}

.name-cell {
    min-width: 200px;
}

.recipe-info {
    display: flex;
    flex-direction: column;
}

.recipe-name {
    color: #e2e8f0;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.recipe-desc {
    font-size: 0.8125rem;
    color: #64748b;
}

.category-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.command-cell {
    max-width: 400px;
}

.command-cell code {
    display: block;
    background: #0d0d17;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.8125rem;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.05);
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
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn svg {
    width: 16px;
    height: 16px;
}

.action-btn.edit {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
}

.action-btn.edit:hover {
    background: rgba(99, 102, 241, 0.2);
}

.action-btn.delete {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.action-btn.delete:hover {
    background: rgba(239, 68, 68, 0.2);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5rem 2rem;
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
    margin-bottom: 1.5rem;
}

.empty-state h2 {
    color: #e2e8f0;
    margin-bottom: 0.5rem;
}

/* Form Styles */
.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
    width: 100%;
    background: #0f0f1a;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 0.5rem;
    padding: 0.625rem 0.875rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.code-font {
    font-family: 'Fira Code', monospace;
}

.help-text {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.375rem;
}

.error {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
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

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
}

.btn-secondary {
    background: rgba(30, 41, 59, 0.5);
    color: #e2e8f0;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(30, 41, 59, 0.8);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    background: #1a1a2e;
    width: 100%;
    max-width: 600px;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e2e8f0;
}

.close-btn {
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1.25rem 1.5rem;
    background: rgba(15, 15, 26, 0.5);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>
