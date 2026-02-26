import { db } from '$lib/server/db';
import { kbli, kbki, bas } from '$lib/server/db/schema';
import { ilike, or } from 'drizzle-orm';

export class MasterDataService {
    static async searchKbli(query: string, limit = 20) {
        if (query.length < 2) return [];
        return await db.query.kbli.findMany({
            where: or(
                ilike(kbli.name, `%${query}%`),
                ilike(kbli.id, `%${query}%`)
            ),
            limit
        });
    }

    static async searchKbki(query: string, limit = 20) {
        if (query.length < 2) return [];
        return await db.query.kbki.findMany({
            where: or(
                ilike(kbki.name, `%${query}%`),
                ilike(kbki.id, `%${query}%`)
            ),
            limit
        });
    }

    static async searchBas(query: string, limit = 20) {
        if (query.length < 2) return [];
        return await db.query.bas.findMany({
            where: or(
                ilike(bas.name, `%${query}%`),
                ilike(bas.id, `%${query}%`)
            ),
            limit
        });
    }

    static async getKbliById(id: string) {
        return await db.query.kbli.findFirst({ where: ilike(kbli.id, id) });
    }

    static async getKbkiById(id: string) {
        return await db.query.kbki.findFirst({ where: ilike(kbki.id, id) });
    }

    static async getBasById(id: string) {
        return await db.query.bas.findFirst({ where: ilike(bas.id, id) });
    }
}
