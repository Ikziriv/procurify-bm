import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { user, companyProfiles, governmentProfiles, provinces, regencies } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    const sessionUser = locals.user;
    if (!sessionUser) {
        throw redirect(303, '/auth');
    }

    const dbUser = await locals.db.query.user.findFirst({
        where: eq(user.id, sessionUser.id),
        with: {
            companyProfile: true,
            governmentProfile: true
        }
    });

    if (!dbUser) {
        throw redirect(303, '/auth');
    }

    // Fetch location data for company profile
    const [allProvinces, allRegencies] = await Promise.all([
        locals.db.select().from(provinces).orderBy(provinces.name),
        locals.db.select().from(regencies).orderBy(regencies.name)
    ]);

    return {
        profile: dbUser,
        provinces: allProvinces,
        regencies: allRegencies
    };
};

export const actions: Actions = {
    update: async ({ request, locals }) => {
        const sessionUser = locals.user;
        if (!sessionUser) return fail(401);

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;

        try {
            // Update basic user info
            await locals.db.update(user)
                .set({ name, phone, updatedAt: new Date() })
                .where(eq(user.id, sessionUser.id));

            // Update role-specific profile
            if (sessionUser.role === 'ADMIN_PROCUREMENT' || sessionUser.role === 'SUPER_ADMIN') {
                const institutionName = formData.get('institutionName') as string;
                const department = formData.get('department') as string;
                const position = formData.get('position') as string;
                const nip = formData.get('nip') as string;

                await locals.db.insert(governmentProfiles)
                    .values({ userId: sessionUser.id, institutionName, department, position, nip })
                    .onConflictDoUpdate({
                        target: governmentProfiles.userId,
                        set: { institutionName, department, position, nip }
                    });
            } else {
                const companyName = formData.get('companyName') as string;
                const website = formData.get('website') as string;
                const description = formData.get('description') as string;
                const foundedYear = formData.get('foundedYear') as string;
                const employeeCount = formData.get('employeeCount') as string;
                const address = formData.get('address') as string;
                const nib = formData.get('nib') as string;
                const provinceId = formData.get('provinceId') as string;
                const regencyId = formData.get('regencyId') as string;

                await locals.db.insert(companyProfiles)
                    .values({
                        userId: sessionUser.id,
                        companyName,
                        website,
                        description,
                        foundedYear,
                        employeeCount,
                        address,
                        nib,
                        provinceId: provinceId || null,
                        regencyId: regencyId || null
                    })
                    .onConflictDoUpdate({
                        target: companyProfiles.userId,
                        set: {
                            companyName,
                            website,
                            description,
                            foundedYear,
                            employeeCount,
                            address,
                            nib,
                            provinceId: provinceId || null,
                            regencyId: regencyId || null
                        }
                    });
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return fail(500, { message: 'Failed to update profile' });
        }
    }
};
