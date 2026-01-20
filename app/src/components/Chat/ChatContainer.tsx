'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useConversationStore } from '@/store/conversationStore';
import {
  getLifePathInterpretation,
  getEnhancedOpeningMessages,
  getEnhancedRevealMessages,
  getEnhancedCompatibilityTease,
} from '@/lib/interpretations';
import {
  calculateCriticalDates,
  calculateCompatibilityCriticalDates,
} from '@/lib/numerology';
import { useOracleAI } from '@/hooks/useOracleAI';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import UserInput from './UserInput';
import SuggestionCards from './SuggestionCards';
import PaywallModal from '../Payment/PaywallModal';

export default function ChatContainer() {
  const {
    phase,
    messages,
    userProfile,
    otherPerson,
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

  const { enhanceMessages, handleFreeInput } = useOracleAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // AI-enhanced message delivery
  const deliverOracleMessages = useCallback(
    async (baseMessages: string[], userInput?: string) => {
      try {
        const enhanced = await enhanceMessages(baseMessages, userInput);
        await addOracleMessages(enhanced);
      } catch {
        await addOracleMessages(baseMessages);
      }
    },
    [enhanceMessages, addOracleMessages]
  );

  // Start the conversation with Stefan Georgi "Surprising Claim" technique
  const startConversation = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Use enhanced opening messages with entertainment disclaimer woven in
    const openingMessages = getEnhancedOpeningMessages();

    await deliverOracleMessages(openingMessages);
    setPhase('collecting_dob');
  }, [deliverOracleMessages, setPhase]);

  useEffect(() => {
    if (phase === 'opening' && messages.length === 0) {
      const timer = setTimeout(startConversation, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, messages.length, startConversation]);

  // Handle user input based on current phase
  const handleUserInput = async (value: string | Date) => {
    if (phase === 'collecting_dob' && value instanceof Date) {
      // User submitted their DOB
      addMessage({
        type: 'user',
        content: value.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      setUserDOB(value);
      setPhase('first_reveal');

      // Get the life path interpretation
      const lifePath = useConversationStore.getState().userProfile.lifePath;
      const interp = lifePath ? getLifePathInterpretation(lifePath) : null;

      await new Promise((resolve) => setTimeout(resolve, 2500)); // Wait for calculation animation

      if (interp) {
        await deliverOracleMessages([
          `There it is. Life Path ${lifePath}.`,
          `${interp.name}. ${interp.shortDescription}`,
        ]);

        addMessage({
          type: 'number-reveal',
          content: '',
          metadata: { number: lifePath! },
        });

        // Use enhanced reveal messages with Stefan Georgi "reframe" technique
        const enhancedReveal = getEnhancedRevealMessages(lifePath!);
        await deliverOracleMessages(enhancedReveal);

        await deliverOracleMessages([
          'But this is only your surface number.',
          'Your TRUE nature lies deeper... hidden in the vibrations of your name.',
          'What is your full birth name? The name you were given at birth holds secrets even you may have forgotten.',
        ]);

        setPhase('collecting_name');
      }
    } else if (phase === 'collecting_name' && typeof value === 'string') {
      // User submitted their name
      addMessage({ type: 'user', content: value });
      setUserName(value);

      const profile = useConversationStore.getState().userProfile;
      const interp = getLifePathInterpretation(profile.lifePath!);

      await deliverOracleMessages([
        `${value}... I see the vibrations in your name clearly now.`,
        `Your Expression Number is ${profile.expression}. This reveals your natural talents and the path you're meant to walk.`,
        `Your Soul Urge is ${profile.soulUrge}. This is your deepest desire, the secret longing of your heart.`,
      ]);

      setPhase('deeper_reveal');

      // Calculate and tease critical dates
      const criticalDates = calculateCriticalDates(
        profile.dob!,
        profile.lifePath!
      );

      await deliverOracleMessages([
        'I see much about you now. The numbers paint a vivid picture.',
        `You are in a Personal Year ${criticalDates.personalYear}—a year of ${getPersonalYearTheme(criticalDates.personalYear)}.`,
        'But there is something more I sense...',
        'Is there someone in your life whose connection to you remains... unclear?',
        'Tell me their name, and I will reveal what the numbers say about your bond.',
      ]);

      setPhase('relationship_hook');
    } else if (phase === 'relationship_hook' && typeof value === 'string') {
      // User entered someone's name
      addMessage({ type: 'user', content: value });
      setOtherPerson(value);

      await deliverOracleMessages([
        `${value}...`,
        'The universe is aligning to reveal this connection.',
        `Do you know when ${value} was born? This will unlock the compatibility between you.`,
      ]);

      setPhase('collecting_other_dob');
    } else if (phase === 'collecting_other_dob' && value instanceof Date) {
      // User submitted other person's DOB
      addMessage({
        type: 'user',
        content: value.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      setOtherPersonDOB(value);
      calculateCompatibilityScore();

      const state = useConversationStore.getState();
      const otherLifePath = state.otherPerson?.lifePath;
      const compatibility = state.compatibility;
      const otherName = state.otherPerson?.name || 'them';

      if (otherLifePath && compatibility) {
        // Use enhanced compatibility tease with Stefan Georgi "Partial Reveal with Stakes"
        const enhancedTease = getEnhancedCompatibilityTease(
          state.userProfile.lifePath!,
          otherLifePath,
          otherName,
          compatibility.score
        );

        await deliverOracleMessages(enhancedTease);

        // Calculate critical dates for the relationship
        const criticalDates = calculateCompatibilityCriticalDates(
          state.userProfile.dob!,
          state.userProfile.lifePath!,
          state.otherPerson!.dob!,
          otherLifePath
        );

        const dateTeaser =
          criticalDates.length > 0
            ? `I see THREE critical dates this year where your paths will intersect in meaningful ways...`
            : `The numbers reveal significant moments ahead for you both...`;

        await deliverOracleMessages([
          dateTeaser,
          'Do you wish to see what the numbers truly reveal?',
        ]);

        // Move to email capture before paywall
        await deliverOracleMessages([
          'Before I reveal all, I need a way to preserve this reading for you.',
          'Where should I send your complete numerology profile?',
        ]);

        setPhase('collecting_email');
      }
    } else if (phase === 'collecting_email' && typeof value === 'string') {
      // User submitted email
      addMessage({ type: 'user', content: value });
      setUserEmail(value);

      await deliverOracleMessages([
        'Your reading is being prepared...',
        'Do you wish to see what the numbers reveal about you and ' +
          (otherPerson?.name || 'your connection') +
          '?',
      ]);

      setPhase('paywall');
    } else {
      // Free-form input - acknowledge and redirect
      addMessage({ type: 'user', content: value as string });
      const redirectMessages = await handleFreeInput(value as string);
      await addOracleMessages(redirectMessages);
    }
  };

  // Handle suggestion card selection
  const handleSuggestion = async (suggestion: string) => {
    // Handle skip relationship option
    if (suggestion === 'Skip for now - show me my full reading') {
      addMessage({ type: 'user', content: suggestion });

      await deliverOracleMessages([
        'I understand. Some journeys are meant to be walked alone first.',
        'Your personal numerology profile holds profound insights.',
      ]);

      // Calculate critical dates for personal reading
      const profile = useConversationStore.getState().userProfile;
      const criticalDates = calculateCriticalDates(
        profile.dob!,
        profile.lifePath!
      );

      if (criticalDates.dates.length > 0) {
        const nextDate = criticalDates.dates[0];
        await deliverOracleMessages([
          `I see a significant date approaching: ${nextDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...`,
          `This ${nextDate.type} holds special meaning for your Life Path ${profile.lifePath}.`,
        ]);
      }

      // Move to email capture before personal paywall
      await deliverOracleMessages([
        'Before I reveal your complete reading, I need a way to preserve it for you.',
        'Where should I send your full numerology profile?',
      ]);

      setPhase('collecting_email');
      return;
    }

    if (
      suggestion === 'Maybe later' ||
      suggestion.includes('Unlock') ||
      suggestion.includes('Reveal')
    ) {
      if (suggestion === 'Maybe later') {
        await deliverOracleMessages([
          'The numbers will wait for you...',
          'When you are ready to see the full truth, I will be here.',
        ]);
      }
      // For unlock/reveal, the paywall modal handles it
      return;
    }

    addMessage({ type: 'user', content: suggestion });

    // Handle different suggestion responses based on phase
    if (phase === 'first_reveal') {
      const interp = getLifePathInterpretation(userProfile.lifePath!);
      if (interp) {
        if (suggestion.includes('more about')) {
          await deliverOracleMessages([
            `As a Life Path ${userProfile.lifePath}, you possess remarkable qualities...`,
            `Your strengths include: ${interp.strengths.slice(0, 3).join(', ')}.`,
            `But you must be mindful of: ${interp.challenges.slice(0, 2).join(' and ')}.`,
          ]);
        } else if (suggestion.includes('mean for my life')) {
          await deliverOracleMessages([
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
          await deliverOracleMessages([
            'Ah, matters of the heart...',
            interp.loveOverview,
            'But to truly understand your romantic destiny, I would need to see who you are drawn to.',
          ]);
          setPhase('relationship_hook');
        } else if (suggestion.includes('career')) {
          await deliverOracleMessages([
            'Your numbers point clearly to certain paths...',
            `You would excel as: ${interp.careers.join(', ')}.`,
            `People like ${interp.famousPeople[0]} and ${interp.famousPeople[1]} share your Life Path.`,
          ]);
        } else if (suggestion.includes('blocking')) {
          await deliverOracleMessages([
            'I sense resistance in your path...',
            `Your challenges include: ${interp.challenges.join('. ')}.`,
            'Understanding these shadow aspects is key to your growth.',
          ]);
        }
      }
    }
  };

  const showPaywall =
    (phase === 'paywall' || phase === 'personal_paywall') && !hasPaid;

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

// Helper function for personal year themes
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
