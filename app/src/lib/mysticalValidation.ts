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
import { fetchWithTimeout, isTimeoutError, TIMEOUT_FALLBACKS } from './fetchWithTimeout';
import { getPhaseInstruction } from './aiPhaseInstructions';

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
 * Get a personalized greeting based on userName
 */
function getPersonalizedPrefix(userName?: string | null): string {
  if (!userName) return '';
  const firstName = userName.split(' ')[0];
  return `${firstName}, `;
}

/**
 * Fallback mystical messages for each error type when API is unavailable.
 *
 * Voice Guidelines:
 * - Oracle speaks in certainties, not requests
 * - "The numbers require..." not "Please enter..."
 * - "I sense..." not "It seems like..."
 * - Reference cosmic/mystical elements: stars, numbers, vibrations, paths, veil
 * - Keep each message 1-2 sentences max
 * - NO technical words: error, invalid, format, input, enter, try again, etc.
 */
const fallbackMessages: Record<ValidationErrorCode, Record<string, (userName?: string | null) => string[]>> = {
  OFF_TOPIC: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}Your mind dances ahead of the numbers...`,
      "I sense questions burning within you—and the answers ARE coming.",
      "But the cosmic doorway opens with your birth date. When did you enter this world?",
    ],
    name: (userName) => [
      "Your curiosity reaches beyond this moment...",
      "Soon, I'll reveal layers of yourself you've never seen.",
      "But first, the vibration of your name. What were you called at birth?",
    ],
    email: (userName) => [
      `${getPersonalizedPrefix(userName)}Your eagerness to know more pulses through the connection...`,
      "Your complete reading awaits—predictions, warnings, and hidden truths.",
      "Where shall I send this cosmic map?",
    ],
    freeform: (userName) => [
      `${getPersonalizedPrefix(userName)}Your message carries energy I cannot decode for this purpose.`,
      "Let me ask again...",
    ],
  },
  EMPTY_INPUT: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}The silence speaks...`,
      "But I cannot read what is not given. Share with me your birth date.",
    ],
    name: (userName) => [
      "Without your name, I am looking into mist...",
      "Tell me the name you were given at birth.",
    ],
    email: (userName) => [
      `${getPersonalizedPrefix(userName)}I await your answer...`,
      "Where shall I send your complete reading?",
    ],
    freeform: (userName) => [
      `${getPersonalizedPrefix(userName)}The silence stretches between us...`,
      "What would you like to know?",
    ],
  },
  UNRECOGNIZED_FORMAT: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}The numbers shimmer but won't align into a birth date I can read.`,
      "Month, day, and year—how did you enter this world?",
    ],
    name: (userName) => ["Let me understand your name more clearly..."],
    email: (userName) => ["I need a clearer path to reach you..."],
    freeform: (userName) => ["Tell me more..."],
  },
  INVALID_MONTH: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}The month you speak of lies beyond the celestial calendar...`,
      "Share a month the stars recognize—January through December.",
    ],
    name: (userName) => ["Something doesn't quite resonate..."],
    email: (userName) => ["The path seems unclear..."],
    freeform: (userName) => ["I sense confusion in the stars..."],
  },
  INVALID_DAY: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}That date exists in no calendar I have seen...`,
      "The cosmic records show no such day. Try again?",
    ],
    name: (userName) => ["Something feels off..."],
    email: (userName) => ["Let me see more clearly..."],
    freeform: (userName) => ["The numbers aren't quite right..."],
  },
  INVALID_YEAR: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}That year lies beyond the boundaries I can see...`,
      "Share a year within living memory—1900 to now.",
    ],
    name: (userName) => ["I'm having trouble seeing clearly..."],
    email: (userName) => ["The path isn't clear..."],
    freeform: (userName) => ["Something doesn't align..."],
  },
  IMPOSSIBLE_DATE: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}That date exists in no calendar I have seen...`,
      "The cosmic records show no such day. Try again?",
    ],
    name: (userName) => ["The vibrations don't quite harmonize..."],
    email: (userName) => ["I sense interference..."],
    freeform: (userName) => ["The cosmos seem puzzled..."],
  },
  FUTURE_DATE: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}Ah, a traveler from tomorrow?`,
      "That date hasn't arrived in this realm. I need the date of your birth—your past arrival, not a future journey.",
    ],
    name: (userName) => ["I sense something from another time..."],
    email: (userName) => ["The timeline doesn't align..."],
    freeform: (userName) => ["We must stay in the present..."],
  },
  INVALID_FORMAT: {
    date: (userName) => [
      `${getPersonalizedPrefix(userName)}The numbers shimmer but won't align into a birth date I can read.`,
      "Month, day, and year—how did you enter this world?",
    ],
    name: (userName) => [
      "Names hold power, but this one seems incomplete...",
      "Share your full birth name.",
    ],
    email: (userName) => [
      "I need a proper channel to reach you...",
      "Share your email so I may preserve your reading.",
    ],
    freeform: (userName) => ["Your words don't quite reach me..."],
  },
  TOO_SHORT: {
    date: (userName) => [`${getPersonalizedPrefix(userName)}The date feels incomplete...`],
    name: (userName) => [
      "A single letter cannot hold a soul's vibration.",
      "Share your full birth name—the one your parents chose.",
    ],
    email: (userName) => ["I need more to reach you..."],
    freeform: (userName) => ["Tell me more..."],
  },
  INVALID_CHARACTERS: {
    date: (userName) => [`${getPersonalizedPrefix(userName)}Strange symbols cloud my vision...`],
    name: (userName) => [
      "Your name's essence lives in its letters alone—numbers and symbols cloud my sight.",
      "Share the name as it was spoken at your birth.",
    ],
    email: (userName) => ["The path contains obstacles..."],
    freeform: (userName) => ["I sense interference in your message..."],
  },
};

