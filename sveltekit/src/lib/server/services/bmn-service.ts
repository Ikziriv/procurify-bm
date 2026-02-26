import { db } from '$lib/server/db';
import { bmn } from '$lib/server/db/schema';
import { ilike, or } from 'drizzle-orm';

export class BMNService {
    static async search(query: string, limit = 20) {
        if (query.length < 2) {
            return [];
        }

        return await db.query.bmn.findMany({
            where: or(
                ilike(bmn.name, `%${query}%`),
                ilike(bmn.id, `%${query}%`),
                ilike(bmn.kodefikasiBmn, `%${query}%`)
            ),
            limit
        });
    }

    static async getById(id: string) {
        return await db.query.bmn.findFirst({
            where: ilike(bmn.id, id)
        });
    }
}
