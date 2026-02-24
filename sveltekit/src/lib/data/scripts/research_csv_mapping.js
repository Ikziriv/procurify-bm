const fs = require('fs');

const csvPath = 'sveltekit/src/lib/data/old/user_penyedia.csv';
const locationsPath = 'sveltekit/src/lib/data/locations.json';

function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split('\n');
const header = parseCSVLine(lines[0]);

const provIdx = header.indexOf('provinsi');
const cityIdx = header.indexOf('kota');

const uniqueProv = new Set();
const uniqueCity = new Set();

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = parseCSVLine(lines[i]);
    uniqueProv.add(parts[provIdx]);
    uniqueCity.add(parts[cityIdx]);
}

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

console.log('--- CSV Analysis ---');
console.log('Total lines:', lines.length);
console.log('Unique Provinces in CSV:', uniqueProv.size);
console.log('Unique Cities in CSV:', uniqueCity.size);

console.log('\nSample Provinces in CSV:', Array.from(uniqueProv).slice(0, 10));
console.log('Sample Cities in CSV:', Array.from(uniqueCity).slice(0, 10));

const jsonProvs = locations.provinces.map(p => p.name.toUpperCase());
const jsonCities = locations.regencies.map(r => r.name.toUpperCase());

console.log('\n--- Match Check ---');
const missingProvs = Array.from(uniqueProv).filter(p => p && !jsonProvs.includes(p.toUpperCase()));
const missingCities = Array.from(uniqueCity).filter(c => c && !jsonCities.includes(c.toUpperCase()));

console.log('Provinces in CSV not found in JSON (raw match):', missingProvs.slice(0, 5));
console.log('Cities in CSV not found in JSON (raw match):', missingCities.slice(0, 5));
console.log('Total Missing Provinces:', missingProvs.length);
console.log('Total Missing Cities:', missingCities.length);
