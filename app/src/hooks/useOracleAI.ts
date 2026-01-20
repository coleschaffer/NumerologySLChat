import { useConversationStore } from '@/store/conversationStore';

interface OracleContext {
  lifePath?: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
  birthdayNumber?: number;
  userName?: string;
  otherPersonName?: string;
  otherLifePath?: number;
  compatibilityScore?: number;
  compatibilityLevel?: string;
}

export function useOracleAI() {
  const { userProfile, otherPerson, compatibility, phase } = useConversationStore();

  const getContext = (): OracleContext => ({
    lifePath: userProfile.lifePath ?? undefined,
    expression: userProfile.expression ?? undefined,
    soulUrge: userProfile.soulUrge ?? undefined,
    personality: userProfile.personality ?? undefined,
    birthdayNumber: userProfile.birthdayNumber ?? undefined,
    userName: userProfile.fullName ?? undefined,
    otherPersonName: otherPerson?.name ?? undefined,
    otherLifePath: otherPerson?.lifePath ?? undefined,
    compatibilityScore: compatibility?.score ?? undefined,
    compatibilityLevel: compatibility?.level ?? undefined,
  });

  const enhanceMessages = async (
    baseMessages: string[],
    userInput?: string
  ): Promise<string[]> => {
    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: getContext(),
          phase,
          baseMessages,
          userInput,
        }),
      });

      if (!response.ok) {
        console.error('Oracle API failed, using base messages');
        return baseMessages;
      }

      const data = await response.json();
      return data.messages || baseMessages;
    } catch (error) {
      console.error('Error calling Oracle API:', error);
      return baseMessages;
    }
  };

  const handleFreeInput = async (userInput: string): Promise<string[]> => {
    // Generate a redirect response for off-script input
    const redirectMessages = getRedirectMessages(phase, userInput);
    return enhanceMessages(redirectMessages, userInput);
  };

  return {
    enhanceMessages,
    handleFreeInput,
    getContext,
  };
}

function getRedirectMessages(phase: string, userInput: string): string[] {
  // Base redirect messages that acknowledge and redirect
  const redirects: Record<string, string[]> = {
    collecting_dob: [
      'I sense your curiosity running ahead...',
      'But first, I need your birth date to begin the reading.',
    ],
    collecting_name: [
      'Your question reveals much about you already.',
      'To answer fully, I need to know your complete name.',
    ],
    first_reveal: [
      'Patience... the numbers are still revealing themselves.',
      'Let me complete what I see before we explore further.',
    ],
    deeper_reveal: [
      'Your eagerness speaks to your Life Path.',
      'Let me finish painting this picture for you.',
    ],
    relationship_hook: [
      'That touches on what I wish to explore next.',
      'First, tell me - is there someone whose connection to you feels... significant?',
    ],
    collecting_other_dob: [
      'All will be revealed in time.',
      'For now, I need their birth date to see the full pattern.',
    ],
    compatibility_tease: [
      'I see your hunger for answers.',
      'The compatibility reading holds what you seek.',
    ],
    default: [
      'I hear you.',
      'Let us continue with the reading.',
    ],
  };

  return redirects[phase] || redirects.default;
}
