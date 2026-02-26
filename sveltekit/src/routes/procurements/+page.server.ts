import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { provinces, regencies } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        throw redirect(303, '/auth');
    }

    const [allProvinces, allRegencies, advancedConfig] = await Promise.all([
        locals.db.select().from(provinces).orderBy(provinces.name),
        locals.db.select().from(regencies).orderBy(regencies.name),
        locals.db.query.systemConfigs.findFirst({
            where: (configs, { eq }) => eq(configs.key, 'ENABLE_ADVANCED_DETAIL_DATA')
        })
    ]);

    return {
        provinces: allProvinces,
        regencies: allRegencies,
        enableAdvancedDetailData: advancedConfig?.value === 'true'
    };
};
