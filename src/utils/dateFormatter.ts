// utils/dateFormatter.ts
export const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '-';

    const trimmedStr = dateStr.toString().trim();
    if (!trimmedStr || trimmedStr === 'No' || trimmedStr === '-') return '-';

    try {
        // Handle YYYY-MM-DD specifically to avoid timezone issues
        const ymdMatch = trimmedStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymdMatch) {
            const [_, year, month, day] = ymdMatch;
            // Create date at noon local time
            const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 12, 0, 0);
            return date.toLocaleDateString("en-GB");
        }

        // Fallback for other formats
        const date = new Date(trimmedStr);
        if (isNaN(date.getTime())) {
            return trimmedStr;
        }
        return date.toLocaleDateString("en-GB");
    } catch (error) {
        console.error('Error formatting date:', trimmedStr, error);
        return trimmedStr;
    }
};


// Helper function to format date for Google Sheets (without timezone shift)
export const formatDateForGoogleSheets = (dateStr: string | Date): string => {
    if (!dateStr) return '';

    try {
        let date: Date;

        if (dateStr instanceof Date) {
            date = dateStr;
        } else if (typeof dateStr === 'string') {
            // If it's already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }
            date = new Date(dateStr);
        } else {
            return '';
        }

        if (isNaN(date.getTime())) {
            return '';
        }

        // Format as YYYY-MM-DD (local date, not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date for Google Sheets:', error);
        return '';
    }
};

// Function to parse date from input field (YYYY-MM-DD) and avoid timezone issues
export const parseDateFromInput = (inputDate: string): string => {
    if (!inputDate) return '';

    // Input from <input type="date"> is already YYYY-MM-DD
    // But we need to ensure it's treated as local date, not UTC
    const parts = inputDate.split('-');
    if (parts.length !== 3) return inputDate;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    // Create date at noon to avoid timezone issues
    const date = new Date(year, month, day, 12, 0, 0, 0);

    // Format back to YYYY-MM-DD for consistency
    const formattedYear = date.getFullYear();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');

    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
};