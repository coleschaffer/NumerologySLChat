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
import { fetchWithTimeout, isTimeoutError } from '@/lib/fetchWithTimeout';

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
 * These MUST directly answer the specific Oracle question for each phase
 * NOT follow-up questions - these are ANSWERS the user might give
 */
const fallbackSuggestions: Partial<Record<ConversationPhase, string[]>> = {
  // Oracle asks: "What aspect of your life feels most affected by this energy?"
  oracle_question_1: [
    'My relationships feel most affected',
    'My career and sense of purpose',
    'My inner peace and confidence',
  ],
  // Oracle asks: "Have you ever felt drawn to certain skills or abilities?"
  oracle_question_2: [
    'Yes, creativity and self-expression',
    'Leadership and inspiring others',
    'Intuition and understanding people',
  ],
  // Oracle asks: "Who keeps appearing in your thoughts?"
  oracle_question_other_person: [
    'Someone I care about deeply',
    'A romantic connection',
    "I'd rather focus on myself",
  ],
  // Oracle asks: "What draws you to understand this connection?"
  oracle_question_relationship: [
    'I want to understand us better',
    "There's tension I can't explain",
    'I feel drawn to them strongly',
  ],
  // Oracle asks: "What is the one question burning in your heart?"
  oracle_final_question: [
    'Will I find true love?',
    'Am I on the right path?',
    'What is my true purpose?',
  ],
  // Paywall - these are action buttons, not answers
  paywall: [
    'Unlock My Complete Reading',
    'Reveal Our Compatibility',
    'Maybe later',
  ],
  // Post-paywall reading questions
  paid_reading: [
    'Tell me about my year ahead',
    'Reveal more about my soul urge',
    'What challenges await me?',
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
        const response = await fetchWithTimeout(
          '/api/oracle',
          {
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
          },
          5000 // 5 second timeout for suggestions - they're less critical
        );

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
        if (isTimeoutError(error)) {
          console.warn('[useDynamicSuggestions] Request timed out, using fallback suggestions');
        } else {
          console.error('Failed to generate suggestions:', error);
        }
        // Fall back to phase-based suggestions
        const fallback = fallbackSuggestions[phase] || [];
        setState({
          suggestions: fallback,
          isLoading: false,
          error: isTimeoutError(error) ? 'timeout' : (error instanceof Error ? error.message : 'Unknown error'),
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
