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
  extractedOtherName?: string;
  extractedRelationship?: string;
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
/**
 * Generate AI-personalized critical date explanation
 */
export async function getAICriticalDateExplanation(
  date: Date,
  type: string,
  baseDescription: string,
  context: UserContext
): Promise<string> {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'criticalDate',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase: 'critical_date',
        baseMessages: [],
        criticalDate: {
          date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          type,
          baseDescription,
        },
      }),
    });

    if (!response.ok) {
      return baseDescription;
    }

    const data = await response.json();
    return data.explanation || baseDescription;
  } catch (error) {
    console.error('[getAICriticalDateExplanation] Error:', error);
    return baseDescription;
  }
}

/**
 * Generate AI-personalized year ahead prediction
 */
export async function getAIYearAheadPrediction(
  personalYear: number,
  context: UserContext
): Promise<{
  theme: string;
  opportunities: string;
  challenges: string;
  full: string;
}> {
  const fallback = {
    theme: `Your Personal Year ${personalYear} brings a time of ${getPersonalYearTheme(personalYear)}.`,
    opportunities: 'New opportunities aligned with your life path will emerge.',
    challenges: 'Stay aware of your tendencies and navigate challenges with wisdom.',
    full: '',
  };
  fallback.full = `${fallback.theme}\n\n${fallback.opportunities}\n\n${fallback.challenges}`;

  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'yearAhead',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase: 'year_ahead',
        baseMessages: [],
        yearAhead: {
          personalYear,
        },
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    return data.prediction || fallback;
  } catch (error) {
    console.error('[getAIYearAheadPrediction] Error:', error);
    return fallback;
  }
}

/**
 * Generate AI-personalized relationship advice
 */
export async function getAIRelationshipAdvice(
  context: UserContext,
  otherName: string,
  otherLifePath: number,
  compatibility: {
    score: number;
    level: string;
    areas: {
      communication: number;
      emotional: number;
      physical: number;
      longTerm: number;
    };
  }
): Promise<string> {
  const fallback = `The connection between Life Path ${context.lifePath} and ${otherLifePath} carries both harmony and challenge. Your bond has the potential for depth, but requires awareness and effort.`;

  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'relationshipAdvice',
        context: {
          userName: context.userName || undefined,
          lifePath: context.lifePath || undefined,
          expression: context.expression || undefined,
          soulUrge: context.soulUrge || undefined,
        },
        phase: 'relationship_advice',
        baseMessages: [],
        relationshipAdvice: {
          otherName,
          otherLifePath,
          compatibilityScore: compatibility.score,
          compatibilityLevel: compatibility.level,
          areas: compatibility.areas,
        },
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    return data.advice?.full || fallback;
  } catch (error) {
    console.error('[getAIRelationshipAdvice] Error:', error);
    return fallback;
  }
}

function getPersonalYearTheme(year: number): string {
  const themes: Record<number, string> = {
    1: 'new beginnings and self-discovery',
    2: 'partnerships and patience',
    3: 'creativity and self-expression',
    4: 'building foundations and discipline',
    5: 'change and adventure',
    6: 'responsibility and nurturing',
    7: 'introspection and spiritual growth',
    8: 'abundance and personal power',
    9: 'completion and letting go',
    11: 'spiritual awakening and intuition',
    22: 'manifesting grand visions',
    33: 'teaching and healing others',
  };
  return themes[year] || 'transformation';
}

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
