import 'dotenv/config'; // Universal hydration for Dev/Standalone
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Support for both SvelteKit and standalone Node
const DATABASE_URL = process.env.DATABASE_URL;
const isDev = process.env.NODE_ENV !== 'production';

if (!DATABASE_URL) {
    const message = isDev
        ? 'DATABASE_URL is not set. Check your .env file.'
        : 'DATABASE_URL is not set in production.';
    throw new Error(message);
}

/**
 * Creates a database client authorized for a specific user.
 * For Neon RLS, we pass the JWT as an authToken in the neon client configuration.
 */
export const createDb = (token?: string) => {
    const client = neon(DATABASE_URL, {
        authToken: token
    });

    return drizzle(client, {
        schema,
        logger: isDev
    });
};

// Default unauthorized export for generic server-side usage
export const db = createDb();
