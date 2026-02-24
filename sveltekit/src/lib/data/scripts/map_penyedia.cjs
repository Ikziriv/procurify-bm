const fs = require('fs');

const csvPath = 'sveltekit/src/lib/data/old/user_penyedia.csv';
const locationsPath = 'sveltekit/src/lib/data/locations.json';
const outputPath = 'sveltekit/src/lib/data/user_penyedia_mapped.json';

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

function normalize(text) {
    if (!text) return '';
    return text.toUpperCase()
        .replace(/^KABUPATEN\s+/i, 'KAB. ')
        .replace(/^KAB\s+/i, 'KAB. ')
        .replace(/^KOTA\s+/i, 'KOTA ')
        .trim();
}

function normalizeProvince(text) {
    if (!text) return '';
    let t = text.toUpperCase().trim();
    if (t === 'NANGROE ACEH DARUSSALAM') return 'ACEH';
    if (t === 'DI YOGYAKARTA' || t === 'DAERAH ISTIMEWA YOGYAKARTA') return 'DAERAH ISTIMEWA YOGYAKARTA';
    if (t === 'DKI JAKARTA') return 'DKI JAKARTA';
    return t;
}

function normalizeCity(text) {
    if (!text) return '';
    let t = normalize(text);
    // Handle Jakarta special cases in JSON
    if (t.startsWith('KOTA JAKARTA')) {
        return t.replace('KOTA JAKARTA', 'KOTA ADM. JAKARTA');
    }
    return t;
}

console.log('Loading locations...');
const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

const provMap = new Map();
locations.provinces.forEach(p => {
    provMap.set(p.name.toUpperCase(), p.id);
});

const cityMap = new Map();
locations.regencies.forEach(r => {
    cityMap.set(r.name.toUpperCase(), { id: r.id, provinceId: r.provinceId });
});

console.log('Parsing CSV...');
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split(/\r?\n/);
const header = parseCSVLine(lines[0]);

const idIdx = header.indexOf('id');
const nameIdx = header.indexOf('nama_perusahaan');
const nibIdx = header.indexOf('nib');
const addrIdx = header.indexOf('alamat');
const provIdx = header.indexOf('provinsi');
const cityIdx = header.indexOf('kota');
const asosiasiIdx = header.indexOf('asosiasi');

const output = [];
let matchedCount = 0;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = parseCSVLine(lines[i]);

    const provName = normalizeProvince(parts[provIdx]);
    const cityName = normalizeCity(parts[cityIdx]);

    const provId = provMap.get(provName);
    const cityData = cityMap.get(cityName);

    if (provId || cityData) {
        matchedCount++;
    }

    output.push({
        id: parts[idIdx], // User ID for company profile
        companyId: parts[idIdx], // For consistency with contact persons
        nama_perusahaan: parts[nameIdx],
        nib: parts[nibIdx],
        alamat: parts[addrIdx],
        provinsi: provName,
        kota: cityName,
        province_id: provId || null,
        regency_id: cityData ? cityData.id : null,
        kbli: parts[asosiasiIdx] || null
    });
}

console.log(`Matched ${matchedCount} out of ${output.length} records with location data.`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Saved output to ${outputPath}`);
