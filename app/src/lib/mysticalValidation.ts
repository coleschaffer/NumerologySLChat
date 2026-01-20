/**
 * Mystical Validation - Convert error codes into mystical Oracle responses
 *
 * Instead of technical error messages like "I couldn't understand that date format",
 * this module calls the Oracle API to generate contextual, personalized mystical redirects.
 *
 * Example:
 * - User enters: "tacos and pizzas"
 * - Oracle responds: "Ah, your spirit is playful today... I sense humor in your energy.
 *   But to unlock your cosmic truth, I need the moment you entered this world. When were you born?"
 */

import type { DateParseErrorCode } from './dateParser';
import type { ConversationPhase } from './phaseConfig';

export type ValidationErrorCode =
  | DateParseErrorCode
  | 'EMPTY_INPUT'
  | 'INVALID_FORMAT'
  | 'TOO_SHORT'
  | 'INVALID_CHARACTERS'
  | 'OFF_TOPIC';

export interface ValidationContext {
  /** The phase where validation failed */
  phase: ConversationPhase;
  /** The error code from validation */
  errorCode: ValidationErrorCode;
  /** The user's original input */
  originalInput: string;
  /** User's name if available */
  userName?: string;
  /** User's life path number if available */
  lifePath?: number;
  /** What type of input was expected */
  expectedInput: 'date' | 'name' | 'email' | 'freeform';
}

/**
 * Fallback mystical messages for each error type when API is unavailable
 */
const fallbackMessages: Record<ValidationErrorCode, Record<string, string[]>> = {
  OFF_TOPIC: {
    date: [
      "Ah, your spirit is playful today... I sense something beyond the ordinary in your words.",
      "But to unlock your cosmic truth, I need the moment you entered this world. When were you born?",
    ],
    name: [
      "I sense energy in what you've shared...",
      "But to truly see you, I need the name given to you at birth. What is your full birth name?",
    ],
    email: [
      "Your thoughts drift to other places...",
      "To preserve your reading, I need a way to reach you. What is your email?",
    ],
    freeform: [
      "I feel the wandering of your mind...",
      "Let us return to the path. Tell me what weighs on your heart.",
    ],
  },
  EMPTY_INPUT: {
    date: [
      "The silence speaks... but I cannot read what is not given.",
      "Share with me your birth date, and the numbers shall reveal their secrets.",
    ],
    name: [
      "Without your name, I am looking into mist...",
      "Tell me the name you were given at birth.",
    ],
    email: [
      "I await your answer...",
      "Where shall I send your complete reading?",
    ],
    freeform: [
      "The silence stretches between us...",
      "What would you like to know?",
    ],
  },
  UNRECOGNIZED_FORMAT: {
    date: [
      "The numbers in your message shimmer, but their pattern eludes me...",
      "Try sharing your birthday like this: March 15, 1990",
    ],
    name: ["Let me understand your name more clearly..."],
    email: ["I need a clearer path to reach you..."],
    freeform: ["Tell me more..."],
  },
  INVALID_MONTH: {
    date: [
      "I see the numbers, but the month doesn't align with the celestial calendar...",
      "Please share a month between January and December.",
    ],
    name: ["Something doesn't quite resonate..."],
    email: ["The path seems unclear..."],
    freeform: ["I sense confusion in the stars..."],
  },
  INVALID_DAY: {
    date: [
      "The day you've shared doesn't exist in our earthly realm...",
      "Please share a day between 1 and 31.",
    ],
    name: ["Something feels off..."],
    email: ["Let me try to understand..."],
    freeform: ["The numbers aren't quite right..."],
  },
  INVALID_YEAR: {
    date: [
      "That year lies beyond the boundaries I can see...",
      "Please share a year between 1900 and now.",
    ],
    name: ["I'm having trouble seeing clearly..."],
    email: ["The path isn't clear..."],
    freeform: ["Something doesn't align..."],
  },
  IMPOSSIBLE_DATE: {
    date: [
      "That date... it exists in no calendar I know.",
      "Perhaps February 30th in your universe? Here, I need a date that truly exists.",
    ],
    name: ["The vibrations don't quite harmonize..."],
    email: ["I sense interference..."],
    freeform: ["The cosmos seem puzzled..."],
  },
  FUTURE_DATE: {
    date: [
      "Ah, a time traveler? That date hasn't happened yet in this realm...",
      "I need the date of your past arrival, not a future journey.",
    ],
    name: ["I sense something from another time..."],
    email: ["The timeline doesn't align..."],
    freeform: ["We must stay in the present..."],
  },
  INVALID_FORMAT: {
    date: [
      "I see fragments, but they don't form a complete date...",
      "Try something like 'March 15, 1990' or '3/15/1990'.",
    ],
    name: [
      "Names hold power, but this one seems incomplete...",
      "Please share your full birth name.",
    ],
    email: [
      "I need a proper channel to reach you...",
      "Please enter a valid email address.",
    ],
    freeform: ["I didn't quite catch that..."],
  },
  TOO_SHORT: {
    date: ["The date feels incomplete..."],
    name: [
      "A name with such brevity? Surely there's more...",
      "Please share your complete birth name.",
    ],
    email: ["I need more to reach you..."],
    freeform: ["Tell me more..."],
  },
  INVALID_CHARACTERS: {
    date: ["Strange symbols cloud my vision..."],
    name: [
      "I see symbols that don't belong in a name...",
      "Please use only letters in your birth name.",
    ],
    email: ["The path contains obstacles..."],
    freeform: ["I sense interference in your message..."],
  },
};

