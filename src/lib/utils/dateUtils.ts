import { format, parse, isValid, differenceInMonths, differenceInDays, addMonths, differenceInYears, addYears } from "date-fns";

/**
 * Parse manual date input in various formats
 * Supports: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
 */
export function parseManualDateInput(input: string): Date | null {
  if (!input || input.trim() === "") return null;
  
  const formats = [
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "yyyy-MM-dd",
    "M/d/yyyy",
    "d/M/yyyy",
  ];
  
  for (const dateFormat of formats) {
    try {
      const parsed = parse(input, dateFormat, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date | null | undefined): string {
  if (!date) return "";
  try {
    return format(date, "PPP"); // e.g., "Jan 1, 2024"
  } catch {
    return "";
  }
}

/**
 * Format date for form submission (YYYY-MM-DD)
 */
export function formatDateForSubmission(date: Date | null | undefined): string | null {
  if (!date) return null;
  try {
    return format(date, "yyyy-MM-dd");
  } catch {
    return null;
  }
}

/**
 * Check if date range is valid
 */
export function isValidDateRange(start: Date | null, end: Date | null): boolean {
  if (!start || !end) return true; // Allow partial ranges
  return start <= end;
}

/**
 * Format duration between two dates in a readable format
 * Accounts for varying month lengths (31, 30, 28/29 days)
 * Returns format like: "11 months, 29 days" or "1 year, 2 months, 5 days"
 */
export function formatDurationInMonthsAndDays(startDate: Date, endDate: Date): string {
  if (!startDate || !endDate) return "";
  
  try {
    // Calculate years
    const years = differenceInYears(endDate, startDate);
    const dateAfterYears = years > 0 ? addYears(startDate, years) : startDate;
    
    // Calculate remaining months after years
    const months = differenceInMonths(endDate, dateAfterYears);
    const dateAfterMonths = months > 0 ? addMonths(dateAfterYears, months) : dateAfterYears;
    
    // Calculate remaining days after months
    const days = differenceInDays(endDate, dateAfterMonths);
    
    // Build the readable string
    const parts: string[] = [];
    
    if (years > 0) {
      parts.push(`${years} year${years > 1 ? 's' : ''}`);
    }
    
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    
    if (days > 0) {
      parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : "0 days";
  } catch {
    return "";
  }
}
