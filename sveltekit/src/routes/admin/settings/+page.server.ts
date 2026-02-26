import { db } from '$lib/server/db';
import { systemConfigs } from '$lib/server/db/schema';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || (locals.user.role !== 'SUPER_ADMIN' && locals.user.role !== 'ADMIN_TBP')) {
        throw error(403, 'Unauthorized');
    }

    const config = await db.query.systemConfigs.findFirst({
        where: eq(systemConfigs.key, 'RESTRICT_INSTITUTIONS')
    });

    return {
        restrictInstitutions: config?.value === 'true'
    };
};

export const actions: Actions = {
    toggleRestriction: async ({ request, locals }) => {
        if (!locals.user || (locals.user.role !== 'SUPER_ADMIN' && locals.user.role !== 'ADMIN_TBP')) {
            return fail(403, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const enabled = formData.get('enabled') === 'true';

        await db
            .insert(systemConfigs)
            .values({
                key: 'RESTRICT_INSTITUTIONS',
                value: enabled ? 'true' : 'false',
                description: 'Enforce institution selection restrictions to PU and PKP only',
                updatedBy: locals.user.id,
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: systemConfigs.key,
                set: {
                    value: enabled ? 'true' : 'false',
                    updatedBy: locals.user.id,
                    updatedAt: new Date()
                }
            });

        return { success: true };
    }
};
