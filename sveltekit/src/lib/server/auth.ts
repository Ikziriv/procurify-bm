import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from '$env/dynamic/private';

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
	// We can add more plugins here as the app grows
	secret: env.BETTER_AUTH_SECRET
});
