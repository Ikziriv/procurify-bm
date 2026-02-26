import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { provinces, regencies } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        throw redirect(303, '/auth');
    }

    const [allProvinces, allRegencies] = await Promise.all([
        locals.db.select().from(provinces).orderBy(provinces.name),
        locals.db.select().from(regencies).orderBy(regencies.name)
    ]);

    return {
        provinces: allProvinces,
        regencies: allRegencies
    };
};
