import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        return json(userNotifications);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};

/**
 * Marks a notification as read.
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { id, readAll } = await request.json();

    try {
        if (readAll) {
            await db
                .update(notifications)
                .set({ read: true })
                .where(eq(notifications.userId, user.id));
        } else if (id) {
            await db
                .update(notifications)
                .set({ read: true })
                .where(eq(notifications.id, id));
        }

        return json({ success: true });
    } catch (error) {
        console.error('Failed to update notification:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
