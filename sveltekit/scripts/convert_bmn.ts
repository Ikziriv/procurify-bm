import * as XLSX from 'xlsx';
import * as fs from 'fs';

const inputFile = 'c:/Users/user/Documents/GitHub/procurify-bm/sveltekit/src/lib/data/old/kode_bmn.xlsx';
const outputFile = 'c:/Users/user/Documents/GitHub/procurify-bm/sveltekit/src/lib/data/bmn_data.json';

function convert() {
    console.log(`Reading ${inputFile}...`);
    const workbook = XLSX.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get the headers to handle duplicates
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers: string[] = rawRows[0];
    console.log('Detected Headers:', headers);

    const refinedData: any[] = [];

    // Skip header row
    for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue;

        // Map columns by index based on header sample from command output
        // Row 2 (index 2): [<1 empty item>, 'BAHAN BANGUNAN DAN KONSTRUKSI', '11110', 1, '01', '01', '01', '000', '1.01.01.01.000']
        // Index 0: SAT (often empty)
        // Index 1: URAIAN
        // Index 2: Kodefikasi BMN (numeric style)
        // Index 3: GOL
        // Index 4: BID
        // Index 5: KEL
        // Index 6: SUB KEL
        // Index 7: SUB-SUB KEL
        // Index 8: Kodefikasi BMN (dotted style)

        const unit = row[0];
        const name = row[1];
        const kodefikasiBmn = row[2];
        const gol = String(row[3] || '');
        const bid = String(row[4] || '');
        const kel = String(row[5] || '');
        const subKel = String(row[6] || '');
        const subSubKel = String(row[7] || '');
        const id = row[8]; // The dotted one

        if (!id || !name) continue;

        refinedData.push({
            id: String(id),
            kodefikasiBmn: String(kodefikasiBmn),
            gol,
            bid,
            kel,
            subKel,
            subSubKel,
            name,
            unit: String(unit || ''),
            level: calculateLevel(row)
        });
    }

    const hierarchyData: any[] = [];
    const lastParents: Record<number, string | null> = { 0: null };

    // Grouping to ensure unique entries and hierarchy
    for (const item of refinedData) {
        const level = item.level;
        item.parentId = lastParents[level - 1] || null;
        lastParents[level] = item.id;
        hierarchyData.push(item);
    }

    console.log(`Writing ${hierarchyData.length} items to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(hierarchyData, null, 2));
    console.log('Done!');
}

function calculateLevel(row: any[]) {
    // Determine level by searching for the first non-empty/non-zero classification code from the right
    if (row[7] && row[7] !== '000' && row[7] !== 0) return 5;
    if (row[6] && row[6] !== '00' && row[6] !== 0) return 4;
    if (row[5] && row[5] !== '00' && row[5] !== 0) return 3;
    if (row[4] && row[4] !== '00' && row[4] !== 0) return 2;
    return 1;
}

convert();
