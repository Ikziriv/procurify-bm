
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = 'src/lib/data/old/kemen_pu';
const ABS_DATA_DIR = path.resolve(process.cwd(), DATA_DIR);

function inspectExcelFiles() {
    if (!fs.existsSync(ABS_DATA_DIR)) {
        console.error(`Directory not found: ${ABS_DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(ABS_DATA_DIR).filter(file => file.endsWith('.xlsx'));

    if (files.length === 0) {
        console.log('No .xlsx files found in dictionary.');
        return;
    }

    files.forEach(file => {
        console.log(`\n--- Inspecting: ${file} ---`);
        const filePath = path.join(ABS_DATA_DIR, file);

        try {
            const workbook = readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Get headers (first row)
            const headers: string[] = [];
            const range = utils.decode_range(worksheet['!ref'] || 'A1');
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = { c: C, r: range.s.r };
                const cellRef = utils.encode_cell(cellAddress);
                const cell = worksheet[cellRef];
                headers.push(cell ? cell.v : `UNKNOWN_${C}`);
            }
            console.log('Headers:', headers);

            // Get first 3 rows of data
            const data = utils.sheet_to_json(worksheet, { header: headers, range: 1, blankrows: false }).slice(0, 3);
            console.log('Sample Data (first 3 rows):');
            console.log(JSON.stringify(data, null, 2));

        } catch (error) {
            console.error(`Error reading ${file}:`, error);
        }
    });
}

inspectExcelFiles();
