const fs = require('fs');

const csvPath = 'sveltekit/src/lib/data/old/user_penyedia.csv';

function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuote && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result;
}

const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split(/\r?\n/);
const header = parseCSVLine(lines[0]);

const cpNameIdx = header.indexOf('nama_cp');
const cpPhoneIdx = header.indexOf('no_hp_cp');

let hasBoth = 0;
let hasNameOnly = 0;
let hasPhoneOnly = 0;
let hasNone = 0;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = parseCSVLine(lines[i]);
    const name = parts[cpNameIdx];
    const phone = parts[cpPhoneIdx];

    if (name && phone) hasBoth++;
    else if (name) hasNameOnly++;
    else if (phone) hasPhoneOnly++;
    else hasNone++;
}

console.log(`Results:
Both Name & Phone: ${hasBoth}
Name Only:         ${hasNameOnly}
Phone Only:        ${hasPhoneOnly}
None:              ${hasNone}
Total:             ${lines.length - 1}
`);
