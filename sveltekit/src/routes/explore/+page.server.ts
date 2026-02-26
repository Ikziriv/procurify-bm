import type { PageServerLoad } from './$types';
import { procurements } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // Fetch feature flags
    const config = await locals.db.query.systemConfigs.findFirst({
        where: (cfg, { eq }) => eq(cfg.key, 'SHOW_EXPLORE_STATS')
    });

    // Fetch public procurements from the database
    const publicProcurements = await locals.db.query.procurements.findMany({
        limit: 10,
        orderBy: [desc(procurements.createdAt)],
        with: {
            user: true
        }
    });

    return {
        procurements: publicProcurements,
        showStats: config?.value === 'true'
    };
};