/**
 * Get fallback mystical messages for a validation error
 */
export function getFallbackMysticalMessages(
  errorCode: ValidationErrorCode,
  expectedInput: ValidationContext['expectedInput']
): string[] {
  const messages = fallbackMessages[errorCode]?.[expectedInput];
  if (messages && messages.length > 0) {
    return messages;
  }
  // Ultimate fallback
  return [
    "Something in your words doesn't quite align with what I'm seeking...",
    getRedirectMessage(expectedInput),
  ];
}

/**
 * Get a redirect message based on what input is expected
 */
function getRedirectMessage(expectedInput: ValidationContext['expectedInput']): string {
  switch (expectedInput) {
    case 'date':
      return "When were you born? Share your birthday with me.";
    case 'name':
      return "What is your full birth name?";
    case 'email':
      return "Where should I send your complete reading?";
    case 'freeform':
      return "What would you like to explore?";
  }
}

/**
 * Call the Oracle API to generate mystical validation messages
 *
 * @param context - The validation context with error details
 * @returns Array of mystical messages to display
 */
export async function getMysticalValidationMessages(
  context: ValidationContext
): Promise<string[]> {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'validation',
        context: {
          userName: context.userName,
          lifePath: context.lifePath,
        },
        phase: context.phase,
        validation: {
          errorCode: context.errorCode,
          originalInput: context.originalInput,
          expectedInput: context.expectedInput,
        },
        baseMessages: getFallbackMysticalMessages(context.errorCode, context.expectedInput),
      }),
    });

    if (!response.ok) {
      console.warn('Oracle API returned non-OK status:', response.status);
      return getFallbackMysticalMessages(context.errorCode, context.expectedInput);
    }

    const data = await response.json();
    return data.messages || getFallbackMysticalMessages(context.errorCode, context.expectedInput);
  } catch (error) {
    console.error('Failed to get mystical validation messages:', error);
    return getFallbackMysticalMessages(context.errorCode, context.expectedInput);
  }
}

/**
 * Generate mystical messages for off-topic input
 * This creates more playful, engaging responses that acknowledge the user's
 * energy while redirecting back to the reading flow.
 */
export async function getMysticalOffTopicRedirect(
  userInput: string,
  expectedInput: ValidationContext['expectedInput'],
  context: {
    phase: ConversationPhase;
    userName?: string;
    lifePath?: number;
  }
): Promise<string[]> {
  return getMysticalValidationMessages({
    phase: context.phase,
    errorCode: 'OFF_TOPIC',
    originalInput: userInput,
    userName: context.userName,
    lifePath: context.lifePath,
    expectedInput,
  });
}
