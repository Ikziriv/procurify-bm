import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, companyProfiles, submissions, sharedProfiles } from '$lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const requester = locals.user;
        const { vendorId } = params;

        if (!requester || !vendorId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Security logic:
        // 1. If requester is the vendor themselves, allow.
        // 2. If requester is ADMIN_PROCUREMENT or SUPER_ADMIN:
        //    a. Check if there's an explicit share in sharedProfiles.
        //    b. Check if the vendor has submitted to any procurement created by the requester.

        let isAuthorized = requester.id === vendorId || requester.role === 'SUPER_ADMIN';

        if (!isAuthorized && requester.role === 'ADMIN_PROCUREMENT') {
            // Check explicit shares
            const explicitShare = await db.query.sharedProfiles.findFirst({
                where: and(
                    eq(sharedProfiles.vendorId, vendorId),
                    eq(sharedProfiles.adminId, requester.id)
                )
            });

            if (explicitShare) {
                isAuthorized = true;
            } else {
                // Check implicit shares via submissions to requester's procurements
                const submissionToMyProcurement = await db.query.submissions.findFirst({
                    where: eq(submissions.userId, vendorId),
                    with: {
                        procurement: {
                            columns: { createdBy: true }
                        }
                    }
                });

                if (submissionToMyProcurement?.procurement?.createdBy === requester.id) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return json({ error: 'Forbidden. No shared access to this profile.' }, { status: 403 });
        }

        // Fetch profile
        const profile = await db.query.user.findFirst({
            where: eq(user.id, vendorId),
            with: {
                companyProfile: {
                    with: {
                        province: true,
                        regency: true
                    }
                },
                submissions: {
                    with: {
                        procurement: true
                    },
                    orderBy: (sub, { desc }) => [desc(sub.submittedAt)]
                }
            }
        });

        if (!profile) {
            return json({ error: 'Profile not found' }, { status: 404 });
        }

        return json({ profile });
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
};
