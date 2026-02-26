import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { procurements } from '$lib/server/db/schema';
import { desc, eq, ilike, or, and, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const page = Number(url.searchParams.get('page')) || 1;
        const pageSize = Number(url.searchParams.get('pageSize')) || 10;
        const search = url.searchParams.get('search') || '';
        const category = url.searchParams.get('category');
        const location = url.searchParams.get('location');
        const budget = url.searchParams.get('budget'); // Format: "min-max"
        const offset = (page - 1) * pageSize;

        const whereClause = and(
            eq(procurements.status, 'OPEN'),
            search
                ? or(
                    ilike(procurements.title, `%${search}%`),
                    ilike(procurements.description, `%${search}%`)
                )
                : undefined,
            category ? eq(procurements.bmnId, category) : undefined,
            location ? ilike(procurements.location, `%${location}%`) : undefined,
            budget ? (() => {
                const [min, max] = budget.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    return and(
                        sql`CAST(${procurements.budget} AS NUMERIC) >= ${min}`,
                        sql`CAST(${procurements.budget} AS NUMERIC) <= ${max}`
                    );
                } else if (!isNaN(min)) {
                    return sql`CAST(${procurements.budget} AS NUMERIC) >= ${min}`;
                } else if (!isNaN(max)) {
                    return sql`CAST(${procurements.budget} AS NUMERIC) <= ${max}`;
                }
                return undefined;
            })() : undefined
        );

        const items = await db.query.procurements.findMany({
            where: whereClause,
            with: {
                method: true,
                type: true
            },
            orderBy: [desc(procurements.createdAt)],
            limit: pageSize,
            offset: offset
        });

        // Get total count for pagination mapping
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(procurements)
            .where(whereClause);

        const totalCount = countResult[0]?.count || 0;

        return json({
            items,
            totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize)
        });
    } catch (error) {
        console.error('Public API Error:', error);
        return json({ error: 'Failed to fetch public procurements' }, { status: 500 });
    }
};
