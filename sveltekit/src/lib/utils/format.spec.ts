import { describe, it, expect } from 'vitest';
import { formatIDR, formatDate, formatCompactNumber } from './format';

describe('formatIDR', () => {
    it('contains Rp and the number', () => {
        const result = formatIDR(1000000);
        expect(result).toContain('Rp');
        expect(result).toContain('1.000.000');
    });
});

describe('formatDate', () => {
    it('formats date strings correctly', () => {
        const date = '2026-02-26';
        expect(formatDate(date)).toContain('26');
        expect(formatDate(date)).toContain('Feb');
        expect(formatDate(date)).toContain('2026');
    });
});

describe('formatCompactNumber', () => {
    it('formats large numbers compactly', () => {
        const result = formatCompactNumber(1500000);
        expect(result).toContain('1');
        // "1,5" or "1.5" depending on locale
        expect(result).toMatch(/1[.,]5/);
    });
});
