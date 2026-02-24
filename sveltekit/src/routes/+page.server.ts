import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { procurements } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const allProcurements = await db.query.procurements.findMany({
        with: {
            method: true,
            type: true,
            bas: true
        },
        orderBy: [desc(procurements.createdAt)],
        limit: 10
    });

    return {
        procurements: allProcurements
    };
};
