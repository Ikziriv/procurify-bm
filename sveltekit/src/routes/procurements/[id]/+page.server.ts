import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { procurements, type ProcurementWithDetails, user, companyProfiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { id } = params;
    const sessionUser = locals.user;

    // Fetch the specific procurement with its items and creator
    const procurement = (await locals.db.query.procurements.findFirst({
        where: eq(procurements.id, id),
        with: {
            items: true,
            rules: true,
            province: true,
            regency: true,
            submissions: {
                with: {
                    items: true,
                    user: true
                }
            }
        }
    })) as ProcurementWithDetails;

    if (!procurement) {
        throw error(404, 'Procurement not found');
    }

    // Fetch the creator (administrator) with their government profile
    const creator = await locals.db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, procurement.createdBy),
        with: {
            governmentProfile: true
        }
    });

    // Fetch current user's profile for pre-filling if logged in
    let userProfile = null;
    let hasSharedProfile = false;

    if (sessionUser) {
        userProfile = await locals.db.query.user.findFirst({
            where: eq(user.id, sessionUser.id),
            with: {
                companyProfile: true
            }
        });

        // Check if the vendor has already shared their profile for this procurement
        if (sessionUser.role === 'USER_PROCUREMENT') {
            const sharedProfile = await locals.db.query.sharedProfiles.findFirst({
                where: (sp, { eq, and }) => and(
                    eq(sp.vendorId, sessionUser.id),
                    eq(sp.procurementId, procurement.id)
                )
            });
            hasSharedProfile = !!sharedProfile;
        }
    }

    return {
        procurement,
        creator,
        userProfile,
        hasSharedProfile
    };
};
