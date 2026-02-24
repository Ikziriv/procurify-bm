import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { procurements } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const items = await db.query.procurements.findMany({

            with: {
                user: {
                    columns: { id: true, name: true, role: true },
                    with: {
                        governmentProfile: true,
                        companyProfile: true
                    }
                },
                method: true,
                type: true,
                submissions: true
            },
            orderBy: (proc, { desc }) => [desc(proc.createdAt)]
        });

        return json({ procurements: items });
    } catch (error) {
        console.error('API Error:', error);
        return json({ error: 'Failed to fetch procurements' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const user = locals.user;
        if (!user || user.role !== 'USER_PROCUREMENT') {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // In a real application, implement strict validation (e.g. zod)
        const id = `PROC-${nanoid(8).toUpperCase()}`;

        await db.insert(procurements).values({
            id,
            title: data.title,
            description: data.description || '',
            budget: data.budget || 'Rp 0',
            deadline: data.deadline,
            status: 'OPEN',
            createdBy: user.id
            // Handle other relational data as needed (methodId, typeId)
        });

        return json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Failed to create procurement:', error);
        return json({ error: 'Failed to create procurement' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
    try {
        const user = locals.user;
        if (!user || user.role !== 'USER_PROCUREMENT') {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.id) {
            return json({ error: 'Missing procurement ID' }, { status: 400 });
        }

        // Optional: In a highly secure app, we'd also verify procurement ownership before update
        // e.g. await db.query.procurements.findFirst({ where: eq(procurements.id, data.id) }) 
        // For brevity and based on current schema constraints, proceeding to update.

        await db
            .update(procurements)
            .set({
                title: data.title,
                description: data.description || '',
                budget: data.budget || 'Rp 0',
                deadline: data.deadline,
                status: data.status || 'OPEN'
            })
            .where(
                and(eq(procurements.id, data.id), eq(procurements.createdBy, user.id))
            );

        return json({ success: true });
    } catch (error) {
        console.error('Failed to update procurement:', error);
        return json({ error: 'Failed to update procurement' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
    try {
        const user = locals.user;
        if (!user || user.role !== 'USER_PROCUREMENT') {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = url.searchParams.get('id');
        if (!id) {
            return json({ error: 'Missing procurement ID' }, { status: 400 });
        }

        // Delete procurement but only if owned by the current user
        await db
            .delete(procurements)
            .where(
                and(eq(procurements.id, id), eq(procurements.createdBy, user.id))
            );

        return json({ success: true });
    } catch (error) {
        console.error('Failed to delete procurement:', error);
        return json({ error: 'Failed to delete procurement' }, { status: 500 });
    }
};
