import { create } from 'zustand';
import {
  calculateLifePath,
  calculateExpression,
  calculateSoulUrge,
  calculatePersonality,
  calculateBirthdayNumber,
  calculateCompatibility,
  getLifePathCalculationSteps,
} from '@/lib/numerology';
import type { ConversationPhase } from '@/lib/phaseConfig';

// Re-export the phase type for convenience
export type { ConversationPhase } from '@/lib/phaseConfig';

export type MessageType = 'oracle' | 'user' | 'system' | 'number-reveal' | 'calculation' | 'letter-transform';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  metadata?: {
    number?: number;
    calculationSteps?: ReturnType<typeof getLifePathCalculationSteps>;
    isPartOfSequence?: boolean;
    typingDuration?: number; // Duration for typing animation in ms
    visualization?: 'constellation' | 'sacred-geometry' | 'letter-transform' | 'compatibility';
    // For letter-transform message type
    letterTransform?: {
      name: string;
      number: number;
      label: string;
      numberType: 'expression' | 'soul-urge' | 'personality';
    };
  };
}

export interface UserProfile {
  dob: Date | null;
  fullName: string | null;
  email: string | null;
  lifePath: number | null;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  birthdayNumber: number | null;
}

export interface OtherPerson {
  name: string;
  dob: Date | null;
  lifePath: number | null;
}

export interface DynamicSuggestions {
  suggestions: string[];
  isLoading: boolean;
  lastOracleQuestion: string | null;
}

export interface ConversationState {
  phase: ConversationPhase;
  messages: Message[];
  userProfile: UserProfile;
  otherPerson: OtherPerson | null;
  compatibility: ReturnType<typeof calculateCompatibility> | null;
  isTyping: boolean;
  hasPaid: boolean;
  paidTier: number | null;
  dynamicSuggestions: DynamicSuggestions;

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addOracleMessages: (contents: string[], delayMs?: number) => Promise<void>;
  addOracleMessageWithDuration: (content: string, typingDuration: number) => void;
  setPhase: (phase: ConversationPhase) => void;
  setUserDOB: (dob: Date) => void;
  setUserName: (name: string) => void;
  setOtherPerson: (name: string, dob?: Date) => void;
  setOtherPersonDOB: (dob: Date) => void;
  setUserEmail: (email: string) => void;
  calculateUserNumbers: () => void;
  calculateCompatibilityScore: () => void;
  setTyping: (isTyping: boolean) => void;
  setPaid: (tier: number) => void;
  setDynamicSuggestions: (suggestions: string[], oracleQuestion?: string) => void;
  clearDynamicSuggestions: () => void;
  reset: () => void;
}

const initialUserProfile: UserProfile = {
  dob: null,
  fullName: null,
  email: null,
  lifePath: null,
  expression: null,
  soulUrge: null,
  personality: null,
  birthdayNumber: null,
};

const initialDynamicSuggestions: DynamicSuggestions = {
  suggestions: [],
  isLoading: false,
  lastOracleQuestion: null,
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  phase: 'opening',
  messages: [],
  userProfile: initialUserProfile,
  otherPerson: null,
  compatibility: null,
  isTyping: false,
  hasPaid: false,
  paidTier: null,
  dynamicSuggestions: initialDynamicSuggestions,

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  addOracleMessages: async (contents, delayMs = 1500) => {
    const { addMessage, setTyping } = get();

    for (let i = 0; i < contents.length; i++) {
      setTyping(true);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      setTyping(false);

      addMessage({
        type: 'oracle',
        content: contents[i],
        metadata: { isPartOfSequence: contents.length > 1 },
      });

      // Small delay between messages in a sequence
      if (i < contents.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  },

  // Add a single oracle message with voiceover support
  addOracleMessageWithDuration: (content: string, typingDuration: number) => {
    const { addMessage } = get();
    addMessage({
      type: 'oracle',
      content,
      metadata: { typingDuration },
    });
  },

  setPhase: (phase) => set({ phase }),

  setUserDOB: (dob) => {
    const lifePath = calculateLifePath(dob);
    const birthdayNumber = calculateBirthdayNumber(dob);
    const calculationSteps = getLifePathCalculationSteps(dob);

    set((state) => ({
      userProfile: {
        ...state.userProfile,
        dob,
        lifePath,
        birthdayNumber,
      },
    }));

    // Calculation visualization is now added manually in ChatContainer after Life Path reveal
  },

  setUserName: (name) => {
    const expression = calculateExpression(name);
    const soulUrge = calculateSoulUrge(name);
    const personality = calculatePersonality(name);

    set((state) => ({
      userProfile: {
        ...state.userProfile,
        fullName: name,
        expression,
        soulUrge,
        personality,
      },
    }));
  },

  setOtherPerson: (name, dob) => {
    const lifePath = dob ? calculateLifePath(dob) : null;
    set({
      otherPerson: {
        name,
        dob: dob || null,
        lifePath,
      },
    });
  },

  setOtherPersonDOB: (dob) => {
    const lifePath = calculateLifePath(dob);
    set((state) => ({
      otherPerson: state.otherPerson
        ? { ...state.otherPerson, dob, lifePath }
        : null,
    }));
  },

  setUserEmail: (email) => {
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        email,
      },
    }));
  },

  calculateUserNumbers: () => {
    const { userProfile } = get();
    if (!userProfile.dob) return;

    const lifePath = calculateLifePath(userProfile.dob);
    const birthdayNumber = calculateBirthdayNumber(userProfile.dob);

    let expression = null;
    let soulUrge = null;
    let personality = null;

    if (userProfile.fullName) {
      expression = calculateExpression(userProfile.fullName);
      soulUrge = calculateSoulUrge(userProfile.fullName);
      personality = calculatePersonality(userProfile.fullName);
    }

    set((state) => ({
      userProfile: {
        ...state.userProfile,
        lifePath,
        birthdayNumber,
        expression,
        soulUrge,
        personality,
      },
    }));
  },

  calculateCompatibilityScore: () => {
    const { userProfile, otherPerson } = get();
    if (!userProfile.lifePath || !otherPerson?.lifePath) return;

    const compatibility = calculateCompatibility(
      userProfile.lifePath,
      otherPerson.lifePath
    );

    set({ compatibility });
  },

  setTyping: (isTyping) => set({ isTyping }),

  setPaid: (tier) => set({ hasPaid: true, paidTier: tier }),

  setDynamicSuggestions: (suggestions, oracleQuestion) =>
    set((state) => ({
      dynamicSuggestions: {
        suggestions,
        isLoading: false,
        lastOracleQuestion: oracleQuestion || state.dynamicSuggestions.lastOracleQuestion,
      },
    })),

  clearDynamicSuggestions: () =>
    set({
      dynamicSuggestions: initialDynamicSuggestions,
    }),

  reset: () =>
    set({
      phase: 'opening',
      messages: [],
      userProfile: initialUserProfile,
      otherPerson: null,
      compatibility: null,
      isTyping: false,
      hasPaid: false,
      paidTier: null,
      dynamicSuggestions: initialDynamicSuggestions,
    }),
}));