/**
 * Get fallback mystical messages for a validation error
 */
export function getFallbackMysticalMessages(
  errorCode: ValidationErrorCode,
  expectedInput: ValidationContext['expectedInput'],
  userName?: string | null
): string[] {
  const messageGenerator = fallbackMessages[errorCode]?.[expectedInput];
  if (messageGenerator) {
    const messages = messageGenerator(userName);
    if (messages && messages.length > 0) {
      return messages;
    }
  }
  // Ultimate fallback - mystical voice maintained
  return [
    `${getPersonalizedPrefix(userName)}Your message carries energy I cannot decode for this purpose.`,
    getRedirectMessage(expectedInput),
  ];
}

/**
 * Get a redirect message based on what input is expected
 * All messages maintain the Oracle's mystical voice
 */
function getRedirectMessage(expectedInput: ValidationContext['expectedInput']): string {
  switch (expectedInput) {
    case 'date':
      return "The numbers await—when were you born?";
    case 'name':
      return "What is the name spoken at your birth?";
    case 'email':
      return "Where shall I send your cosmic reading?";
    case 'freeform':
      return "What would you like to explore?";
  }
}

/**
 * Generate curiosity-driven redirect messages based on the current phase.
 * Uses the Acknowledge -> Tease -> Redirect pattern to create "open loops"
 * that make users WANT to provide the requested information.
 *
 * @param phase - The current conversation phase
 * @param expectedInput - What type of input is expected
 * @param userName - User's name if available for personalization
 * @returns Array of mystical messages following the curiosity loop pattern
 */
export function getCuriosityRedirect(
  phase: ConversationPhase,
  expectedInput: ValidationContext['expectedInput'],
  userName?: string
): string[] {
  const phaseInstruction = getPhaseInstruction(phase);
  const teaser = phaseInstruction?.curiosityTeaser || '';

  // Pattern: Acknowledge -> Tease -> Redirect
  const templates: Record<ValidationContext['expectedInput'], string[]> = {
    date: [
      "Your spirit seeks answers beyond the moment...",
      teaser || "The numbers hold secrets about your path.",
      userName
        ? `But ${userName}, I need your birth date to unlock them. When were you born?`
        : "But first, I need the moment you entered this world. When were you born?"
    ],
    name: [
      "I sense the wandering of your thoughts...",
      teaser || "Your name vibrates with hidden meaning.",
      "Share your full birth name, and watch what the letters reveal."
    ],
    email: [
      "Your eagerness to know more pulses through the connection...",
      teaser || "Your complete cosmic blueprint awaits.",
      userName
        ? `Where shall I send your revelations, ${userName}?`
        : "Where shall I send your reading? Your email keeps it safe."
    ],
    freeform: [
      "I feel the currents of your mind pulling in many directions...",
      teaser || "The numbers will address everything in time.",
      "But first, tell me what calls to you most strongly right now."
    ],
  };

  return templates[expectedInput];
}

/**
 * Get phase-aware steering information to include in API calls
 */
export function getPhaseSteeringContext(phase: ConversationPhase): {
  steeringGuidance?: string;
  curiosityTeaser?: string;
} {
  const phaseInstruction = getPhaseInstruction(phase);
  return {
    steeringGuidance: phaseInstruction?.steeringGuidance,
    curiosityTeaser: phaseInstruction?.curiosityTeaser,
  };
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
  console.log('[mysticalValidation] getMysticalValidationMessages called:', context);

  // Get phase-specific curiosity redirect as base (includes teaser from phase)
  const curiosityRedirect = getCuriosityRedirect(
    context.phase,
    context.expectedInput,
    context.userName
  );

  // Use curiosity redirect for OFF_TOPIC, fallback messages for other errors
  const fallback =
    context.errorCode === 'OFF_TOPIC'
      ? curiosityRedirect
      : getFallbackMysticalMessages(context.errorCode, context.expectedInput, context.userName);

  console.log('[mysticalValidation] Fallback messages:', fallback);

  // Get steering context from phase instructions
  const steeringContext = getPhaseSteeringContext(context.phase);

  try {
    console.log('[mysticalValidation] Calling /api/oracle with validation mode...');
    const response = await fetchWithTimeout(
      '/api/oracle',
      {
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
            // Include steering context for AI to use
            curiosityTeaser: steeringContext.curiosityTeaser,
            steeringGuidance: steeringContext.steeringGuidance,
          },
          baseMessages: fallback,
        }),
      },
      8000 // 8 second timeout for validation
    );

    console.log('[mysticalValidation] API response status:', response.status);
    if (!response.ok) {
      console.warn('[mysticalValidation] Oracle API returned non-OK status:', response.status);
      return fallback;
    }

    const data = await response.json();
    console.log('[mysticalValidation] API response data:', data);

    // Check if messages array exists AND has content (empty array is truthy!)
    if (data.messages && data.messages.length > 0) {
      return data.messages;
    }
    console.log('[mysticalValidation] No messages from API, using fallback');
    return fallback;
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn('[mysticalValidation] Request timed out, using timeout fallback');
      return TIMEOUT_FALLBACKS.validation;
    }
    console.error('[mysticalValidation] Failed to get mystical validation messages:', error);
    return fallback;
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

