/**
 * useDynamicSuggestions - Hook for AI-generated suggestion cards
 *
 * Instead of static phase-based suggestions, this hook generates
 * personalized suggestions based on:
 * - User's numerology numbers
 * - Current conversation context
 * - The specific question Oracle just asked
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import type { ConversationPhase } from '@/lib/phaseConfig';
import { shouldShowSuggestions } from '@/lib/phaseConfig';

interface DynamicSuggestionsState {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

interface UseDynamicSuggestionsReturn extends DynamicSuggestionsState {
  /** Generate new suggestions based on current context */
  generateSuggestions: (oracleQuestion: string) => Promise<void>;
  /** Clear current suggestions */
  clearSuggestions: () => void;
  /** Whether suggestions should be visible based on phase config */
  shouldShow: boolean;
}

/**
 * Fallback suggestions for each phase when API is unavailable
 */
const fallbackSuggestions: Partial<Record<ConversationPhase, string[]>> = {
  oracle_question_1: [
    'Tell me more about this number',
    'What does this mean for my life?',
    'I want to understand myself better',
  ],
  oracle_question_2: [
    'What about my love life?',
    'What career suits me?',
    "What's blocking my success?",
  ],
  oracle_question_other_person: [
    'Yes, someone keeps appearing in my thoughts',
    'Tell me about my relationships',
    'I want to understand someone better',
  ],
  oracle_question_relationship: [
    'Tell me about our connection',
    'What challenges do we face?',
    'Is this meant to be?',
  ],
  oracle_final_question: [
    'Show me my complete reading',
    'What else can you reveal?',
    'I want to know everything',
  ],
  paywall: [
    'Unlock My Complete Reading',
    'Reveal Our Compatibility',
    'Maybe later',
  ],
  paid_reading: [
    'Tell me about my year ahead',
    'What about another person?',
    'Explain my soul urge',
  ],
};

export function useDynamicSuggestions(): UseDynamicSuggestionsReturn {
  const [state, setState] = useState<DynamicSuggestionsState>({
    suggestions: [],
    isLoading: false,
    error: null,
  });

  const { phase, userProfile, otherPerson, compatibility } = useConversationStore();

  // Track the last phase and question to avoid duplicate API calls
  const lastRequest = useRef<{ phase: string; question: string } | null>(null);

  const shouldShow = shouldShowSuggestions(phase);

  /**
   * Generate personalized suggestions via Oracle API
   */
  const generateSuggestions = useCallback(
    async (oracleQuestion: string) => {
      // Skip if suggestions shouldn't be shown for this phase
      if (!shouldShowSuggestions(phase)) {
        setState({ suggestions: [], isLoading: false, error: null });
        return;
      }

      // Skip if this is the same request as last time
      if (
        lastRequest.current?.phase === phase &&
        lastRequest.current?.question === oracleQuestion
      ) {
        return;
      }

      lastRequest.current = { phase, question: oracleQuestion };

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/oracle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: 'suggestions',
            context: {
              userName: userProfile.fullName,
              lifePath: userProfile.lifePath,
              expression: userProfile.expression,
              soulUrge: userProfile.soulUrge,
              otherPersonName: otherPerson?.name,
              otherLifePath: otherPerson?.lifePath,
              compatibilityScore: compatibility?.score,
            },
            phase,
            baseMessages: [], // Not used for suggestions mode
            suggestions: {
              oracleQuestion,
              count: 3,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          setState({
            suggestions: data.suggestions,
            isLoading: false,
            error: null,
          });
        } else {
          // Fall back to phase-based suggestions
          const fallback = fallbackSuggestions[phase] || [];
          setState({
            suggestions: fallback,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        // Fall back to phase-based suggestions
        const fallback = fallbackSuggestions[phase] || [];
        setState({
          suggestions: fallback,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [phase, userProfile, otherPerson, compatibility]
  );

  /**
   * Clear current suggestions
   */
  const clearSuggestions = useCallback(() => {
    setState({ suggestions: [], isLoading: false, error: null });
    lastRequest.current = null;
  }, []);

  // Clear suggestions when phase changes to a non-suggestion phase
  useEffect(() => {
    if (!shouldShowSuggestions(phase)) {
      setState({ suggestions: [], isLoading: false, error: null });
    }
  }, [phase]);

  return {
    ...state,
    generateSuggestions,
    clearSuggestions,
    shouldShow,
  };
}

/**
 * Get fallback suggestions for a phase
 * Useful for immediate display while AI suggestions load
 */
export function getFallbackSuggestions(phase: ConversationPhase): string[] {
  return fallbackSuggestions[phase] || [];
}
