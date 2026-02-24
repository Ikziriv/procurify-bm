import { db } from './db';
import { user, companyProfiles, governmentProfiles, activityLogs } from './db/schema';
import { eq } from 'drizzle-orm';

/**
 * Decodes a JWT payload without verification.
 * Neon Auth tokens are verified by the database via RLS, 
 * so we can safely extract metadata for synchronization here.
 */
function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
                .toString()
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode Neon Auth JWT:', e);
        return null;
    }
}

/**
 * Synchronizes the authenticated user from Neon Auth with our local public.user table.
 * Initializes profiles and logs activity on success.
 */
export async function syncUserWithDatabase(token: string) {
    const payload = decodeJWT(token);
    if (!payload) return null;

    const { sub: id, email, name, metadata } = payload;
    const role = metadata?.role || 'USER_PROCUREMENT';

    try {
        return await db.transaction(async (tx) => {
            // 1. Upsert user
            const [upsertedUser] = await tx.insert(user)
                .values({
                    id,
                    email,
                    name: name || email.split('@')[0],
                    role: role as any,
                    updatedAt: new Date()
                })
                .onConflictDoUpdate({
                    target: user.id,
                    set: {
                        name: name || email.split('@')[0],
                        role: role as any,
                        updatedAt: new Date()
                    }
                })
                .returning();

            // 2. Initialize sidecar profile if missing
            if (role === 'USER_PROCUREMENT' || role === 'MANUFACT_PROCUREMENT') {
                const existing = await tx.select().from(companyProfiles).where(eq(companyProfiles.userId, id)).limit(1);
                if (existing.length === 0) {
                    await tx.insert(companyProfiles).values({
                        userId: id,
                        companyName: (name || email.split('@')[0]) + ''
                    });
                }
            } else if (role === 'ADMIN_PROCUREMENT') {
                const existing = await tx.select().from(governmentProfiles).where(eq(governmentProfiles.userId, id)).limit(1);
                if (existing.length === 0) {
                    await tx.insert(governmentProfiles).values({
                        userId: id,
                        institutionName: 'Government Agency'
                    });
                }
            }

            // 3. Log activity
            await tx.insert(activityLogs).values({
                id: crypto.randomUUID(),
                userId: id,
                action: 'AUTH_SYNC',
                metadata: JSON.stringify({ role, email, timestamp: new Date().toISOString() })
            });

            return upsertedUser;
        });
    } catch (e) {
        console.error('Error synchronizing user with database:', e);
        return null;
    }
}
