<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const currentRoute = computed(() => page.url);

const navItems = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Servers', href: '/servers', icon: 'servers' },
    { name: 'Backup', href: '/backup', icon: 'backup' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
];

const isActive = (href: string) => {
    if (href === '/') {
        return currentRoute.value === '/';
    }
    return currentRoute.value.startsWith(href);
};
</script>

<template>
    <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8" />
                        <path d="M12 17v4" />
                        <path d="M7 8h.01" />
                        <path d="M17 8h.01" />
                    </svg>
                    <span class="logo-text">Server Monitor</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <Link
                    v-for="item in navItems"
                    :key="item.name"
                    :href="item.href"
                    :class="['nav-item', { active: isActive(item.href) }]"
                >
                    <!-- Dashboard Icon -->
                    <svg v-if="item.icon === 'dashboard'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <!-- Servers Icon -->
                    <svg v-else-if="item.icon === 'servers'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" />
                        <circle cx="6" cy="6" r="1" fill="currentColor" />
                        <circle cx="6" cy="18" r="1" fill="currentColor" />
                    </svg>
                    <!-- Backup Icon -->
                    <svg v-else-if="item.icon === 'backup'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <!-- Settings Icon -->
                    <svg v-else-if="item.icon === 'settings'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    <span>{{ item.name }}</span>
                </Link>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <slot />
        </main>
    </div>
</template>

<style scoped>
.app-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
}

.sidebar {
    width: 240px;
    background: rgba(15, 15, 26, 0.95);
    border-right: 1px solid rgba(99, 102, 241, 0.1);
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-icon {
    width: 32px;
    height: 32px;
    color: #6366f1;
}

.logo-text {
    font-size: 1.125rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.sidebar-nav {
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;
}

.nav-item:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #e2e8f0;
}

.nav-item.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.nav-icon {
    width: 20px;
    height: 20px;
}

.main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    color: #e2e8f0;
}
</style>
