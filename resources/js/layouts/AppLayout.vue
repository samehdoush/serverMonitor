<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const currentRoute = computed(() => page.url);

const navItems = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Servers', href: '/servers', icon: 'servers' },
    { name: 'Recipes', href: '/recipes', icon: 'recipes' },
    { name: 'File Sync', href: '/file-sync', icon: 'sync', isBeta: true },
    { name: 'Backup', href: '/backup', icon: 'backup' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
];

const isActive = (href: string) => {
    if (href === '/') {
        return currentRoute.value === '/';
    }
    return currentRoute.value.startsWith(href);
};

const openExternalLink = (url: string) => {
    window.open(url, '_system');
};
</script>

<template>
    <div class="app-layout">
        <div class="layout-content">
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
                        <!-- Recipes Icon -->
                        <svg v-else-if="item.icon === 'recipes'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <!-- File Sync Icon -->
                        <svg v-else-if="item.icon === 'sync'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
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
                        <span v-if="item.isBeta" class="beta-badge">Beta</span>
                    </Link>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="main-content">
                <slot />
            </main>
        </div>

        <!-- Footer -->
        <footer class="app-footer">
            <div class="footer-content">
                <p>
                    Created with ❤️ by
                    <a @click.prevent="openExternalLink('https://3kode.com')" class="footer-link">3kode</a>
                    using
                    <a @click.prevent="openExternalLink('https://nativephp.com')" class="footer-link">NativePHP</a>
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
}

.layout-content {
    display: flex;
    flex: 1;
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

.beta-badge {
    background: #f59e0b;
    color: #000;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.15rem 0.3rem;
    border-radius: 0.2rem;
    text-transform: uppercase;
    margin-left: 0.5rem;
}

.app-footer {
    background: rgba(15, 15, 26, 0.9);
    border-top: 1px solid rgba(99, 102, 241, 0.1);
    padding: 1rem 2rem;
    text-align: center;
    backdrop-filter: blur(10px);
}

.footer-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
}

.footer-link {
    color: #a5b4fc;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
}

.footer-link:hover {
    color: #6366f1;
    text-decoration: underline;
}
</style>
