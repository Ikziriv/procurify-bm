import { db } from '../db';
import { notifications } from '../db/schema';
import { AblyService } from './ably-service';
import { randomUUID } from 'crypto';

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    referenceId?: string;
    referenceType?: 'PROCUREMENT' | 'SUBMISSION';
    actionUrl?: string;
    metadata?: any;
}

export class NotificationService {
    /**
     * Creates a notification in the database and publishes it to Ably for real-time delivery.
     */
    static async create(params: CreateNotificationParams) {
        const notificationId = crypto.randomUUID();
        const now = new Date();

        const newNotification = {
            id: notificationId,
            userId: params.userId,
            title: params.title,
            message: params.message,
            type: params.type || 'INFO',
            read: false,
            referenceId: params.referenceId,
            referenceType: params.referenceType,
            actionUrl: params.actionUrl,
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            createdAt: now
        };

        try {
            // 1. Persist to database
            await db.insert(notifications).values(newNotification);

            // 2. Publish to Ably for real-time delivery
            // We publish the object in the format the frontend expects
            await AblyService.publish(params.userId, {
                ...newNotification,
                createdAt: now.toISOString() // Ensure date is stringified for transport
            });

            return newNotification;
        } catch (error) {
            console.error('Failed to create notification:', error);
            throw error;
        }
    }

    /**
     * Utility to notify many users at once (e.g., when a new procurement is published).
     */
    static async notifyMany(userIds: string[], params: Omit<CreateNotificationParams, 'userId'>) {
        return Promise.all(userIds.map((userId) => this.create({ ...params, userId })));
    }
}
