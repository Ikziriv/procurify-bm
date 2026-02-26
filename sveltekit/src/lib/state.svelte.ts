import { authClient } from '$lib/auth-client';
import { translations } from '$lib/translations';
import { goto } from '$app/navigation';

export type Language = 'EN' | 'ID';

class AppState {
    language = $state<Language>('ID');
    currentUser = $state<any>(null); // To be populated after auth setup
    notifications = $state<any[]>([]);
    toasts = $state<any[]>([]);
    sidebarCollapsed = $state<boolean>(false);
    showNotifications = $state<boolean>(false);
    profileNotificationDismissed = $state<boolean>(false);
    isLive = $state<boolean>(false);

    t = $derived(translations[this.language]);

    addToast(title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO' = 'SUCCESS') {
        const id = crypto.randomUUID();
        this.toasts.push({ id, title, message, type });
        // Auto-remove after 5 seconds
        setTimeout(() => this.removeToast(id), 5000);
    }

    removeToast(id: string) {
        this.toasts = this.toasts.filter((t) => t.id !== id);
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        if (typeof window !== 'undefined') {
            localStorage.setItem('procurify_sidebar_collapsed', String(this.sidebarCollapsed));
        }
    }

    setLanguage(lang: Language) {
        this.language = lang;
        if (typeof window !== 'undefined') {
            localStorage.setItem('procurify_lang', lang);
        }
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    dismissProfileNotification() {
        this.profileNotificationDismissed = true;
        if (typeof window !== 'undefined') {
            localStorage.setItem('procurify_profile_notification_dismissed', 'true');
        }
    }

    init() {
        if (typeof window !== 'undefined') {
            const storedLang = localStorage.getItem('procurify_lang');
            if (storedLang) {
                this.language = storedLang as Language;
            }
            const storedSidebar = localStorage.getItem('procurify_sidebar_collapsed');
            if (storedSidebar !== null) {
                this.sidebarCollapsed = storedSidebar === 'true';
            }
            const storedDismissed = localStorage.getItem('procurify_profile_notification_dismissed');
            if (storedDismissed !== null) {
                this.profileNotificationDismissed = storedDismissed === 'true';
            }

            // Remove dummy notifications initialization
            // Real notifications will be fetched from API or pushed via Ably
        }
    }

    setUser(user: any) {
        this.currentUser = user;
        if (user && typeof window !== 'undefined') {
            import('$lib/state/notification-manager.svelte').then(({ notificationManager }) => {
                notificationManager.init(user.id);
            });
        }
    }

    addNotification(notification: any) {
        // Avoid duplicates if any
        if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications = [notification, ...this.notifications];
        }
    }

    async logout() {
        await authClient.signOut();
        this.setUser(null);
        goto('/auth');
    }

    markAsRead(id: string) {
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
            this.notifications[index] = { ...this.notifications[index], read: true };
        }
    }

    markAllAsRead() {
        this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    }
}

export const appState = new AppState();
