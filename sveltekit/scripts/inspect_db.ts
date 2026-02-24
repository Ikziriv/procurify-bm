import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log('--- Schemas ---');
        const schemas = await sql`SELECT schema_name FROM information_schema.schemata`;
        console.table(schemas);

        console.log('\n--- Constraints for notifications ---');
        const constraints = await sql`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND conname LIKE '%notifications%';
        `;
        console.table(constraints);

        console.log('\n--- Table Info for users ---');
        const tableInfo = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name = 'user' OR table_name = 'users'
        `;
        console.table(tableInfo);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
