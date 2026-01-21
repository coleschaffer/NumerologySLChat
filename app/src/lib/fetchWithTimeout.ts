/**
 * fetchWithTimeout - Utility for API calls with automatic timeout and Oracle-voiced error handling
 *
 * This module provides timeout protection for all API calls to prevent users from
 * getting stuck with infinite loading states when the Anthropic API hangs.
 */

/**
 * Fetch with automatic timeout using AbortController
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options (method, headers, body, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 8000)
 * @returns Promise<Response> - The fetch response
 * @throws AbortError if the request times out
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if an error is a timeout/abort error
 *
 * @param error - The error to check
 * @returns boolean - True if the error is an AbortError (timeout)
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Oracle-voiced timeout fallback messages
 *
 * These messages maintain the mystical tone when API calls fail,
 * ensuring users never see technical error messages.
 */
export const TIMEOUT_FALLBACKS = {
  validation: [
    'The cosmic connection wavers...',
    'Share your answer once more, and clarity will return.',
  ],
  interpretation: [
    'The stars flicker but do not fade...',
    'Your numbers still speak—let me listen again.',
  ],
  suggestions: [] as string[], // Empty array signals to use default suggestions
  conversation: [
    'The veil between us thickens momentarily...',
    'But your path remains clear. Continue with me.',
  ],
  acknowledgment: [
    "I sense the depth of what you've shared...",
    'Your words carry weight.',
  ],
  transition: [
    'The threads of destiny continue to weave...',
  ],
  criticalDate: 'A significant moment approaches on the horizon.',
  yearAhead: {
    theme: 'This year brings transformation and growth.',
    opportunities: 'New opportunities aligned with your life path will emerge.',
    challenges: 'Stay aware of your tendencies and navigate challenges with wisdom.',
    full: 'This year brings transformation and growth. New opportunities aligned with your life path will emerge. Stay aware of your tendencies and navigate challenges with wisdom.',
  },
  relationshipAdvice: 'The connection between your paths carries both harmony and challenge. Your bond has the potential for depth, but requires awareness and effort.',
};

/**
 * Fetch with automatic retry for timeout errors
 *
 * Only retries on timeout/abort errors. Other errors are thrown immediately.
 * Uses exponential backoff between retries.
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @param timeoutMs - Timeout in milliseconds per attempt (default: 8000)
 * @returns Promise<Response> - The fetch response
 * @throws The last error if all retries fail
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2,
  timeoutMs: number = 8000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      lastError = error as Error;

      // Only retry on timeout errors
      if (!isTimeoutError(error)) {
        throw error;
      }

      // Log the retry attempt
      console.warn(
        `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} timed out, ${
          attempt < maxRetries ? 'retrying...' : 'giving up'
        }`
      );

      // Wait before retry with exponential backoff (1s, 2s, etc.)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
