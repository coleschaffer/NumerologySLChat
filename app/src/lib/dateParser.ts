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

/**
 * Fuzzy match a month name (handles typos like "januuary", "febuary", etc.)
 */
function fuzzyMatchMonth(input: string): number | undefined {
  const cleaned = input.toLowerCase().trim();

  // Direct match first
  if (MONTHS[cleaned] !== undefined) {
    return MONTHS[cleaned];
  }

  // Calculate Levenshtein distance for fuzzy matching
  const levenshtein = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i-1] === a[j-1]
          ? matrix[i-1][j-1]
          : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  };

  // Only try full month names for fuzzy matching
  const fullMonths = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];

  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const month of fullMonths) {
    const distance = levenshtein(cleaned, month);
    // Allow up to 2 character differences for longer months, 1 for shorter
    const threshold = month.length > 5 ? 2 : 1;
    if (distance <= threshold && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = month;
    }
  }

  if (bestMatch) {
    console.log(`[dateParser] Fuzzy matched "${cleaned}" to "${bestMatch}"`);
    return MONTHS[bestMatch];
  }

  return undefined;
}

/**
 * Error codes for date parsing failures
 * These are used by mysticalValidation.ts to generate contextual mystical responses
 */
export type DateParseErrorCode =
  | 'EMPTY_INPUT'
  | 'UNRECOGNIZED_FORMAT'
  | 'INVALID_MONTH'
  | 'INVALID_DAY'
  | 'INVALID_YEAR'
  | 'IMPOSSIBLE_DATE'
  | 'FUTURE_DATE'
  | 'OFF_TOPIC';

export interface ParsedDate {
  date: Date;
  formatted: string;
}

export interface ParseError {
  errorCode: DateParseErrorCode;
  originalInput: string;
  /** Technical details for debugging */
  details?: string;
}

export type ParseResult = ParsedDate | ParseError;

export function isParseError(result: ParseResult): result is ParseError {
  return 'errorCode' in result;
}

/**
 * Detect if input is clearly not a date attempt (off-topic input)
 * This triggers mystical redirects instead of technical error messages
 */
