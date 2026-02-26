import Ably from 'ably';
import { appState } from '$lib/state.svelte';

export class NotificationManager {
    private realtime: Ably.Realtime | null = null;
    private channel: Ably.RealtimeChannel | null = null;
    status = $state<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');

    constructor() {
        // We don't initialize in constructor because we need the appState.currentUser
    }

    async init(userId: string) {
        if (this.realtime) return;

        this.status = 'CONNECTING';

        try {
            // 1. Fetch historical notifications first
            await this.fetchNotifications();

            // 2. Initialize Ably with the Auth endpoint
            this.realtime = new Ably.Realtime({
                authUrl: '/api/ably/auth',
                clientId: userId
            });

            this.realtime.connection.on('connected', () => {
                this.status = 'CONNECTED';
                appState.isLive = true;
                console.log('Ably connected');
            });

            this.realtime.connection.on('disconnected', () => {
                this.status = 'DISCONNECTED';
                appState.isLive = false;
            });

            // Subscribe to user's private channel
            this.channel = this.realtime.channels.get(`notifications:user:${userId}`);

            await this.channel.subscribe('update', (message) => {
                const notification = message.data;
                // Convert ISO string back to Date object
                if (notification.createdAt) {
                    notification.createdAt = new Date(notification.createdAt);
                }

                appState.addNotification(notification);

                // Also show a toast for immediate feedback
                appState.addToast(notification.title, notification.message, notification.type || 'INFO');
            });

        } catch (error) {
            this.status = 'DISCONNECTED';
            console.error('Ably initialization failed:', error);
        }
    }

    async fetchNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                appState.notifications = data.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.createdAt)
                }));
            }
        } catch (error) {
            console.error('Failed to fetch initial notifications:', error);
        }
    }

    async markAsRead(id: string) {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                body: JSON.stringify({ id })
            });
            if (response.ok) {
                appState.markAsRead(id);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                body: JSON.stringify({ readAll: true })
            });
            if (response.ok) {
                appState.markAllAsRead();
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }

    destroy() {
        if (this.realtime) {
            this.realtime.close();
            this.realtime = null;
            this.channel = null;
            this.status = 'DISCONNECTED';
        }
    }
}

export const notificationManager = new NotificationManager();
