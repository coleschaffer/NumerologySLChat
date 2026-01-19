'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useConversationStore } from '@/store/conversationStore';
import { getLifePathInterpretation, getCompatibilityTeaser } from '@/lib/interpretations';
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
    setOtherPerson,
    setOtherPersonDOB,
    calculateCompatibilityScore,
  } = useConversationStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Start the conversation
  const startConversation = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    await addOracleMessages([
      "I've been waiting for you...",
      'Before we begin, I need to ask you something important.',
      'When were you born?',
    ]);
    setPhase('collecting_dob');
  }, [addOracleMessages, setPhase]);

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
        await addOracleMessages([
          `Your Life Path Number is ${lifePath}...`,
          `You are "${interp.name}."`,
          interp.shortDescription,
        ]);

        addMessage({
          type: 'number-reveal',
          content: '',
          metadata: { number: lifePath! },
        });

        await addOracleMessages([
          interp.coreDescription,
          'But this is only your surface number. Your TRUE nature lies deeper...',
          'What is your full birth name? The name you were given at birth holds even more secrets.',
        ]);

        setPhase('collecting_name');
      }
    } else if (phase === 'collecting_name' && typeof value === 'string') {
      // User submitted their name
      addMessage({ type: 'user', content: value });
      setUserName(value);

      const profile = useConversationStore.getState().userProfile;

      await addOracleMessages([
        `${value}... I see the vibrations in your name clearly now.`,
        `Your Expression Number is ${profile.expression}. This reveals your natural talents and the path you're meant to walk.`,
        `Your Soul Urge is ${profile.soulUrge}. This is your deepest desire, the secret longing of your heart.`,
      ]);

      setPhase('deeper_reveal');

      await addOracleMessages([
        'I see much about you now. The numbers paint a vivid picture.',
        'But there is something more I sense...',
        'Is there someone in your life whose connection to you remains... unclear?',
        'Tell me their name, and I will reveal what the numbers say about your bond.',
      ]);

      setPhase('relationship_hook');
    } else if (phase === 'relationship_hook' && typeof value === 'string') {
      // User entered someone's name
      addMessage({ type: 'user', content: value });
      setOtherPerson(value);

      await addOracleMessages([
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
        const teaserMessages = getCompatibilityTeaser(
          state.userProfile.lifePath!,
          otherLifePath,
          otherName
        );

        await addOracleMessages(teaserMessages);

        await addOracleMessages([
          `Your compatibility score is calculated...`,
          `I see ${compatibility.level === 'high' ? 'strong harmony' : compatibility.level === 'moderate' ? 'interesting dynamics' : 'challenging energies'} between you.`,
          'I can see the complete picture now.',
          'The areas where you strengthen each other...',
          'And the warnings I must share...',
          'Do you wish to see the full compatibility reading?',
        ]);

        setPhase('paywall');
      }
    }
  };

  // Handle suggestion card selection
  const handleSuggestion = async (suggestion: string) => {
    if (
      suggestion === 'Maybe later' ||
      suggestion.includes('Unlock') ||
      suggestion.includes('Reveal')
    ) {
      if (suggestion === 'Maybe later') {
        await addOracleMessages([
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
            'Ah, matters of the heart...',
            interp.loveOverview,
            'But to truly understand your romantic destiny, I would need to see who you are drawn to.',
          ]);
          setPhase('relationship_hook');
        } else if (suggestion.includes('career')) {
          await addOracleMessages([
            'Your numbers point clearly to certain paths...',
            `You would excel as: ${interp.careers.join(', ')}.`,
            `People like ${interp.famousPeople[0]} and ${interp.famousPeople[1]} share your Life Path.`,
          ]);
        } else if (suggestion.includes('blocking')) {
          await addOracleMessages([
            'I sense resistance in your path...',
            `Your challenges include: ${interp.challenges.join('. ')}.`,
            'Understanding these shadow aspects is key to your growth.',
          ]);
        }
      }
    }
  };

  const showPaywall = phase === 'paywall' && !hasPaid;

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
      {showPaywall && <PaywallModal />}
    </div>
  );
}
