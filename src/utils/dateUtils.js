/**
 * Format a Date object to YYYY-MM-DD string using local timezone
 * Avoids timezone issues when using toISOString()
 */
export const formatDateLocal = (date) => {
  if (!date) {
    // If no date provided, use today
    date = new Date();
  } else if (typeof date === 'string') {
    // If string provided, convert to Date first
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 */
export const getTodayLocal = () => {
  return formatDateLocal(new Date());
};

/**
 * Format date components to YYYY-MM-DD string
 */
export const formatDateFromComponents = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Normalize a date string to YYYY-MM-DD format
 * This helps with legacy dates that might have been saved incorrectly
 */
export const normalizeDateString = (dateStr) => {
  if (!dateStr) return null;
  // If already in correct format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Try to parse and reformat
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Invalid date, return original
    return formatDateLocal(date);
  } catch {
    return dateStr; // Return original if parsing fails
  }
};

