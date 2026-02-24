import fs from 'fs';
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import path from 'path';

const DATA_DIR = 'src/lib/data';
const OLD_DATA_DIR = path.join(DATA_DIR, 'old');

interface KBLIEntry {
    id: string;
    name: string;
    level: number;
    parentId: string | null;
}

interface KBKIEntry {
    id: string;
    name: string;
    level: number;
    parentId: string | null;
}

interface KBKIMapping {
    kbkiId: string;
    kbliId: string;
}

function readCSV(filename: string) {
    const filePath = path.join(OLD_DATA_DIR, filename);
    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // use raw: false to get formatted strings from the cell
    return utils.sheet_to_json(worksheet, { raw: false });
}

async function convert() {
    console.log('Converting KBLI...');
    const rawKbli: any[] = readCSV('kamus_kbli.csv');
    const kbliMap = new Map<string, KBLIEntry>();

    for (const row of rawKbli) {
        // Level 1: Kategori
        if (row.kategori && !kbliMap.has(row.kategori)) {
            kbliMap.set(row.kategori, {
                id: row.kategori,
                name: row.judul_kategori,
                level: 1,
                parentId: null
            });
        }

        // Level 2: Golongan Pokok
        if (row.golongan_pokok && !kbliMap.has(row.golongan_pokok)) {
            kbliMap.set(row.golongan_pokok, {
                id: row.golongan_pokok,
                name: row.judul_golongan_pokok,
                level: 2,
                parentId: row.kategori
            });
        }

        // Level 3: Golongan
        if (row.golongan && !kbliMap.has(row.golongan)) {
            kbliMap.set(row.golongan, {
                id: row.golongan,
                name: row.judul_golongan,
                level: 3,
                parentId: row.golongan_pokok
            });
        }

        // Level 4: Subgolongan
        if (row.subgolongan && !kbliMap.has(row.subgolongan)) {
            kbliMap.set(row.subgolongan, {
                id: row.subgolongan,
                name: row.judul_subgolongan,
                level: 4,
                parentId: row.golongan
            });
        }

        // Level 5: Kelompok
        if (row.kelompok && !kbliMap.has(row.kelompok)) {
            kbliMap.set(row.kelompok, {
                id: row.kelompok,
                name: row.judul_kelompok,
                level: 5,
                parentId: row.subgolongan
            });
        }
    }

    const kbliData = Array.from(kbliMap.values());
    fs.writeFileSync(path.join(DATA_DIR, 'kbli_data.json'), JSON.stringify(kbliData, null, 2));
    console.log(`Saved ${kbliData.length} KBLI entries.`);

    console.log('Converting KBKI...');
    const rawKbki: any[] = readCSV('kamus_kbki.csv');
    const kbkiData: KBKIEntry[] = [];
    const kbkiMappings: KBKIMapping[] = [];

    for (const row of rawKbki) {
        const kbkiId = String(row.kd_kbki_2015);
        const kbliId = String(row.kd_kbli_2020);

        kbkiData.push({
            id: kbkiId,
            name: row.judul_kbki_2015,
            level: 10, // Assuming leaf level as provided
            parentId: null // Intermediate levels not provided in CSV
        });

        if (kbliId && kbliId !== 'undefined' && kbliId !== 'null') {
            kbkiMappings.push({
                kbkiId: kbkiId,
                kbliId: kbliId
            });
        }
    }

    fs.writeFileSync(path.join(DATA_DIR, 'kbki_data.json'), JSON.stringify(kbkiData, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'kbki_mapping_data.json'), JSON.stringify(kbkiMappings, null, 2));
    console.log(`Saved ${kbkiData.length} KBKI entries and ${kbkiMappings.length} mappings.`);
}

convert().catch(console.error);
