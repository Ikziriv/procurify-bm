import * as XLSX from 'xlsx';
console.log('XLSX keys:', Object.keys(XLSX));
console.log('XLSX default keys:', (XLSX as any).default ? Object.keys((XLSX as any).default) : 'No default');
