/**
 * Parse natural language date strings into Date objects
 * Handles various formats users might type in chat:
 * - "March 15, 1990"
 * - "3/15/1990" or "3/15/90"
 * - "15 March 1990"
 * - "03-15-1990"
 * - "1990-03-15"
 * - "march 15 1990"
 */

const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

export interface ParsedDate {
  date: Date;
  formatted: string;
}

export interface ParseError {
  error: string;
  suggestion: string;
}

export type ParseResult = ParsedDate | ParseError;

export function isParseError(result: ParseResult): result is ParseError {
  return 'error' in result;
}

export function parseDateString(input: string): ParseResult {
  const cleaned = input.trim().toLowerCase();

  if (!cleaned) {
    return {
      error: "I didn't catch that.",
      suggestion: "Try something like 'March 15, 1990' or '3/15/1990'",
    };
  }

  let month: number | undefined;
  let day: number | undefined;
  let year: number | undefined;

  // Try: "March 15, 1990" or "March 15 1990" or "15 March 1990"
  const monthNameMatch = cleaned.match(
    /([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{2,4})/
  );
  if (monthNameMatch) {
    const monthStr = monthNameMatch[1];
    if (MONTHS[monthStr] !== undefined) {
      month = MONTHS[monthStr];
      day = parseInt(monthNameMatch[2], 10);
      year = normalizeYear(parseInt(monthNameMatch[3], 10));
    }
  }

  // Try: "15 March 1990"
  if (month === undefined) {
    const dayFirstMatch = cleaned.match(
      /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)[,\s]+(\d{2,4})/
    );
    if (dayFirstMatch) {
      const monthStr = dayFirstMatch[2];
      if (MONTHS[monthStr] !== undefined) {
        day = parseInt(dayFirstMatch[1], 10);
        month = MONTHS[monthStr];
        year = normalizeYear(parseInt(dayFirstMatch[3], 10));
      }
    }
  }

  // Try: "3/15/1990" or "03-15-1990" (MM/DD/YYYY - US format)
  if (month === undefined) {
    const slashMatch = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (slashMatch) {
      const first = parseInt(slashMatch[1], 10);
      const second = parseInt(slashMatch[2], 10);
      year = normalizeYear(parseInt(slashMatch[3], 10));

      // Assume US format (MM/DD/YYYY)
      month = first - 1;
      day = second;
    }
  }

  // Try: "1990-03-15" (ISO format YYYY-MM-DD)
  if (month === undefined) {
    const isoMatch = cleaned.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    }
  }

  // Validate parsed values
  if (month === undefined || day === undefined || year === undefined) {
    return {
      error: "I couldn't understand that date format.",
      suggestion: "Try something like 'March 15, 1990' or '3/15/1990'",
    };
  }

  // Validate ranges
  if (month < 0 || month > 11) {
    return {
      error: "That month doesn't look right.",
      suggestion: "Please enter a valid month (1-12 or January-December)",
    };
  }

  if (day < 1 || day > 31) {
    return {
      error: "That day doesn't look right.",
      suggestion: "Please enter a valid day (1-31)",
    };
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return {
      error: "That year doesn't seem right.",
      suggestion: `Please enter a year between 1900 and ${currentYear}`,
    };
  }

  // Create the date (use noon to avoid timezone issues)
  const date = new Date(year, month, day, 12, 0, 0);

  // Verify the date is valid (catches things like Feb 30)
  if (date.getMonth() !== month || date.getDate() !== day) {
    return {
      error: "That date doesn't exist.",
      suggestion: "Please check the day and month combination",
    };
  }

  // Check it's not in the future
  if (date > new Date()) {
    return {
      error: "That date is in the future.",
      suggestion: "Please enter your actual birth date",
    };
  }

  // Format for display
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return { date, formatted };
}

function normalizeYear(year: number): number {
  // Handle 2-digit years
  if (year < 100) {
    // Assume 00-29 is 2000s, 30-99 is 1900s
    return year < 30 ? 2000 + year : 1900 + year;
  }
  return year;
}
