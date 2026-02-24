
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = 'src/lib/data/old/kemen_pu';
const OUTPUT_FILE = 'src/lib/data/legacy_users.json';
const ABS_DATA_DIR = path.resolve(process.cwd(), DATA_DIR);
const ABS_OUTPUT_FILE = path.resolve(process.cwd(), OUTPUT_FILE);

interface LegacyUser {
    username: string; // Kode
    name: string; // Satuan Kerja
    displayUsername: string; // Satuan Kerja
    email: string; // Generated
    role: 'USER_PROCUREMENT';
    password: string;
    direktorat: string; // Kept for reference/profile if needed later
}

function convertLegacyUsers() {
    console.log(`\n🚀 Starting Legacy User Conversion...`);

    if (!fs.existsSync(ABS_DATA_DIR)) {
        console.error(`❌ Directory not found: ${ABS_DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(ABS_DATA_DIR).filter(file => file.endsWith('.xlsx'));

    if (files.length === 0) {
        console.log('⚠️ No .xlsx files found.');
        return;
    }

    const allUsers: LegacyUser[] = [];
    const seenUsernames = new Set<string>();

    files.forEach(file => {
        console.log(`Processing: ${file}`);
        const filePath = path.join(ABS_DATA_DIR, file);

        try {
            const workbook = readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Expected headers: No, Kode, Direktorat, Satuan Kerja
            // We'll trust the structure based on inspection, but use header row 1 (0-indexed logic in sheet_to_json if not specified, but here manual inspection showed row 1 is header)

            const rawData = utils.sheet_to_json<any>(worksheet);

            rawData.forEach((row: any) => {
                // Ensure we have the necessary fields
                if (row['Kode'] && row['Satuan Kerja']) {
                    const username = String(row['Kode']).trim();

                    // Avoid duplicates if any
                    if (seenUsernames.has(username)) {
                        console.warn(`Duplicate username found: ${username} in ${file}. Skipping.`);
                        return;
                    }
                    seenUsernames.add(username);

                    const name = String(row['Satuan Kerja']).trim();
                    const direktorat = row['Direktorat'] ? String(row['Direktorat']).trim() : 'UNKNOWN';

                    const user: LegacyUser = {
                        username: username,
                        name: name,
                        displayUsername: name,
                        email: `satker-${username}@kemenpu.go.id`.toLowerCase(),
                        role: 'USER_PROCUREMENT',
                        password: 'password123',
                        direktorat: direktorat
                    };

                    allUsers.push(user);
                }
            });

        } catch (error) {
            console.error(`Error reading ${file}:`, error);
        }
    });

    console.log(`\n✅ Conversion complete. Found ${allUsers.length} unique users.`);

    fs.writeFileSync(ABS_OUTPUT_FILE, JSON.stringify(allUsers, null, 2));
    console.log(`💾 Data saved to: ${ABS_OUTPUT_FILE}`);
}

convertLegacyUsers();
