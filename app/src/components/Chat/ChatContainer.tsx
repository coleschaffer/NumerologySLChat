'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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
import CalculationAnimation, {
  generateLifePathSteps,
} from './CalculationAnimation';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useVoiceover } from '@/hooks/useVoiceover';

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
  const [showCalculation, setShowCalculation] = useState(false);
  const [calculationDOB, setCalculationDOB] = useState<Date | null>(null);
  const { play: playSound, initialize: initializeAudio } = useSoundEffects();
  const { speak, state: voiceState, toggleMute } = useVoiceover();

  // Get the addOracleMessageWithDuration from store
  const addOracleMessageWithDuration = useConversationStore(
    (state) => state.addOracleMessageWithDuration
  );
  const setTyping = useConversationStore((state) => state.setTyping);

  /**
   * Speak oracle messages with voiceover and typing animation
   * This replaces addOracleMessages for the immersive experience
   */
  const speakOracleMessages = useCallback(
    async (contents: string[]) => {
      for (let i = 0; i < contents.length; i++) {
        const text = contents[i];

        // Show typing indicator briefly
        setTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTyping(false);

        // Generate speech and get duration
        // speak() returns duration in ms
        const durationPromise = speak(text);

        // Add message with typing duration
        // Use estimated duration: ~60ms per character for slower, immersive feel
        const estimatedDuration = text.length * 60;
        addOracleMessageWithDuration(text, estimatedDuration);

        // Wait for speech to complete (or estimated duration if muted)
        const actualDuration = await durationPromise;

        // Wait for whichever is longer: speech or typing animation
        const remainingTime = Math.max(0, estimatedDuration - actualDuration);
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        // Small pause between messages
        if (i < contents.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    },
    [speak, addOracleMessageWithDuration, setTyping]
  );

  // Auto-scroll to bottom on new messages and phase changes
  // Phase changes can show/hide input which affects layout
  useEffect(() => {
    // Small delay to allow DOM to update after phase change
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping, phase]);

  // ============================================
  // PHASE 1: THE OPENING
  // Goal: Hook immediately with intrigue (Stefan Georgi style)
  // Uses: Surprising claim, identification, mechanism tease
  // ============================================
  const startConversation = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Initialize audio on first interaction
    initializeAudio();

    // Start ambient sound
    playSound('ambient');

    // Improved opening - tension, curiosity, identification
    // Using speakOracleMessages for voiceover + typing animation
    await speakOracleMessages([
      "You felt it, didn't you?",
    ]);

    // Strategic pause for effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    await speakOracleMessages([
      "That pull. That sense that something in your life is slightly... off.",
    ]);

    await speakOracleMessages([
      "Like you're following a script you didn't write.",
    ]);

    await new Promise((resolve) => setTimeout(resolve, 600));

    await speakOracleMessages([
      "There's a reason for that.",
    ]);

    await speakOracleMessages([
      "And it's hidden in the exact moment you took your first breath.",
    ]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    await speakOracleMessages([
      "Tell me... when were you born?",
    ]);

    setPhase('collecting_dob');
  }, [speakOracleMessages, setPhase, initializeAudio, playSound]);

  // Show start screen state
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Handle user clicking "Begin Reading" - this is the user gesture that enables audio
  const handleBeginReading = useCallback(() => {
    setShowStartScreen(false);
    startConversation();
  }, [startConversation]);

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
        await speakOracleMessages([
          parseResult.error,
          parseResult.suggestion,
        ]);
        return;
      }

      // Successfully parsed date
      setUserDOB(parseResult.date);
      setPhase('first_reveal');

      // Build anticipation
      await speakOracleMessages([
        "I see it now...",
        "Let me calculate the vibrations hidden in your birth date...",
      ]);

      // Show calculation animation
      setCalculationDOB(parseResult.date);
      setShowCalculation(true);

      // Wait for calculation animation to complete (3.5s for animation + 1s for effect)
      await new Promise((resolve) => setTimeout(resolve, 4500));

      const lifePath = useConversationStore.getState().userProfile.lifePath;
      const interp = lifePath ? getLifePathInterpretation(lifePath) : null;

      if (interp) {
        // Hide calculation, show in messages
        setShowCalculation(false);

        // Play reveal sound
        playSound('reveal');

        // REVEAL: Life Path Number (VSL moment - this is where they get hooked)
        // Using Stefan Georgi's "Specificity + Flattery" technique
        await speakOracleMessages([
          `Life Path ${lifePath}.`,
          `${interp.name}.`,
        ]);

        // Show the number reveal component
        addMessage({
          type: 'number-reveal',
          content: '',
          metadata: { number: lifePath! },
        });

        // Strategic pause
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Reframe a challenge as strength (Stefan Georgi technique)
        await speakOracleMessages([
          interp.shortDescription,
          interp.coreDescription,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 800));

        // Open loop for more
        await speakOracleMessages([
          "But this is only your surface number.",
          "Your TRUE nature lies deeper... hidden in the name you were given at birth.",
          "What is your full birth name?",
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

      // Strategic pause - the Oracle is "processing"
      await speakOracleMessages([
        `${firstName}...`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // REVEAL: Expression + Soul Urge (more value before asking for more)
      await speakOracleMessages([
        "The letters of your name carry vibrations I can now read clearly.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Chime for Expression reveal
      playSound('chime');

      await speakOracleMessages([
        `Your Expression Number is ${profile.expression}.`,
        "This reveals your natural talents—the abilities you were born with, whether you've developed them yet or not.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Chime for Soul Urge reveal
      playSound('chime');

      await speakOracleMessages([
        `Your Soul Urge is ${profile.soulUrge}.`,
        "This is your deepest desire. The secret longing that drives you, even when you don't consciously recognize it.",
      ]);

      setPhase('deeper_reveal');

      // Calculate personal year for added personalization
      const criticalDates = calculateCriticalDates(profile.dob!, profile.lifePath!);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Pain point agitation (Stefan Georgi technique)
      await speakOracleMessages([
        "I see much about you now, " + firstName + ".",
        `You are in a Personal Year ${criticalDates.personalYear}—a year of ${getPersonalYearTheme(criticalDates.personalYear)}.`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await speakOracleMessages([
        "But there is something else I sense...",
        "Something I almost didn't want to tell you.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await speakOracleMessages([
        "There's someone in your life right now...",
        "Someone whose energy is affecting yours more than you realize.",
        "For better... or for worse.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await speakOracleMessages([
        "Do you know who I'm sensing?",
        "Who keeps appearing in your thoughts?",
      ]);

      setPhase('relationship_hook');
    }

    // ----------------------------------------
    // PHASE: Relationship Hook (collecting other person's name)
    // ----------------------------------------
    else if (phase === 'relationship_hook') {
      addMessage({ type: 'user', content: trimmedValue });
      setOtherPerson(trimmedValue);

      await speakOracleMessages([
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
        await speakOracleMessages([
          parseResult.error,
          parseResult.suggestion,
        ]);
        return;
      }

      // Successfully parsed date
      setOtherPersonDOB(parseResult.date);
      calculateCompatibilityScore();

      // Hide input during compatibility reveal
      setPhase('compatibility_tease');

      const state = useConversationStore.getState();
      const otherLifePath = state.otherPerson?.lifePath;
      const compat = state.compatibility;
      const otherName = state.otherPerson?.name || 'them';
      const interp1 = getLifePathInterpretation(state.userProfile.lifePath!);
      const interp2 = otherLifePath ? getLifePathInterpretation(otherLifePath) : null;

      if (otherLifePath && compat && interp1 && interp2) {
        const userName = state.userProfile.fullName?.split(' ')[0] || 'you';

        // COMPATIBILITY TEASE (VSL technique: partial reveal with stakes)
        await speakOracleMessages([
          `I've seen your numbers alongside ${otherName}'s now.`,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        await speakOracleMessages([
          `${userName}, I need you to understand something...`,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Calculate critical dates for relationship
        const relDates = calculateCompatibilityCriticalDates(
          state.userProfile.dob!,
          state.userProfile.lifePath!,
          state.otherPerson!.dob!,
          otherLifePath
        );

        // Chime for compatibility reveal
        playSound('chime');

        // Show the score but create curiosity about details
        await speakOracleMessages([
          `Your compatibility score is ${compat.score}%.`,
          compat.score >= 70
            ? "That's not low. There's real potential here."
            : compat.score >= 50
            ? "That's not low. But it's not simple either."
            : "That's challenging. But not impossible.",
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Specific numbers create intrigue (VSL technique)
        await speakOracleMessages([
          "I see THREE areas of harmony between you.",
          "Connection points that could sustain you both through anything.",
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        await speakOracleMessages([
          "But I also see TWO friction patterns.",
          "Places where your numbers clash in ways that could slowly erode what you've built...",
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (relDates.length > 0) {
          await speakOracleMessages([
            `And I see critical dates approaching—moments when your paths will intersect in meaningful ways...`,
          ]);

          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        await speakOracleMessages([
          "I can see the complete picture now.",
          "The harmony... and the warnings.",
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Email capture before paywall
        await speakOracleMessages([
          "Before I reveal everything, I need a way to preserve this reading for you.",
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

      await speakOracleMessages([
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

      await speakOracleMessages([
        "I understand. Some journeys are meant to be walked alone first.",
        "Your personal numerology profile holds profound insights.",
      ]);

      if (criticalDates.dates.length > 0) {
        const nextDate = criticalDates.dates[0];
        await speakOracleMessages([
          `I see a significant date approaching: ${nextDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...`,
          `This ${nextDate.type} holds special meaning for your Life Path ${profile.lifePath}.`,
        ]);
      }

      await speakOracleMessages([
        "Before I reveal your complete reading, I need a way to preserve it for you.",
        "Where should I send your full numerology profile?",
      ]);

      setPhase('collecting_email');
      return;
    }

    // Paywall actions
    if (suggestion === 'Maybe later') {
      await speakOracleMessages([
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
          await speakOracleMessages([
            `As a Life Path ${userProfile.lifePath}, you possess remarkable qualities...`,
            `Your strengths include: ${interp.strengths.slice(0, 3).join(', ')}.`,
            `But you must be mindful of: ${interp.challenges.slice(0, 2).join(' and ')}.`,
          ]);
        } else if (suggestion.includes('mean for my life')) {
          await speakOracleMessages([
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
          await speakOracleMessages([
            "Ah, matters of the heart...",
            interp.loveOverview,
            "But to truly understand your romantic destiny, I would need to see who you are drawn to.",
          ]);
          setPhase('relationship_hook');
        } else if (suggestion.includes('career')) {
          await speakOracleMessages([
            "Your numbers point clearly to certain paths...",
            `You would excel as: ${interp.careers.join(', ')}.`,
            `People like ${interp.famousPeople[0]} and ${interp.famousPeople[1]} share your Life Path.`,
          ]);
        } else if (suggestion.includes('blocking')) {
          await speakOracleMessages([
            "I sense resistance in your path...",
            `Your challenges include: ${interp.challenges.join('. ')}.`,
            "Understanding these shadow aspects is key to your growth.",
          ]);
        }
      }
    }
  };

  const showPaywall = (phase === 'paywall' || phase === 'personal_paywall') && !hasPaid;

  // Show start screen before conversation begins
  if (showStartScreen) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#9b59b6] flex items-center justify-center">
            <span className="text-4xl">🔮</span>
          </div>
          <h2
            className="text-2xl font-medium text-white mb-3"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            The Oracle Awaits
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Your personal numerology reading is about to begin.
            <br />
            <span className="text-white/40 text-sm">For the best experience, enable sound.</span>
          </p>
          <button
            onClick={handleBeginReading}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]
                     text-[#0a0a1a] font-semibold text-lg
                     hover:from-[#e0c04a] hover:to-[#c9a632] transition-all
                     box-glow-gold transform hover:scale-105"
          >
            Begin Your Reading
          </button>
          <p className="text-white/30 text-xs mt-6">
            🔊 This experience includes voice narration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute top-2 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20
                   transition-colors border border-white/20"
        title={voiceState.isMuted ? 'Unmute Oracle' : 'Mute Oracle'}
      >
        {voiceState.isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          </svg>
        )}
      </button>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-scroll pt-4 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={message.id === messages[messages.length - 1]?.id}
                typingDuration={message.metadata?.typingDuration}
              />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}

          {/* Calculation Animation */}
          {showCalculation && calculationDOB && (
            <CalculationAnimation
              steps={generateLifePathSteps(calculationDOB)}
              result={useConversationStore.getState().userProfile.lifePath || 0}
              resultLabel="Your Life Path"
            />
          )}

          {/* Spacer to ensure last message is visible above input area */}
          <div className="h-4" />
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
