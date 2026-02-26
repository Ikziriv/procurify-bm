import klpdData from './klpd.json';

export type InstitutionCategory =
    | 'MINISTRY'
    | 'PROVINCE'
    | 'CITY'
    | 'REGENCY'
    | 'AGENCY'
    | 'ENTERPRISE'
    | 'EDUCATION'
    | 'HEALTH'
    | 'OTHER';

export interface Institution {
    id: string;
    name: string;
    category: InstitutionCategory;
    provinceId?: string; // Parent province ID for CITY and REGENCY
    abbreviation?: string; // Common abbreviation (e.g., Kemenhub, Setneg)
}

/**
 * Static dataset of Indonesian institutions (KLPD)
 */
export const institutions = klpdData as Institution[];

/**
 * Get all institutions grouped by category
 */
export function getInstitutionsByCategory(): Record<InstitutionCategory, Institution[]> {
    return institutions.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<InstitutionCategory, Institution[]>);
}

/**
 * Get all regencies and cities for a specific province
 */
export function getRegionalInstitutions(provinceId: string): Institution[] {
    return institutions.filter(item => item.provinceId === provinceId);
}

/**
 * Get all provinces
 */
export function getProvinces(): Institution[] {
    return institutions.filter(item => item.category === 'PROVINCE');
}

/**
 * Search institutions by name or abbreviation
 */
export function searchInstitutions(query: string): Institution[] {
    const q = query.toLowerCase();
    return institutions.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.abbreviation && item.abbreviation.toLowerCase().includes(q))
    );
}

/**
 * Get an institution by its stable ID
 */
export function getInstitutionById(id: string): Institution | undefined {
    return institutions.find(item => item.id === id);
}
