import type { ConversationPhase } from './phaseConfig';

/**
 * AI Phase Instructions
 *
 * These instructions tell the AI what to accomplish at each phase.
 * The AI generates the actual words while these define the goals.
 */

export interface PhaseInstruction {
  /** What the AI should accomplish in this phase */
  goal: string;
  /** Specific guidelines for the response */
  guidelines: string[];
  /** Example of the tone/style expected */
  toneExample?: string;
  /** Whether this phase involves revealing numbers (AI should use provided values) */
  revealsNumbers?: boolean;
  /** Number of messages to generate (for multi-message sequences) */
  messageCount?: number;
}

export const AI_PHASE_INSTRUCTIONS: Record<ConversationPhase, PhaseInstruction> = {
  opening: {
    goal: 'Welcome the user and build intrigue about numerology',
    guidelines: [
      'Create a mystical, welcoming atmosphere',
      'Hint that you can see patterns in numbers that reveal deep truths',
      'Build curiosity about what their birth date reveals',
      'End by asking for their complete birth date',
    ],
    toneExample: 'The cosmos stir as you arrive... I sense patterns awaiting discovery.',
    messageCount: 3,
  },

  collecting_dob: {
    goal: 'User enters their birth date - no AI response needed until they submit',
    guidelines: [
      'This is a collection phase - wait for user input',
    ],
    messageCount: 0,
  },

  revealing_birth_numbers: {
    goal: 'React to receiving the birth date with wonder',
    guidelines: [
      'Express that the numbers are beginning to align',
      'Create anticipation for the calculation',
      'Keep it brief - the visual calculation will follow',
    ],
    messageCount: 1,
  },

  filler_birth: {
    goal: 'Build anticipation after birth number calculation',
    guidelines: [
      'Express awe at what the numbers reveal',
      'Tease the significance of their Life Path number',
      'Create suspense before the reveal',
    ],
    messageCount: 2,
  },

  revealing_life_path: {
    goal: 'Dramatically reveal and interpret the Life Path number',
    guidelines: [
      'Use the provided lifePathNumber - do NOT make up a number',
      'Reveal the number with gravitas',
      'Give a compelling interpretation of this number',
      'Make them feel seen and understood',
      'Hint at deeper layers yet to uncover',
    ],
    revealsNumbers: true,
    messageCount: 3,
  },

  oracle_question_1: {
    goal: 'Ask an engaging question about their Life Path',
    guidelines: [
      'Reference their specific Life Path number traits',
      'Ask a thought-provoking question about their life experience',
      'The question should feel personally relevant',
      'End with a clear question that invites a response',
    ],
    messageCount: 1,
  },

  filler_to_expression: {
    goal: 'Respond to their answer and transition to name/Expression number',
    guidelines: [
      'Acknowledge their response meaningfully',
      'Bridge to the next revelation (Expression number)',
      'Explain that names carry vibrational energy',
      'Ask for their full birth name',
    ],
    messageCount: 2,
  },

  collecting_name: {
    goal: 'User enters their name - no AI response needed until they submit',
    guidelines: [
      'This is a collection phase - wait for user input',
    ],
    messageCount: 0,
  },

  revealing_expression: {
    goal: 'Reveal and interpret the Expression number',
    guidelines: [
      'Use the provided expressionNumber - do NOT make up a number',
      'Reference their actual name in the reveal',
      'Explain what the Expression number represents (outward talents)',
      'Connect it to their Life Path for a richer picture',
    ],
    revealsNumbers: true,
    messageCount: 2,
  },

  oracle_question_2: {
    goal: 'Ask about their talents and how they express themselves',
    guidelines: [
      'Reference the Expression number meaning',
      'Ask about their creative or professional expression',
      'Make them reflect on their unique gifts',
    ],
    messageCount: 1,
  },

  filler_to_soul_urge: {
    goal: 'Transition to the Soul Urge number',
    guidelines: [
      'Acknowledge their response',
      'Introduce the Soul Urge as the deepest layer',
      'Explain this reveals their heart\'s true desires',
    ],
    messageCount: 2,
  },

  revealing_soul_urge: {
    goal: 'Reveal the Soul Urge number with emotional depth',
    guidelines: [
      'Use the provided soulUrgeNumber - do NOT make up a number',
      'This is the most intimate number - treat it with reverence',
      'Speak to their inner motivations and desires',
      'Create a moment of profound recognition',
    ],
    revealsNumbers: true,
    messageCount: 2,
  },

  oracle_question_other_person: {
    goal: 'Ask about someone on their mind',
    guidelines: [
      'Sense that there\'s someone they\'re thinking about',
      'Could be romantic partner, family member, friend',
      'Ask if there\'s someone whose connection they want to understand',
      'Make it feel like natural intuition, not forced',
    ],
    messageCount: 1,
  },

  collecting_other_info: {
    goal: 'User enters the other person\'s name - wait for input',
    guidelines: [
      'This is a collection phase - wait for user input',
    ],
    messageCount: 0,
  },

  filler_relationship: {
    goal: 'Build intrigue about the connection',
    guidelines: [
      'Reference the other person by name',
      'Hint that you sense the energy between them',
      'Create curiosity about what the numbers will reveal',
    ],
    messageCount: 2,
  },

  oracle_question_relationship: {
    goal: 'Ask about the nature of this relationship',
    guidelines: [
      'Ask what they\'d like to understand about this connection',
      'Offer possibilities: harmony, challenges, deeper purpose',
      'Make them reflect on what draws them to this person',
    ],
    messageCount: 1,
  },

  collecting_other_dob: {
    goal: 'User enters the other person\'s birth date - wait for input',
    guidelines: [
      'This is a collection phase - wait for user input',
    ],
    messageCount: 0,
  },

  filler_compatibility: {
    goal: 'Build anticipation for compatibility reveal',
    guidelines: [
      'Express that the numbers are aligning',
      'Create suspense about what the compatibility will show',
      'Reference both people by name if available',
    ],
    messageCount: 2,
  },

  revealing_compatibility: {
    goal: 'Reveal compatibility insights',
    guidelines: [
      'Use the provided compatibility data - do NOT make up scores',
      'Present the overall compatibility meaningfully',
      'Highlight one strength and one growth area',
      'End with hope and empowerment regardless of score',
    ],
    revealsNumbers: true,
    messageCount: 3,
  },

  collecting_email: {
    goal: 'User enters their email - wait for input',
    guidelines: [
      'This is a collection phase - wait for user input',
    ],
    messageCount: 0,
  },

  preparing_report: {
    goal: 'Create excitement about the full report',
    guidelines: [
      'Mention the deep insights they\'ve uncovered',
      'Tease what the full report contains',
      'Build value for what comes next',
    ],
    messageCount: 2,
  },

  oracle_final_question: {
    goal: 'Ask a final profound question before the paywall',
    guidelines: [
      'Ask what aspect they most want to explore deeper',
      'Reference the key numbers revealed',
      'Create desire for the complete reading',
    ],
    messageCount: 1,
  },

  paywall: {
    goal: 'The paywall is shown - no additional AI message needed',
    guidelines: [
      'Paywall UI handles this phase',
    ],
    messageCount: 0,
  },

  paid_reading: {
    goal: 'Provide the full paid reading experience',
    guidelines: [
      'Deliver on the promise of deep insights',
      'Reference all their numbers comprehensively',
      'Provide actionable guidance',
      'Answer any questions they have',
    ],
    messageCount: 4,
  },
};

/**
 * Get the AI instruction for a specific phase
 */
export function getPhaseInstruction(phase: ConversationPhase): PhaseInstruction {
  return AI_PHASE_INSTRUCTIONS[phase];
}

/**
 * Check if the phase reveals numbers (AI should use provided values)
 */
export function phaseRevealsNumbers(phase: ConversationPhase): boolean {
  return AI_PHASE_INSTRUCTIONS[phase].revealsNumbers ?? false;
}