/**
 * Validate that a message maintains the Oracle's mystical voice
 * This utility can be used to check messages before they're displayed
 *
 * @param message - The message to validate
 * @returns Object with isValid boolean and array of detected issues
 */
export function validateOracleVoice(message: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for technical language that breaks character
  const technicalPatterns = [
    { pattern: /\b(error|invalid|format|failed)\b/i, description: 'Technical error terminology' },
    { pattern: /\bplease\s+(enter|input|type|provide|submit)\b/i, description: 'Form-like request language' },
    { pattern: /\b(characters?|digits?|alphanumeric)\b/i, description: 'Technical character terminology' },
    { pattern: /\b(try again|retry|resubmit)\b/i, description: 'Technical retry language' },
    { pattern: /\bcannot be\s+(empty|blank|null)\b/i, description: 'Form validation language' },
    { pattern: /\brequired field\b/i, description: 'Form field language' },
    { pattern: /\bvalid\s+(email|date|name|format)\b/i, description: 'Validation terminology' },
  ];

  technicalPatterns.forEach(({ pattern, description }) => {
    if (pattern.test(message)) {
      issues.push(`Technical language detected: ${description}`);
    }
  });

  // Check for hedging language that undermines Oracle authority
  const hedgingPatterns = [
    { pattern: /\b(might|perhaps|possibly|maybe|could be|seems like)\b/i, description: 'Hedging/uncertainty' },
    { pattern: /\bI think\b/i, description: 'Uncertain phrasing' },
    { pattern: /\bnot sure\b/i, description: 'Uncertain phrasing' },
  ];

  hedgingPatterns.forEach(({ pattern, description }) => {
    if (pattern.test(message)) {
      issues.push(`Hedging language detected: ${description}`);
    }
  });

  // Check for AI-like phrasing that breaks character
  const aiPatterns = [
    { pattern: /\b(as an? ai|i'm designed|i should note|i cannot|i'm unable)\b/i, description: 'AI self-reference' },
    { pattern: /\b(language model|assistant|programmed|trained)\b/i, description: 'AI terminology' },
    { pattern: /\b(apologies|sorry for|unfortunately)\b/i, description: 'Apologetic/service language' },
  ];

  aiPatterns.forEach(({ pattern, description }) => {
    if (pattern.test(message)) {
      issues.push(`AI voice breaking character: ${description}`);
    }
  });

  // Check for overly casual modern language
  const casualPatterns = [
    { pattern: /\b(oops|uh oh|whoops|yikes)\b/i, description: 'Casual exclamation' },
    { pattern: /\b(gonna|wanna|gotta|kinda)\b/i, description: 'Casual contractions' },
    { pattern: /\b(cool|awesome|great|nice)\b/i, description: 'Modern casual adjectives' },
  ];

  casualPatterns.forEach(({ pattern, description }) => {
    if (pattern.test(message)) {
      issues.push(`Casual language detected: ${description}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Get timeout recovery messages with personalization
 */
export function getTimeoutRecoveryMessages(
  type: 'general' | 'withRetry' | 'final',
  userName?: string | null
): string[] {
  const timeoutMessages: Record<'general' | 'withRetry' | 'final', string[]> = {
    general: [
      "The cosmic connection wavers...",
      "Let me reach through the veil once more.",
    ],
    withRetry: [
      "The stars flicker but do not fade.",
      "Give me a moment to restore our connection...",
    ],
    final: [
      "The universe asks for patience today.",
      "Share your answer again, and I will find clarity.",
    ],
  };

  const messages = [...timeoutMessages[type]];

  // Personalize the first message if we have a name
  if (userName && messages.length > 0) {
    const firstName = userName.split(' ')[0];
    messages[0] = `${firstName}, ${messages[0].charAt(0).toLowerCase()}${messages[0].slice(1)}`;
  }

  return messages;
}

/**
 * Get error recovery messages for API failures
 * These maintain the mystical voice while acknowledging a disruption
 */
export function getErrorRecoveryMessages(userName?: string | null): string[] {
  const prefix = getPersonalizedPrefix(userName);
  return [
    `${prefix}The cosmic threads momentarily tangled...`,
    "But your path remains clear. Speak to me once more.",
  ];
}
