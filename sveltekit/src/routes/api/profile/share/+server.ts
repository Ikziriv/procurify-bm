import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sharedProfiles } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const user = locals.user;
        if (!user || user.role !== 'USER_PROCUREMENT') {
            return json({ error: 'Unauthorized. Only vendors can share profiles.' }, { status: 401 });
        }

        const { adminId, procurementId } = await request.json();

        if (!adminId) {
            return json({ error: 'Missing adminId' }, { status: 400 });
        }

        const id = `SHARE-${nanoid(8).toUpperCase()}`;

        await db.insert(sharedProfiles).values({
            id,
            vendorId: user.id,
            adminId,
            procurementId: procurementId || null,
        });

        return json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Failed to share profile:', error);
        return json({ error: 'Failed to share profile' }, { status: 500 });
    }
};
