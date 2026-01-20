/**
 * useAIInterpretation - Hook for AI-generated personalized numerology interpretations
 *
 * Instead of static interpretations, this generates unique readings
 * based on the user's complete numerology profile.
 */

import { useCallback } from 'react';
import { getLifePathInterpretation } from '@/lib/interpretations';

interface UserContext {
  userName?: string | null;
  lifePath?: number | null;
  expression?: number | null;
  soulUrge?: number | null;
}

interface AIInterpretation {
  title: string;
  shortDescription: string;
  coreDescription: string;
}

interface InterpretationResult {
  interpretation: AIInterpretation;
  isAIGenerated: boolean;
}

/**
 * Fetch an AI-generated interpretation from the Oracle API
 */
async function fetchAIInterpretation(
  numberType: 'lifePath' | 'expression' | 'soulUrge' | 'compatibility',
  number: number,
  context: UserContext
): Promise<AIInterpretation | null> {
  // Get the base interpretation to use as a starting point
  const baseInterp = getLifePathInterpretation(number);
  if (!baseInterp) return null;

  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'interpret',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase: 'interpretation',
        baseMessages: [],
        interpret: {
          numberType,
          number,
          baseInterpretation: {
            name: baseInterp.name,
            shortDescription: baseInterp.shortDescription,
            coreDescription: baseInterp.coreDescription,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('[useAIInterpretation] API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.interpretation) {
      return data.interpretation;
    }

    return null;
  } catch (error) {
    console.error('[useAIInterpretation] Failed to fetch:', error);
    return null;
  }
}

/**
 * Hook to get AI-generated interpretations with fallback to static
 */
export function useAIInterpretation() {
  /**
   * Get an interpretation for a number - tries AI first, falls back to static
   */
  const getInterpretation = useCallback(async (
    numberType: 'lifePath' | 'expression' | 'soulUrge' | 'compatibility',
    number: number,
    context: UserContext
  ): Promise<InterpretationResult | null> => {
    // Get static interpretation as fallback
    const staticInterp = getLifePathInterpretation(number);
    if (!staticInterp) return null;

    // Try to get AI interpretation
    const aiInterp = await fetchAIInterpretation(numberType, number, context);

    if (aiInterp && aiInterp.title && aiInterp.coreDescription) {
      return {
        interpretation: aiInterp,
        isAIGenerated: true,
      };
    }

    // Fallback to static
    return {
      interpretation: {
        title: `Life Path ${number}. ${staticInterp.name}.`,
        shortDescription: staticInterp.shortDescription,
        coreDescription: staticInterp.coreDescription,
      },
      isAIGenerated: false,
    };
  }, []);

  return { getInterpretation };
}

/**
 * Generate AI-personalized Oracle response to user input
 */
export async function getAIAcknowledgment(
  userInput: string,
  context: UserContext,
  phase: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'enhance',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase,
        baseMessages: [
          "I hear the truth in your words...",
          "Your awareness is shifting.",
        ],
        userInput,
      }),
    });

    if (!response.ok) {
      return ["I sense the depth of what you've shared...", "Your words carry weight."];
    }

    const data = await response.json();
    return data.messages || ["I sense the depth of what you've shared...", "Your words carry weight."];
  } catch (error) {
    console.error('[getAIAcknowledgment] Error:', error);
    return ["I sense the depth of what you've shared...", "Your words carry weight."];
  }
}

/**
 * Generate AI-personalized transition messages
 */
export async function getAITransition(
  fromPhase: string,
  toPhase: string,
  context: UserContext,
  baseMessages: string[]
): Promise<string[]> {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'enhance',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase: `${fromPhase}_to_${toPhase}`,
        baseMessages,
      }),
    });

    if (!response.ok) {
      return baseMessages;
    }

    const data = await response.json();
    return data.messages || baseMessages;
  } catch (error) {
    console.error('[getAITransition] Error:', error);
    return baseMessages;
  }
}
