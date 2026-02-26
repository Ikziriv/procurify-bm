import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { procurements, procurementKblis, procurementKbkis } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { ActivityService } from '$lib/server/services/activity-service';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const whereClause = user.role === 'SUPER_ADMIN'
            ? undefined
            : eq(procurements.createdBy, user.id);

        const items = await db.query.procurements.findMany({
            where: whereClause,
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
                province: true,
                regency: true,
                submissions: true,
                kblis: { with: { kbli: true } },
                kbkis: { with: { kbki: true } }
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
        if (!user || !['ADMIN_PROCUREMENT', 'SUPER_ADMIN'].includes(user.role)) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // In a real application, implement strict validation (e.g. zod)
        const id = `PROC-${nanoid(8).toUpperCase()}`;

        await db.insert(procurements).values({
            id,
            title: data.title,
            description: data.description || '',
            budget: data.budget ? String(data.budget) : '0',
            currency: data.currency || 'IDR',
            location: data.location || '',
            bmnId: data.bmnId || null,
            basId: data.basId || null,
            createdAt: new Date(),
            deadline: data.deadline,
            status: 'OPEN',
            provinceId: data.provinceId || null,
            regencyId: data.regencyId || null,
            createdBy: user.id,
            updatedAt: new Date()
        });

        if (data.kbliId) {
            await db.insert(procurementKblis).values({
                procurementId: id,
                kbliId: data.kbliId
            });
        }

        if (data.kbkiId) {
            await db.insert(procurementKbkis).values({
                procurementId: id,
                kbkiId: data.kbkiId
            });
        }

        await ActivityService.logRequest(request, {
            userId: user.id,
            action: 'PROCUREMENT_CREATE',
            entityType: 'PROCUREMENT',
            entityId: id,
            metadata: { title: data.title }
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
        if (!user || !['USER_PROCUREMENT', 'ADMIN_PROCUREMENT', 'MANUFACT_PROCUREMENT', 'SUPER_ADMIN'].includes(user.role)) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const id = data.id;

        if (!id) {
            return json({ error: 'Missing procurement ID' }, { status: 400 });
        }

        await db.update(procurements)
            .set({
                title: data.title,
                description: data.description,
                budget: data.budget ? String(data.budget) : '0',
                currency: data.currency || 'IDR',
                location: data.location || '',
                deadline: data.deadline,
                provinceId: data.provinceId || null,
                regencyId: data.regencyId || null,
                bmnId: data.bmnId || null,
                basId: data.basId || null,
                status: data.status || 'OPEN',
                updatedAt: new Date()
            })
            .where(and(eq(procurements.id, id), eq(procurements.createdBy, user.id)));

        // Update KBLI
        await db.delete(procurementKblis).where(eq(procurementKblis.procurementId, id));
        if (data.kbliId) {
            await db.insert(procurementKblis).values({
                procurementId: id,
                kbliId: data.kbliId
            });
        }

        // Update KBKI
        await db.delete(procurementKbkis).where(eq(procurementKbkis.procurementId, id));
        if (data.kbkiId) {
            await db.insert(procurementKbkis).values({
                procurementId: id,
                kbkiId: data.kbkiId
            });
        }

        await ActivityService.logRequest(request, {
            userId: user.id,
            action: 'PROCUREMENT_UPDATE',
            entityType: 'PROCUREMENT',
            entityId: id,
            metadata: { title: data.title, status: data.status }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Failed to update procurement:', error);
        return json({ error: 'Failed to update procurement' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ url, locals, request }) => {
    try {
        const user = locals.user;
        if (!user || !['USER_PROCUREMENT', 'ADMIN_PROCUREMENT', 'MANUFACT_PROCUREMENT', 'SUPER_ADMIN'].includes(user.role)) {
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

        await ActivityService.logRequest(request, {
            userId: user.id,
            action: 'PROCUREMENT_DELETE',
            entityType: 'PROCUREMENT',
            entityId: id
        });

        return json({ success: true });
    } catch (error) {
        console.error('Failed to delete procurement:', error);
        return json({ error: 'Failed to delete procurement' }, { status: 500 });
    }
};
