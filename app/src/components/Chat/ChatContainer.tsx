'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useConversationStore } from '@/store/conversationStore';
import { getLifePathInterpretation } from '@/lib/interpretations';
import {
  calculateCriticalDates,
  calculateCompatibilityCriticalDates,
} from '@/lib/numerology';
import { parseDateString, isParseError } from '@/lib/dateParser';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import UserInput from './UserInput';
import SuggestionCards from './SuggestionCards';
import PaywallModal from '../Payment/PaywallModal';

/**
 * ChatContainer - The main orchestrator for the Oracle chat experience
 *
 * Design principles (from VSL analysis):
 * 1. Scripted flow with natural chat feel
 * 2. Progressive data collection - always provide value BEFORE asking for more
 * 3. Personalization using user's actual numbers/name throughout
 * 4. Open loops and intrigue to maintain engagement
 * 5. Strategic pauses and pacing
 */
export default function ChatContainer() {
  const {
    phase,
    messages,
    userProfile,
    otherPerson,
    compatibility,
    isTyping,
    hasPaid,
    addMessage,
    addOracleMessages,
    setPhase,
    setUserDOB,
    setUserName,
    setUserEmail,
    setOtherPerson,
    setOtherPersonDOB,
    calculateCompatibilityScore,
  } = useConversationStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ============================================
  // PHASE 1: THE OPENING
  // Goal: Hook immediately with intrigue
  // ============================================
  const startConversation = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Original opening - warm and intriguing
    await addOracleMessages([
      "I've been waiting for you...",
      "Before we begin, I need to ask you something important.",
      "When were you born?",
    ]);

    setPhase('collecting_dob');
  }, [addOracleMessages, setPhase]);

  // Start conversation on mount
  useEffect(() => {
    if (phase === 'opening' && messages.length === 0) {
      const timer = setTimeout(startConversation, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, messages.length, startConversation]);

  // ============================================
  // HANDLE USER INPUT - Core conversation flow
  // All input is now text (including dates)
  // ============================================
  const handleUserInput = async (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    // ----------------------------------------
    // PHASE: Collecting DOB (natural text input)
    // ----------------------------------------
    if (phase === 'collecting_dob') {
      // Show what user typed
      addMessage({ type: 'user', content: trimmedValue });

      // Parse the date
      const parseResult = parseDateString(trimmedValue);

      if (isParseError(parseResult)) {
        // Oracle gently asks for clarification
        await addOracleMessages([
          parseResult.error,
          parseResult.suggestion,
        ]);
        return;
      }

      // Successfully parsed date
      setUserDOB(parseResult.date);
      setPhase('first_reveal');

      const lifePath = useConversationStore.getState().userProfile.lifePath;
      const interp = lifePath ? getLifePathInterpretation(lifePath) : null;

      // Wait for calculation animation to complete
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (interp) {
        // REVEAL: Life Path Number (VSL moment - this is where they get hooked)
        await addOracleMessages([
          `Your Life Path Number is ${lifePath}...`,
          `You are "${interp.name}."`,
          interp.shortDescription,
        ]);

        // Show the number reveal component
        addMessage({
          type: 'number-reveal',
          content: '',
          metadata: { number: lifePath! },
        });

        // Flattering description + open loop for more
        await addOracleMessages([
          interp.coreDescription,
          "But this is only your surface number. Your TRUE nature lies deeper...",
          "What is your full birth name? The name you were given at birth holds even more secrets.",
        ]);

        setPhase('collecting_name');
      }
    }

    // ----------------------------------------
    // PHASE: Collecting Name
    // ----------------------------------------
    else if (phase === 'collecting_name') {
      addMessage({ type: 'user', content: trimmedValue });
      setUserName(trimmedValue);

      const profile = useConversationStore.getState().userProfile;
      const firstName = trimmedValue.split(' ')[0]; // Use first name for intimacy

      // REVEAL: Expression + Soul Urge (more value before asking for more)
      await addOracleMessages([
        `${firstName}... I see the vibrations in your name clearly now.`,
        `Your Expression Number is ${profile.expression}. This reveals your natural talents and the path you're meant to walk.`,
        `Your Soul Urge is ${profile.soulUrge}. This is your deepest desire, the secret longing of your heart.`,
      ]);

      setPhase('deeper_reveal');

      // Calculate personal year for added personalization
      const criticalDates = calculateCriticalDates(profile.dob!, profile.lifePath!);

      await addOracleMessages([
        "I see much about you now. The numbers paint a vivid picture.",
        `You are in a Personal Year ${criticalDates.personalYear}—a year of ${getPersonalYearTheme(criticalDates.personalYear)}.`,
        "But there is something more I sense...",
        "Is there someone in your life whose connection to you remains... unclear?",
        "Tell me their name, and I will reveal what the numbers say about your bond.",
      ]);

      setPhase('relationship_hook');
    }

    // ----------------------------------------
    // PHASE: Relationship Hook (collecting other person's name)
    // ----------------------------------------
    else if (phase === 'relationship_hook') {
      addMessage({ type: 'user', content: trimmedValue });
      setOtherPerson(trimmedValue);

      await addOracleMessages([
        `${trimmedValue}...`,
        "The universe is aligning to reveal this connection.",
        `Do you know when ${trimmedValue} was born? This will unlock the compatibility between you.`,
      ]);

      setPhase('collecting_other_dob');
    }

    // ----------------------------------------
    // PHASE: Collecting Other Person's DOB (natural text input)
    // ----------------------------------------
    else if (phase === 'collecting_other_dob') {
      // Show what user typed
      addMessage({ type: 'user', content: trimmedValue });

      // Parse the date
      const parseResult = parseDateString(trimmedValue);

      if (isParseError(parseResult)) {
        // Oracle gently asks for clarification
        await addOracleMessages([
          parseResult.error,
          parseResult.suggestion,
        ]);
        return;
      }

      // Successfully parsed date
      setOtherPersonDOB(parseResult.date);
      calculateCompatibilityScore();

      const state = useConversationStore.getState();
      const otherLifePath = state.otherPerson?.lifePath;
      const compat = state.compatibility;
      const otherName = state.otherPerson?.name || 'them';
      const interp1 = getLifePathInterpretation(state.userProfile.lifePath!);
      const interp2 = otherLifePath ? getLifePathInterpretation(otherLifePath) : null;

      if (otherLifePath && compat && interp1 && interp2) {
        // COMPATIBILITY TEASE (VSL technique: show enough to create desire for more)
        await addOracleMessages([
          `I see the numbers aligning between you and ${otherName}...`,
          `You, ${interp1.name}, meeting ${interp2.name}.`,
          "There are patterns here that require... careful examination.",
        ]);

        // Calculate critical dates for relationship
        const relDates = calculateCompatibilityCriticalDates(
          state.userProfile.dob!,
          state.userProfile.lifePath!,
          state.otherPerson!.dob!,
          otherLifePath
        );

        // Show partial info to build intrigue
        await addOracleMessages([
          `Your compatibility score is calculated...`,
          `I see ${compat.level === 'high' ? 'strong harmony' : compat.level === 'moderate' ? 'interesting dynamics' : 'challenging energies'} between you.`,
          relDates.length > 0
            ? `I see THREE critical dates this year where your paths will intersect in meaningful ways...`
            : `The numbers reveal significant moments ahead for you both...`,
          "I can see the complete picture now.",
          "The areas where you strengthen each other...",
          "And the warnings I must share...",
        ]);

        // Email capture before paywall
        await addOracleMessages([
          "Before I reveal all, I need a way to preserve this reading for you.",
          "Where should I send your complete numerology profile?",
        ]);

        setPhase('collecting_email');
      }
    }

    // ----------------------------------------
    // PHASE: Collecting Email
    // ----------------------------------------
    else if (phase === 'collecting_email') {
      addMessage({ type: 'user', content: trimmedValue });
      setUserEmail(trimmedValue);

      const otherName = otherPerson?.name;

      await addOracleMessages([
        "Your reading is being prepared...",
        otherName
          ? `Do you wish to see what the numbers reveal about you and ${otherName}?`
          : "Do you wish to see your complete numerology profile?",
      ]);

      setPhase(otherPerson ? 'paywall' : 'personal_paywall');
    }

    // ----------------------------------------
    // FREE-FORM INPUT: Acknowledge and redirect
    // ----------------------------------------
    else {
      addMessage({ type: 'user', content: trimmedValue });

      // Warm acknowledgment + redirect back to flow
      const redirectMessages = getRedirectMessages(phase);
      await addOracleMessages(redirectMessages);
    }
  };

  // ============================================
  // HANDLE SUGGESTION CARDS
  // ============================================
  const handleSuggestion = async (suggestion: string) => {

    // Skip relationship option
    if (suggestion === 'Skip for now - show me my full reading') {
      addMessage({ type: 'user', content: suggestion });

      const profile = useConversationStore.getState().userProfile;
      const criticalDates = calculateCriticalDates(profile.dob!, profile.lifePath!);

      await addOracleMessages([
        "I understand. Some journeys are meant to be walked alone first.",
        "Your personal numerology profile holds profound insights.",
      ]);

      if (criticalDates.dates.length > 0) {
        const nextDate = criticalDates.dates[0];
        await addOracleMessages([
          `I see a significant date approaching: ${nextDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...`,
          `This ${nextDate.type} holds special meaning for your Life Path ${profile.lifePath}.`,
        ]);
      }

      await addOracleMessages([
        "Before I reveal your complete reading, I need a way to preserve it for you.",
        "Where should I send your full numerology profile?",
      ]);

      setPhase('collecting_email');
      return;
    }

    // Paywall actions
    if (suggestion === 'Maybe later') {
      await addOracleMessages([
        "The numbers will wait for you...",
        "When you are ready to see the full truth, I will be here.",
      ]);
      return;
    }

    if (suggestion.includes('Unlock') || suggestion.includes('Reveal')) {
      // Paywall modal handles this
      return;
    }

    addMessage({ type: 'user', content: suggestion });

    // Phase-specific responses
    if (phase === 'first_reveal') {
      const interp = getLifePathInterpretation(userProfile.lifePath!);
      if (interp) {
        if (suggestion.includes('more about')) {
          await addOracleMessages([
            `As a Life Path ${userProfile.lifePath}, you possess remarkable qualities...`,
            `Your strengths include: ${interp.strengths.slice(0, 3).join(', ')}.`,
            `But you must be mindful of: ${interp.challenges.slice(0, 2).join(' and ')}.`,
          ]);
        } else if (suggestion.includes('mean for my life')) {
          await addOracleMessages([
            `The Life Path ${userProfile.lifePath} shapes everything about your journey.`,
            interp.loveOverview,
            `In career, you thrive as: ${interp.careers.slice(0, 3).join(', ')}.`,
          ]);
        }
      }
    } else if (phase === 'deeper_reveal') {
      const interp = getLifePathInterpretation(userProfile.lifePath!);
      if (interp) {
        if (suggestion.includes('love life')) {
          await addOracleMessages([
            "Ah, matters of the heart...",
            interp.loveOverview,
            "But to truly understand your romantic destiny, I would need to see who you are drawn to.",
          ]);
          setPhase('relationship_hook');
        } else if (suggestion.includes('career')) {
          await addOracleMessages([
            "Your numbers point clearly to certain paths...",
            `You would excel as: ${interp.careers.join(', ')}.`,
            `People like ${interp.famousPeople[0]} and ${interp.famousPeople[1]} share your Life Path.`,
          ]);
        } else if (suggestion.includes('blocking')) {
          await addOracleMessages([
            "I sense resistance in your path...",
            `Your challenges include: ${interp.challenges.join('. ')}.`,
            "Understanding these shadow aspects is key to your growth.",
          ]);
        }
      }
    }
  };

  const showPaywall = (phase === 'paywall' || phase === 'personal_paywall') && !hasPaid;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-scroll py-4">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={message.id === messages[messages.length - 1]?.id}
              />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion cards */}
      <SuggestionCards
        phase={phase}
        onSelect={handleSuggestion}
        userName={userProfile.fullName || undefined}
        otherPersonName={otherPerson?.name}
      />

      {/* Input area */}
      <UserInput phase={phase} onSubmit={handleUserInput} disabled={isTyping} />

      {/* Paywall modal */}
      {showPaywall && <PaywallModal isPersonalOnly={phase === 'personal_paywall'} />}
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function getRedirectMessages(phase: string): string[] {
  const redirects: Record<string, string[]> = {
    collecting_dob: [
      "I sense your curiosity...",
      "But first, I need your birth date to begin the reading.",
    ],
    collecting_name: [
      "Your question reveals much about you already.",
      "To answer fully, I need to know your complete birth name.",
    ],
    first_reveal: [
      "Patience... the numbers are still revealing themselves.",
      "Let me complete what I see before we explore further.",
    ],
    deeper_reveal: [
      "Your eagerness speaks to your Life Path.",
      "Let me finish painting this picture for you.",
    ],
    relationship_hook: [
      "That touches on what I wish to explore next.",
      "First, tell me - is there someone whose connection to you feels... significant?",
    ],
    collecting_other_dob: [
      "All will be revealed in time.",
      "For now, I need their birth date to see the full pattern.",
    ],
    collecting_email: [
      "I hear you.",
      "But first, where should I send your reading?",
    ],
    default: [
      "I hear you.",
      "Let us continue with the reading.",
    ],
  };

  return redirects[phase] || redirects.default;
}
