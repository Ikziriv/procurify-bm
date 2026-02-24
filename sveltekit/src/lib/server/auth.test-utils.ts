import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./db/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

/**
 * Creates a fresh, in-memory SQLite database and a Better Auth instance
 * for isolated integration testing.
 */
export async function createTestAuth() {
    // 1. Setup in-memory SQLite with Drizzle
    const sqlite = new Database(":memory:");
    const db = drizzle(sqlite, { schema });

    // 2. Initialize Better Auth with SQLite adapter
    const auth = betterAuth({
        database: drizzleAdapter(db, {
            provider: "sqlite",
            schema: {
                user: schema.user,
                session: schema.session,
                account: schema.account,
                verification: schema.verification,
            }
        }),
        baseURL: "http://localhost:3000",
        emailAndPassword: {
            enabled: true
        },
        user: {
            additionalFields: {
                role: {
                    type: "string",
                    required: false,
                    defaultValue: "USER_PROCUREMENT"
                }
            }
        },
        plugins: [
            username()
        ],
        secret: 'test-secret-12345678901234567890123456789012'
    });

    // 4. Initialize the schema
    // Manually create tables for SQLite in-memory testing
    // Note: Column names MUST match the "dbName" mapping in Drizzle (schema.ts)
    const tables = [
        `CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            username TEXT UNIQUE,
            display_username TEXT,
            email_verified INTEGER NOT NULL DEFAULT 0,
            avatar TEXT,
            image TEXT,
            phone TEXT,
            last_active_at INTEGER,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            role TEXT DEFAULT 'USER_PROCUREMENT'
        )`,
        `CREATE TABLE session (
            id TEXT PRIMARY KEY,
            expires_at INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            user_id TEXT NOT NULL REFERENCES users(id)
        )`,
        `CREATE TABLE account (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            user_id TEXT NOT NULL REFERENCES users(id),
            access_token TEXT,
            refresh_token TEXT,
            id_token TEXT,
            access_token_expires_at INTEGER,
            refresh_token_expires_at INTEGER,
            scope TEXT,
            password TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )`,
        `CREATE TABLE verification (
            id TEXT PRIMARY KEY,
            identifier TEXT NOT NULL,
            value TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER,
            updated_at INTEGER
        )`
    ];

    // Diagnostic Proxy for better-sqlite3
    const originalPrepare = sqlite.prepare.bind(sqlite);
    sqlite.prepare = ((sql: string) => {
        const stmt = originalPrepare(sql);
        const originalRun = stmt.run.bind(stmt);
        const originalAll = stmt.all.bind(stmt);
        const originalGet = stmt.get.bind(stmt);

        const convertArgs = (args: any[]) => args.map(arg => {
            if (typeof arg === 'boolean') return arg ? 1 : 0;
            if (arg instanceof Date) return arg.getTime();
            if (typeof arg === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(arg)) {
                const date = new Date(arg);
                if (!isNaN(date.getTime())) return date.getTime();
            }
            return arg;
        });

        stmt.run = (...args: any[]) => {
            const mappedArgs = convertArgs(args);
            try {
                return originalRun(...mappedArgs);
            } catch (e) {
                throw e;
            }
        };
        stmt.all = (...args: any[]) => {
            const mappedArgs = convertArgs(args);
            try {
                return originalAll(...mappedArgs);
            } catch (e) {
                throw e;
            }
        };
        stmt.get = (...args: any[]) => {
            const mappedArgs = convertArgs(args);
            try {
                return originalGet(...mappedArgs);
            } catch (e) {
                throw e;
            }
        };
        return stmt;
    }) as any;

    for (const table of tables) {
        try {
            sqlite.prepare(table).run();
        } catch (e) {
            console.error(`Failed to create table: ${table}`, e);
            throw e;
        }
    }
    // Note: In a real world scenario, you'd use migrate(db, { migrationsFolder: '...' })
    // For in-memory testing with Drizzle, we sometimes need to manually execute CREATE statements
    // or use a helper that generates them from the schema.
    // However, Better Auth can generate the schema for us.

    return { auth, db, sqlite };
}
