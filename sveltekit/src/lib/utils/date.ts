/**
 * Formats a date string or Date object into a readable Indonesian-style date (DD MMM YYYY)
 * handles invalid dates, null, and undefined by returning a fallback string.
 */
export function formatDate(date: string | Date | null | undefined, locale = 'en-GB'): string {
    if (!date) return 'No Date';

    const d = new Date(date);

    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    try {
        return d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Format Error';
    }
}

/**
 * Formats a date string or Date object into a readable Indonesian-style date-time (DD MMM YYYY, HH:mm)
 */
export function formatDateTime(date: string | Date | null | undefined, locale = 'en-GB'): string {
    if (!date) return 'No Date';

    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    try {
        return d.toLocaleString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Error formatting date-time:', e);
        return 'Format Error';
    }
}
