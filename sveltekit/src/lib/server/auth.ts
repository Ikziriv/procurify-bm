import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from '$env/dynamic/private';
import { ActivityService } from "./services/activity-service";

/**
 * Better Auth initialization.
 * This instance is configured to use the existing Neon database via Drizzle.
 * It's compatible with Neon Auth as they share the same underlying database schema.
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		}
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "USER_PROCUREMENT"
			}
		}
	},
	emailAndPassword: {
		enabled: true
	},
	plugins: [
		username()
	],
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await ActivityService.log({
						userId: user.id,
						action: 'AUTH_SIGN_UP',
						metadata: { email: user.email, name: user.name }
					});
				}
			}
		},
		session: {
			create: {
				after: async (session) => {
					await ActivityService.log({
						userId: session.userId,
						action: 'AUTH_SIGN_IN',
						ipAddress: session.ipAddress as string,
						userAgent: (session as any).user_agent as string,
						metadata: { sessionId: session.id }
					});
				}
			}
		}
	},
	onSessionDelete: async (session: any) => {
		await ActivityService.log({
			userId: session.userId,
			action: 'AUTH_SIGN_OUT',
			ipAddress: session.ipAddress as string,
			userAgent: (session as any).user_agent as string,
			metadata: { sessionId: session.id }
		});
	},
	// We can add more plugins here as the app grows
	secret: env.BETTER_AUTH_SECRET
});
