import type { PageServerLoad } from './$types';
import { procurements } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // Fetch public procurements from the database
    const publicProcurements = await locals.db.query.procurements.findMany({
        limit: 10,
        orderBy: [desc(procurements.createdAt)],
        with: {
            user: true
        }
    });

    return {
        procurements: publicProcurements
    };
};
