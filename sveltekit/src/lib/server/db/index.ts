import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

if (!env.DATABASE_URL) {
    const message = dev
        ? 'DATABASE_URL is not set. Check your .env file.'
        : 'DATABASE_URL is not set in production.';
    throw new Error(message);
}

/**
 * Creates a database client authorized for a specific user.
 * For Neon RLS, we pass the JWT as an authToken in the neon client configuration.
 */
export const createDb = (token?: string) => {
    const client = neon(env.DATABASE_URL, {
        authToken: token
    });

    return drizzle(client, {
        schema,
        logger: dev
    });
};

// Default unauthorized export for generic server-side usage
export const db = createDb();
