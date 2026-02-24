const fs = require('fs');

const csvPath = 'sveltekit/src/lib/data/old/user_penyedia.csv';
const mappedJsonPath = 'sveltekit/src/lib/data/user_penyedia_mapped.json';
const outputPath = 'sveltekit/src/lib/data/contact_persons.json';

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

console.log('Loading mapped company data...');
const mappedJson = JSON.parse(fs.readFileSync(mappedJsonPath, 'utf8'));
const validNibs = new Set(mappedJson.map(c => c.nib));

console.log('Parsing CSV...');
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split(/\r?\n/);
const header = parseCSVLine(lines[0]);

const idIdx = header.indexOf('id');
const nibIdx = header.indexOf('nib');
const cpNameIdx = header.indexOf('nama_cp');
const cpPhoneIdx = header.indexOf('no_hp_cp');

const output = [];
let contactCount = 0;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = parseCSVLine(lines[i]);

    const nib = parts[nibIdx];
    const name = parts[cpNameIdx];
    const phone = parts[cpPhoneIdx];
    const companyId = parts[idIdx];

    if (validNibs.has(nib) && (name || phone)) {
        contactCount++;
        output.push({
            id: `CP-${companyId}`,
            companyId: companyId,
            name: name || 'Contact Person',
            phone: phone || null,
            position: 'Contact Person',
            status: 'ACTIVE'
        });
    }
}

console.log(`Extracted ${contactCount} contact persons from valid companies.`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Saved output to ${outputPath}`);
