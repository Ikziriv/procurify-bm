/**
 * Formats a number as IDR currency.
 * @param value The value to format
 * @param includeFraction Whether to include decimal places (default: false)
 * @returns Formatted currency string
 */
export const formatIDR = (value: number, includeFraction = false): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: includeFraction ? 2 : 0,
        minimumFractionDigits: includeFraction ? 2 : 0
    }).format(value);
};

/**
 * Formats a date string to a human-readable format.
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }
): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', options);
};

/**
 * Technical number formatting for small stats
 * @param val Number to format
 * @returns String
 */
export const formatCompactNumber = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(val);
}
