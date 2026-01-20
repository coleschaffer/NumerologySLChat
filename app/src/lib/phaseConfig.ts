/**
 * Phase Configuration - Defines behavior for each conversation phase
 *
 * This centralizes all phase-specific logic including:
 * - Input visibility (when to show text input)
 * - Suggestion visibility (when to show suggestion cards)
 * - Input types and placeholders
 * - Validation requirements
 */

export type ConversationPhase =
  | 'opening'
  | 'collecting_dob'
  | 'revealing_birth_numbers'
  | 'filler_birth'
  | 'revealing_life_path'
  | 'oracle_question_1'
  | 'filler_to_expression'
  | 'collecting_name'
  | 'revealing_expression'
  | 'oracle_question_2'
  | 'filler_to_soul_urge'
  | 'revealing_soul_urge'
  | 'oracle_question_other_person'
  | 'collecting_other_info'
  | 'filler_relationship'
  | 'oracle_question_relationship'
  | 'collecting_other_dob'
  | 'filler_compatibility'
  | 'revealing_compatibility'
  | 'collecting_email'
  | 'preparing_report'
  | 'oracle_final_question'
  | 'paywall'
  | 'paid_reading';

export interface PhaseConfig {
  /** Whether to show the text input field */
  showInput: boolean;
  /** Whether to show AI-generated suggestion cards */
  showSuggestions: boolean;
  /** Type of input expected */
  inputType: 'text' | 'email' | 'date' | 'name' | 'none';
  /** Placeholder text for the input */
  placeholder: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Validation type required */
  validation: 'date' | 'email' | 'name' | 'freeform' | 'none';
  /** Whether Oracle is speaking (no interruptions) */
  oracleSpeaking: boolean;
  /** Whether this phase expects a user response */
  expectsResponse: boolean;
  /** Description for debugging/logging */
  description: string;
}

export const phaseConfigs: Record<ConversationPhase, PhaseConfig> = {
  opening: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle opens with mystical hook',
  },

  collecting_dob: {
    showInput: true,
    showSuggestions: true,
    inputType: 'date',
    placeholder: 'Type your birthday (e.g., March 15, 1990)...',
    helperText: 'e.g., "March 15, 1990" or "3/15/1990"',
    validation: 'date',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Collecting user birth date',
  },

  revealing_birth_numbers: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Calculation animation for birth numbers',
  },

  filler_birth: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle builds anticipation after birth number reveal',
  },

  revealing_life_path: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Life Path number reveal with visualization',
  },

  oracle_question_1: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Type your response...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Oracle asks engaging question about life path',
  },

  filler_to_expression: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle transitions to Expression number',
  },

  collecting_name: {
    showInput: true,
    showSuggestions: true,
    inputType: 'name',
    placeholder: 'Enter your full birth name...',
    helperText: 'Use the name on your birth certificate',
    validation: 'name',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Collecting user full birth name',
  },

  revealing_expression: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Expression number reveal with letter visualization',
  },

  oracle_question_2: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Type your response...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Oracle asks about talents and expression',
  },

  filler_to_soul_urge: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle transitions to Soul Urge number',
  },

  revealing_soul_urge: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Soul Urge number reveal',
  },

  oracle_question_other_person: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Type your response...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Oracle asks about someone on their mind',
  },

  collecting_other_info: {
    showInput: true,
    showSuggestions: true,
    inputType: 'name',
    placeholder: "Enter their name...",
    validation: 'name',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Collecting other person name',
  },

  filler_relationship: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle builds intrigue about the connection',
  },

  oracle_question_relationship: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Type your response...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Oracle asks about the relationship',
  },

  collecting_other_dob: {
    showInput: true,
    showSuggestions: true,
    inputType: 'date',
    placeholder: 'Type their birthday...',
    helperText: 'e.g., "March 15, 1990" or "3/15/1990"',
    validation: 'date',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Collecting other person birth date',
  },

  filler_compatibility: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle builds anticipation for compatibility reveal',
  },

  revealing_compatibility: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Compatibility reveal with dual orb visualization',
  },

  collecting_email: {
    showInput: true,
    showSuggestions: false,
    inputType: 'email',
    placeholder: 'Enter your email address...',
    helperText: 'Your reading will be saved and sent to this address',
    validation: 'email',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Collecting user email',
  },

  preparing_report: {
    showInput: false,
    showSuggestions: false,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: true,
    expectsResponse: false,
    description: 'Oracle prepares the full report',
  },

  oracle_final_question: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Type your response...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Oracle asks final engaging question before paywall',
  },

  paywall: {
    showInput: false,
    showSuggestions: true,
    inputType: 'none',
    placeholder: '',
    validation: 'none',
    oracleSpeaking: false,
    expectsResponse: false,
    description: 'Paywall with unlock options',
  },

  paid_reading: {
    showInput: true,
    showSuggestions: true,
    inputType: 'text',
    placeholder: 'Ask the Oracle anything...',
    validation: 'freeform',
    oracleSpeaking: false,
    expectsResponse: true,
    description: 'Full paid reading experience',
  },
};

/**
 * Get configuration for a specific phase
 */
export function getPhaseConfig(phase: ConversationPhase): PhaseConfig {
  return phaseConfigs[phase];
}

/**
 * Check if input should be visible for the current phase
 */
export function shouldShowInput(phase: ConversationPhase): boolean {
  return phaseConfigs[phase].showInput;
}

/**
 * Check if suggestions should be visible for the current phase
 */
export function shouldShowSuggestions(phase: ConversationPhase): boolean {
  return phaseConfigs[phase].showSuggestions;
}

/**
 * Get the validation type for the current phase
 */
export function getValidationType(phase: ConversationPhase): PhaseConfig['validation'] {
  return phaseConfigs[phase].validation;
}

/**
 * Check if Oracle is speaking (no interruptions allowed)
 */
export function isOracleSpeaking(phase: ConversationPhase): boolean {
  return phaseConfigs[phase].oracleSpeaking;
}

/**
 * Ordered list of phases for the conversation flow
 */
export const phaseOrder: ConversationPhase[] = [
  'opening',
  'collecting_dob',
  'revealing_birth_numbers',
  'filler_birth',
  'revealing_life_path',
  'oracle_question_1',
  'filler_to_expression',
  'collecting_name',
  'revealing_expression',
  'oracle_question_2',
  'filler_to_soul_urge',
  'revealing_soul_urge',
  'oracle_question_other_person',
  'collecting_other_info',
  'filler_relationship',
  'oracle_question_relationship',
  'collecting_other_dob',
  'filler_compatibility',
  'revealing_compatibility',
  'collecting_email',
  'preparing_report',
  'oracle_final_question',
  'paywall',
  'paid_reading',
];

/**
 * Get the next phase in the sequence
 */
export function getNextPhase(currentPhase: ConversationPhase): ConversationPhase | null {
  const currentIndex = phaseOrder.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    return null;
  }
  return phaseOrder[currentIndex + 1];
}
