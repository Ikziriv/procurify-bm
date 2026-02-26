import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { procurements, submissions } from '$lib/server/db/schema';
import { desc, count, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    // Fetch Stats
    // 1. Active Tenders (Open)
    const [activeTenders] = await db
        .select({ value: count() })
        .from(procurements)
        .where(eq(procurements.status, 'OPEN'));

    // 2. Total Submissions (If admin, see all. If vendor, see own)
    const submissionQuery = db.select({ value: count() }).from(submissions);
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_PROCUREMENT') {
        submissionQuery.where(eq(submissions.userId, user.id));
    }
    const [totalSubmissions] = await submissionQuery;

    // 3. Completed (Closed procurements)
    const [completedProcurements] = await db
        .select({ value: count() })
        .from(procurements)
        .where(eq(procurements.status, 'CLOSED'));

    // Fetch Recent Procurements (Latest 3)
    const recentItems = await db.query.procurements.findMany({
        limit: 3,
        orderBy: [desc(procurements.createdAt)],
        with: {
            type: true
        }
    });

    return {
        stats: {
            activeTenders: activeTenders.value,
            totalSubmissions: totalSubmissions.value,
            completed: completedProcurements.value
        },
        recentProcurements: recentItems
    };
};
