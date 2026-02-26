import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { submissions, procurements, submissionItems } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { eq, desc } from 'drizzle-orm';
import { ActivityService } from '$lib/server/services/activity-service';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch submissions - limited to 100 for performance
        const items = await db.query.submissions.findMany({
            with: {
                procurement: {
                    columns: { id: true, title: true, status: true, createdBy: true }
                },
                user: {
                    columns: { id: true, name: true, email: true },
                    with: {
                        companyProfile: true
                    }
                }
            },
            orderBy: (sub, { desc }) => [desc(sub.submittedAt)],
            limit: 100
        });

        if (items.length === 0) {
            return json({ submissions: [] });
        }

        // Optimization: Batch fetch status history for all found submissions in one query
        const submissionIds = items.map(item => item.id);
        const allHistory = await db.query.statusHistory.findMany({
            where: (sh, { and, eq, inArray }) => and(
                eq(sh.entityType, 'SUBMISSION'),
                inArray(sh.entityId, submissionIds)
            ),
            with: {
                changedBy: {
                    columns: { name: true }
                }
            },
            orderBy: (sh, { desc }) => [desc(sh.createdAt)]
        });

        // Group history by entityId
        const historyMap = allHistory.reduce((acc, curr) => {
            if (!acc[curr.entityId]) acc[curr.entityId] = [];
            acc[curr.entityId].push(curr);
            return acc;
        }, {} as Record<string, any[]>);

        // Map history back to submissions
        const submissionsWithHistory = items.map(item => ({
            ...item,
            statusHistory: historyMap[item.id] || []
        }));

        // Due to drizzle-orm relational query limitations for filtering by joined table columns in findMany
        // we filter the results in memory. With a limit of 100, this is extremely fast.
        let filteredItems = submissionsWithHistory;
        if (user.role === 'USER_PROCUREMENT') {
            filteredItems = submissionsWithHistory.filter(sub => sub.procurement?.createdBy === user.id);
        }

        return json({ submissions: filteredItems });
    } catch (error) {
        console.error('API Error:', error);
        return json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const user = locals.user;
        if (!user || user.role !== 'USER_PROCUREMENT') {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.procurementId || !data.companyName || !data.companyDescription) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `SUB-${nanoid(8).toUpperCase()}`;

        await db.insert(submissions).values({
            id,
            procurementId: data.procurementId,
            userId: user.id,
            companyName: data.companyName,
            companyDescription: data.companyDescription,
        });

        if (data.items && data.items.length > 0) {
            const itemsData = data.items.map((item: any) => ({
                id: `SITM-${nanoid(8).toUpperCase()}`,
                submissionId: id,
                procurementItemId: item.procurementItemId,
                offeredPrice: item.offeredPrice,
                specification: item.specification || ''
            }));
            await db.insert(submissionItems).values(itemsData);
        }

        await ActivityService.logRequest(request, {
            userId: user.id,
            action: 'SUBMISSION_CREATE',
            entityType: 'SUBMISSION',
            entityId: id,
            metadata: { procurementId: data.procurementId, companyName: data.companyName }
        });

        return json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Failed to create submission:', error);
        return json({ error: 'Failed to create submission' }, { status: 500 });
    }
};
