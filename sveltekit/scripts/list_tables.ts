import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        const result = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('Tables in database:');
        console.table(result);
    } catch (error) {
        console.error('Error fetching tables:', error);
    }
}

main();
