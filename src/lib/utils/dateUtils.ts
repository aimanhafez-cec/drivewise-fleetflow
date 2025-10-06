import { format, parse, isValid } from "date-fns";

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