function isOffTopicInput(input: string): boolean {
  const cleaned = input.toLowerCase().trim();

  // Check if there are any numbers at all
  const hasNumbers = /\d/.test(cleaned);

  // Check for month names (including fuzzy matches)
  const words = cleaned.split(/\s+/);
  const hasMonthName = words.some(word => fuzzyMatchMonth(word) !== undefined);

  // If no numbers AND no month names, it's likely off-topic
  if (!hasNumbers && !hasMonthName) {
    return true;
  }

  // Check for common off-topic patterns
  const offTopicPatterns = [
    /^(hi|hello|hey|sup|yo|what'?s? up)/i,
    /^(thanks|thank you|thx)/i,
    /^(how are you|how's it going)/i,
    /^(what|who|where|why|when|how)\s/i, // Questions
    /^(can you|could you|will you|would you)/i,
    /^(i think|i feel|i want|i need|i am|i'm)/i,
    /^(yes|no|maybe|sure|ok|okay|nope|nah)/i,
    /[!?]{2,}/, // Multiple punctuation
    /^[a-z]+\s+and\s+[a-z]+$/i, // "X and Y" patterns like "tacos and pizzas"
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(cleaned)) {
      return true;
    }
  }

  // If input is very long (more than 30 chars) without date-like patterns
  if (cleaned.length > 30 && !hasNumbers && !hasMonthName) {
    return true;
  }

  return false;
}

export function parseDateString(input: string): ParseResult {
  const cleaned = input.trim().toLowerCase();
  const originalInput = input.trim();

  if (!cleaned) {
    return {
      errorCode: 'EMPTY_INPUT',
      originalInput,
    };
  }

  // Check for off-topic input first
  if (isOffTopicInput(cleaned)) {
    return {
      errorCode: 'OFF_TOPIC',
      originalInput,
      details: 'Input does not appear to be a date attempt',
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
    const fuzzyMonth = fuzzyMatchMonth(monthStr);
    if (fuzzyMonth !== undefined) {
      month = fuzzyMonth;
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
      const fuzzyMonth = fuzzyMatchMonth(monthStr);
      if (fuzzyMonth !== undefined) {
        day = parseInt(dayFirstMatch[1], 10);
        month = fuzzyMonth;
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
      errorCode: 'UNRECOGNIZED_FORMAT',
      originalInput,
      details: 'Could not extract month, day, and year from input',
    };
  }

  // Validate ranges
  if (month < 0 || month > 11) {
    return {
      errorCode: 'INVALID_MONTH',
      originalInput,
      details: `Parsed month value: ${month + 1}`,
    };
  }

  if (day < 1 || day > 31) {
    return {
      errorCode: 'INVALID_DAY',
      originalInput,
      details: `Parsed day value: ${day}`,
    };
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return {
      errorCode: 'INVALID_YEAR',
      originalInput,
      details: `Parsed year value: ${year}`,
    };
  }

  // Create the date (use noon to avoid timezone issues)
  const date = new Date(year, month, day, 12, 0, 0);

  // Verify the date is valid (catches things like Feb 30)
  if (date.getMonth() !== month || date.getDate() !== day) {
    return {
      errorCode: 'IMPOSSIBLE_DATE',
      originalInput,
      details: `Date validation failed: expected ${month + 1}/${day}/${year}`,
    };
  }

  // Check it's not in the future
  if (date > new Date()) {
    return {
      errorCode: 'FUTURE_DATE',
      originalInput,
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

/**
 * Try to interpret a new input as a correction to a previous invalid date attempt
 *
 * Example:
 * - Previous: "march 15 209" (invalid year)
 * - New input: "2009"
 * - Result: Combines to "march 15 2009" and parses successfully
 */
export function tryParseAsCorrection(
  newInput: string,
  previousInput: string
): ParseResult | null {
  const newCleaned = newInput.trim().toLowerCase();
  const prevCleaned = previousInput.trim().toLowerCase();

  // Check if new input is just a year (4 digits)
  const yearOnlyMatch = newCleaned.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const newYear = parseInt(yearOnlyMatch[1], 10);

    // Check if previous input has a month and day but invalid/missing year
    // Try to extract month and day from previous input
    const monthNameMatch = prevCleaned.match(/([a-z]+)\s+(\d{1,2})/);
    const dayFirstMatch = prevCleaned.match(/(\d{1,2})\s+([a-z]+)/);

    let month: number | undefined;
    let day: number | undefined;

    if (monthNameMatch && MONTHS[monthNameMatch[1]] !== undefined) {
      month = MONTHS[monthNameMatch[1]];
      day = parseInt(monthNameMatch[2], 10);
    } else if (dayFirstMatch && MONTHS[dayFirstMatch[2]] !== undefined) {
      day = parseInt(dayFirstMatch[1], 10);
      month = MONTHS[dayFirstMatch[2]];
    }

    if (month !== undefined && day !== undefined) {
      // Try to create a valid date with the new year
      const combinedInput = `${month + 1}/${day}/${newYear}`;
      console.log('[dateParser] Trying correction:', combinedInput);
      const result = parseDateString(combinedInput);
      if (!isParseError(result)) {
        console.log('[dateParser] Correction successful!');
        return result;
      }
    }
  }

  // Check if new input looks like it's completing a partial date
  // e.g., previous was "march" and new is "15 1990"
  const hasMonth = Object.keys(MONTHS).some(m => prevCleaned.includes(m));
  const hasNumbers = /\d/.test(newCleaned);

  if (hasMonth && hasNumbers) {
    // Try combining them
    const combined = `${prevCleaned} ${newCleaned}`;
    console.log('[dateParser] Trying combined input:', combined);
    const result = parseDateString(combined);
    if (!isParseError(result)) {
      console.log('[dateParser] Combined parse successful!');
      return result;
    }
  }

  return null;
}

/**
 * Validate email format
 */
export function validateEmail(input: string): { valid: boolean; errorCode?: 'EMPTY_INPUT' | 'INVALID_FORMAT' | 'OFF_TOPIC' } {
  const cleaned = input.trim();

  if (!cleaned) {
    return { valid: false, errorCode: 'EMPTY_INPUT' };
  }

  // Check for off-topic (no @ sign at all)
  if (!cleaned.includes('@')) {
    // Check if it looks like an attempt at an email
    if (/[a-z0-9]/i.test(cleaned) && cleaned.length < 50) {
      return { valid: false, errorCode: 'INVALID_FORMAT' };
    }
    return { valid: false, errorCode: 'OFF_TOPIC' };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return { valid: false, errorCode: 'INVALID_FORMAT' };
  }

  return { valid: true };
}

/**
 * Validate name format
 */
export function validateName(input: string): { valid: boolean; errorCode?: 'EMPTY_INPUT' | 'TOO_SHORT' | 'INVALID_CHARACTERS' | 'OFF_TOPIC' } {
  const cleaned = input.trim();

  if (!cleaned) {
    return { valid: false, errorCode: 'EMPTY_INPUT' };
  }

  // Check for name-specific off-topic patterns (NOT the date one)
  const nameOffTopicPatterns = [
    /^(hi|hello|hey|sup|yo|what'?s? up)/i,
    /^(thanks|thank you|thx)/i,
    /^(how are you|how's it going)/i,
    /^(what|who|where|why|when|how)\s/i,
    /^(can you|could you|will you|would you)/i,
    /^(i think|i feel|i want|i need|i am|i'm)/i,
    /[!?]{2,}/,
    /^\d+$/, // Just numbers
  ];

  for (const pattern of nameOffTopicPatterns) {
    if (pattern.test(cleaned)) {
      return { valid: false, errorCode: 'OFF_TOPIC' };
    }
  }

  // Name should be at least 2 characters
  if (cleaned.length < 2) {
    return { valid: false, errorCode: 'TOO_SHORT' };
  }

  // Name should primarily contain letters (allow spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z][a-zA-Z\s\-']*[a-zA-Z]?$/;

  if (!nameRegex.test(cleaned)) {
    return { valid: false, errorCode: 'INVALID_CHARACTERS' };
  }

  return { valid: true };
}
