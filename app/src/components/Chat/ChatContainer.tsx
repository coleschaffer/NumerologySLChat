'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useConversationStore } from '@/store/conversationStore';
import type { ConversationPhase } from '@/lib/phaseConfig';
import { getPhaseConfig, getValidationType } from '@/lib/phaseConfig';
import { getLifePathInterpretation } from '@/lib/interpretations';
import {
  calculateCriticalDates,
  calculateCompatibilityCriticalDates,
} from '@/lib/numerology';
import { parseDateString, isParseError, validateEmail, validateName, tryParseAsCorrection } from '@/lib/dateParser';
import { getMysticalValidationMessages } from '@/lib/mysticalValidation';
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions';
import {
  useAIInterpretation,
  getAIAcknowledgment,
  getAITransition,
  getAICriticalDateExplanation,
  getAIYearAheadPrediction,
  getAIRelationshipAdvice,
} from '@/hooks/useAIInterpretation';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import UserInput from './UserInput';
import SuggestionCards from './SuggestionCards';
import PaywallModal from '../Payment/PaywallModal';
import CalculationAnimation, {
  generateLifePathSteps,
} from './CalculationAnimation';
import ConstellationReveal from '../Numerology/ConstellationReveal';
import SacredGeometryReveal from '../Numerology/SacredGeometryReveal';
import LetterTransform from '../Numerology/LetterTransform';
import CompatibilityVisual from '../Numerology/CompatibilityVisual';
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
 * 6. Mystical error handling - never technical messages
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
    dynamicSuggestions,
    addMessage,
    addOracleMessages,
    setPhase,
    setUserDOB,
    setUserName,
    setUserEmail,
    setOtherPerson,
    setOtherPersonDOB,
    calculateCompatibilityScore,
    setDynamicSuggestions,
    clearDynamicSuggestions,
  } = useConversationStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [calculationDOB, setCalculationDOB] = useState<Date | null>(null);
  const [activeVisualization, setActiveVisualization] = useState<'sacred-geometry' | 'letter-transform' | 'compatibility' | null>(null);
  const { play: playSound, initialize: initializeAudio, toggleMute: toggleAmbientMute, isMuted: isAmbientMuted } = useSoundEffects();
  const { speak, state: voiceState, toggleMute: toggleVoiceMute } = useVoiceover();

  // Dynamic suggestions hook
  const {
    suggestions: aiSuggestions,
    isLoading: suggestionsLoading,
    generateSuggestions,
  } = useDynamicSuggestions();

  // AI interpretation hook
  const { getInterpretation } = useAIInterpretation();

  // Get the addOracleMessageWithDuration from store
  const addOracleMessageWithDuration = useConversationStore(
    (state) => state.addOracleMessageWithDuration
  );
  const setTyping = useConversationStore((state) => state.setTyping);

  /**
   * Speak oracle messages with voiceover and typing animation
   */
  const speakOracleMessages = useCallback(
    async (contents: string[]) => {
      for (let i = 0; i < contents.length; i++) {
        const text = contents[i];

        try {
          setTyping(true);
          const audioDuration = await speak(text);
          setTyping(false);

          // Add 2% buffer to typing duration so text finishes with audio
          const bufferedAudioDuration = audioDuration * 1.02;
          const estimatedTypingDuration = text.length * 60;
          const typingDuration = Math.max(bufferedAudioDuration, estimatedTypingDuration);

          addOracleMessageWithDuration(text, typingDuration);

          await new Promise((resolve) => setTimeout(resolve, typingDuration));

          if (i < contents.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        } catch (error) {
          console.error('[ChatContainer] Error speaking message:', error);
          setTyping(false);
          // Still show the message even if voice fails
          addOracleMessageWithDuration(text, text.length * 50);
          await new Promise((resolve) => setTimeout(resolve, text.length * 50));
        }
      }
    },
    [speak, addOracleMessageWithDuration, setTyping]
  );

  /**
   * Handle mystical validation errors
   * Instead of technical error messages, use Oracle API to generate contextual redirects
   */
  const handleValidationError = useCallback(
    async (errorCode: string, originalInput: string, expectedInput: 'date' | 'name' | 'email' | 'freeform') => {
      console.log('[ChatContainer] handleValidationError called:', { errorCode, originalInput, expectedInput, phase });
      try {
        console.log('[ChatContainer] Getting mystical validation messages...');
        const messages = await getMysticalValidationMessages({
          phase,
          errorCode: errorCode as any,
          originalInput,
          userName: userProfile.fullName || undefined,
          lifePath: userProfile.lifePath || undefined,
          expectedInput,
        });
        console.log('[ChatContainer] Got messages:', messages);

        await speakOracleMessages(messages);
        console.log('[ChatContainer] Finished speaking validation messages');

        // Only generate suggestions for freeform input (date/name/email don't show suggestions)
        if (expectedInput === 'freeform') {
          generateSuggestions("What would you like to explore?");
        }
      } catch (error) {
        console.error('[ChatContainer] Error in handleValidationError:', error);
        // Fallback: show simple redirect message without voiceover
        const fallbackMessages = [
          "I sense something isn't quite right...",
          expectedInput === 'date' ? "When were you born? Share your birthday with me." :
          expectedInput === 'name' ? "What is your full birth name?" :
          expectedInput === 'email' ? "Where should I send your complete reading?" :
          "Tell me more..."
        ];
        // Add messages directly without voiceover as last resort
        for (const msg of fallbackMessages) {
          addOracleMessageWithDuration(msg, msg.length * 50);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    },
    [phase, userProfile.fullName, userProfile.lifePath, speakOracleMessages, addOracleMessageWithDuration, generateSuggestions]
  );

  // Auto-scroll to bottom on new messages and phase changes
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping, phase]);

  // ============================================
  // PHASE 1: THE OPENING
  // ============================================
  const startConversation = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    initializeAudio();
    playSound('ambient');

    await speakOracleMessages([
      "You felt it, didn't you?",
    ]);

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
    // No suggestions for DOB collection - placeholder has format hint
  }, [speakOracleMessages, setPhase, initializeAudio, playSound]);

  // Show start screen state
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [copyVariant, setCopyVariant] = useState(0);

  // Copy variants for A/B testing
  const copyOptions = [
    {
      headline: "The Hidden Code in Your Birthday",
      subhead: "In the next 3 minutes, you'll discover why certain patterns keep repeating in your life—and the ancient \"Birth Vibration\" that's been quietly shaping your relationships, career, and deepest desires since the moment you were born.",
      button: "Reveal My Hidden Code",
    },
    {
      headline: "What If Your Life Isn't Random?",
      subhead: "There's a reason you keep attracting the same situations. A reason certain people feel instantly familiar. The Oracle has decoded 2,847 birth dates this month alone—and what the numbers reveal is never what people expect.",
      button: "Show Me What the Numbers Say",
    },
    {
      headline: "3 Numbers That Explain Everything",
      subhead: "Your Life Path. Your Expression. Your Soul Urge. These three numbers—hidden in your name and birthday—reveal why you feel the way you do, what you're truly meant for, and who you're cosmically compatible with.",
      button: "Calculate My Numbers",
    },
    {
      headline: "The Truth Written in Your Birth Date",
      subhead: "Most people live their entire lives without knowing the single number that governs their destiny. In 90 seconds, the Oracle will reveal yours—along with something about your love life that may finally make sense.",
      button: "Begin My Reading",
    },
  ];

  const handleBeginReading = useCallback(() => {
    setShowStartScreen(false);
    startConversation();
  }, [startConversation]);

  const handleNextCopyVariant = useCallback(() => {
    setCopyVariant((prev) => (prev + 1) % copyOptions.length);
  }, [copyOptions.length]);

  // ============================================
  // HANDLE USER INPUT - Core conversation flow
  // ============================================
  const handleUserInput = async (value: string) => {
    console.log('[ChatContainer] handleUserInput called with:', value, 'phase:', phase);
    try {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const validationType = getValidationType(phase);

    // Clear suggestions when user submits
    clearDynamicSuggestions();

    // ----------------------------------------
    // PHASE: Collecting DOB
    // ----------------------------------------
    if (phase === 'collecting_dob') {
      addMessage({ type: 'user', content: trimmedValue });

      let parseResult = parseDateString(trimmedValue);
      console.log('[ChatContainer] DOB parse result:', parseResult);

      // If parsing failed, try to interpret as a correction to the previous input
      if (isParseError(parseResult)) {
        // Find the previous user message (excluding the one we just added)
        const userMessages = messages.filter(m => m.type === 'user');
        const previousUserMessage = userMessages[userMessages.length - 1]; // -1 because we just added one

        if (previousUserMessage) {
          console.log('[ChatContainer] Trying to parse as correction to:', previousUserMessage.content);
          const correctionResult = tryParseAsCorrection(trimmedValue, previousUserMessage.content);
          if (correctionResult && !isParseError(correctionResult)) {
            console.log('[ChatContainer] Correction successful!');
            parseResult = correctionResult;
          }
        }
      }

      if (isParseError(parseResult)) {
        console.log('[ChatContainer] DOB is parse error, calling handleValidationError');
        await handleValidationError(parseResult.errorCode, parseResult.originalInput, 'date');
        console.log('[ChatContainer] handleValidationError completed');
        return;
      }

      try {
        setUserDOB(parseResult.date);
        setPhase('revealing_birth_numbers');

        await speakOracleMessages([
          "I see it now...",
          "Let me decode the vibrations hidden in your birth date...",
        ]);

        // Show calculation animation
        setCalculationDOB(parseResult.date);
        setShowCalculation(true);

        // Wait for the calculation animation to complete (3 steps x 1.8s + pauses)
        await new Promise((resolve) => setTimeout(resolve, 9000));

        const lifePath = useConversationStore.getState().userProfile.lifePath;
        const interp = lifePath ? getLifePathInterpretation(lifePath) : null;

        if (interp) {
          playSound('reveal');

          // Get AI-personalized interpretation
          const aiResult = lifePath ? await getInterpretation('lifePath', lifePath, {
            userName: useConversationStore.getState().userProfile.fullName || undefined,
            lifePath,
          }) : null;

          const interpretation = aiResult?.interpretation || {
            title: `Life Path ${lifePath}. ${interp.name}.`,
            shortDescription: interp.shortDescription,
            coreDescription: interp.coreDescription,
          };

          // Split title into two messages for dramatic effect
          const titleParts = interpretation.title.split('. ').filter(Boolean);
          await speakOracleMessages(titleParts.map(p => p.endsWith('.') ? p : `${p}.`));

          await new Promise((resolve) => setTimeout(resolve, 1500));

          setPhase('revealing_life_path');

          await speakOracleMessages([
            interpretation.shortDescription,
            interpretation.coreDescription,
          ]);

          // Hide calculation after interpretation
          setShowCalculation(false);

          await new Promise((resolve) => setTimeout(resolve, 800));

          // IMPORTANT: Always end with a question before showing input
          const question1 = await getAITransition(
            'revealing_life_path',
            'oracle_question_1',
            {
              userName: userProfile.fullName,
              lifePath,
            },
            [
              "Does this resonate with you?",
              "What aspect of your life feels most affected by this energy?",
            ]
          );

          await speakOracleMessages(question1);

          setPhase('oracle_question_1');
          generateSuggestions(question1[question1.length - 1] || "What aspect of your life feels most affected by this energy?");
        } else {
          console.error('[ChatContainer] No interpretation found for life path:', lifePath);
          setShowCalculation(false);
          // Fallback - still ask a question before showing input
          await speakOracleMessages([
            `Your Life Path Number is ${lifePath}.`,
            "This number holds deep significance for your journey.",
            "Does this resonate with what you've experienced in your life?",
          ]);
          setPhase('oracle_question_1');
          generateSuggestions("Does this resonate with what you've experienced?");
        }
      } catch (error) {
        console.error('[ChatContainer] Error in DOB handling:', error);
        setShowCalculation(false);
        setActiveVisualization(null);
        await speakOracleMessages([
          "I sense a disturbance in the connection...",
          "Let us try again. When were you born?",
        ]);
        setPhase('collecting_dob');
      }
    }

    // ----------------------------------------
    // PHASE: Oracle Question 1 (after life path reveal)
    // ----------------------------------------
    else if (phase === 'oracle_question_1') {
      addMessage({ type: 'user', content: trimmedValue });

      // Get AI-personalized acknowledgment based on what they said
      const acknowledgment = await getAIAcknowledgment(
        trimmedValue,
        {
          userName: userProfile.fullName,
          lifePath: userProfile.lifePath,
        },
        phase
      );
      await speakOracleMessages(acknowledgment);

      await new Promise((resolve) => setTimeout(resolve, 800));

      // AI-personalized transition to name collection
      const transitionMessages = await getAITransition(
        'oracle_question_1',
        'collecting_name',
        {
          userName: userProfile.fullName,
          lifePath: userProfile.lifePath,
        },
        [
          "But this is only your surface number.",
          "Your TRUE nature lies deeper... hidden in the name you were given at birth.",
          "What is your full birth name?",
        ]
      );

      await speakOracleMessages(transitionMessages);

      setPhase('collecting_name');
      // No suggestions for name input
    }

    // ----------------------------------------
    // PHASE: Collecting Name
    // ----------------------------------------
    else if (phase === 'collecting_name') {
      addMessage({ type: 'user', content: trimmedValue });

      const nameValidation = validateName(trimmedValue);
      if (!nameValidation.valid && nameValidation.errorCode) {
        await handleValidationError(nameValidation.errorCode, trimmedValue, 'name');
        return;
      }

      setUserName(trimmedValue);

      const profile = useConversationStore.getState().userProfile;
      const firstName = trimmedValue.split(' ')[0];

      await speakOracleMessages([
        `${firstName}...`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Show letter transform animation for Expression
      setActiveVisualization('letter-transform');

      await speakOracleMessages([
        "The letters of your name carry vibrations I can now read clearly.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setActiveVisualization(null);
      playSound('chime');
      setPhase('revealing_expression');

      await speakOracleMessages([
        `Your Expression Number is ${profile.expression}.`,
        "This reveals your natural talents—the abilities you were born with.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Second Oracle question - personalized based on expression number
      const question2 = await getAITransition(
        'revealing_expression',
        'oracle_question_2',
        {
          userName: profile.fullName,
          lifePath: profile.lifePath,
          expression: profile.expression,
        },
        [
          "Have you ever felt drawn to certain skills or abilities that seem to come naturally?",
        ]
      );

      await speakOracleMessages(question2);

      setPhase('oracle_question_2');
      generateSuggestions(question2[question2.length - 1] || "Have you ever felt drawn to certain skills or abilities?");
    }

    // ----------------------------------------
    // PHASE: Oracle Question 2 (after expression reveal)
    // ----------------------------------------
    else if (phase === 'oracle_question_2') {
      addMessage({ type: 'user', content: trimmedValue });

      const profile = useConversationStore.getState().userProfile;

      // Get AI-personalized acknowledgment
      const acknowledgment = await getAIAcknowledgment(
        trimmedValue,
        {
          userName: profile.fullName,
          lifePath: profile.lifePath,
          expression: profile.expression,
        },
        phase
      );
      await speakOracleMessages(acknowledgment.slice(0, 1)); // Just one line here

      await new Promise((resolve) => setTimeout(resolve, 800));

      playSound('chime');
      setPhase('revealing_soul_urge');

      await speakOracleMessages([
        `Your Soul Urge is ${profile.soulUrge}.`,
        "This is your deepest desire. The secret longing that drives you.",
      ]);

      const criticalDates = profile.dob && profile.lifePath
        ? calculateCriticalDates(profile.dob, profile.lifePath)
        : null;

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const firstName = profile.fullName?.split(' ')[0] || 'Dear one';

      if (criticalDates) {
        // Get AI-generated year ahead prediction
        const yearPrediction = await getAIYearAheadPrediction(
          criticalDates.personalYear,
          {
            userName: profile.fullName,
            lifePath: profile.lifePath,
            expression: profile.expression,
            soulUrge: profile.soulUrge,
          }
        );

        await speakOracleMessages([
          `I see much about you now, ${firstName}.`,
          `You are in a Personal Year ${criticalDates.personalYear}.`,
        ]);

        // Speak the AI-generated year theme
        await speakOracleMessages([yearPrediction.theme]);

        // If there are upcoming critical dates, mention the most significant one
        if (criticalDates.dates.length > 0) {
          const nextDate = criticalDates.dates[0];
          const aiDateExplanation = await getAICriticalDateExplanation(
            nextDate.date,
            nextDate.type,
            nextDate.description,
            {
              userName: profile.fullName,
              lifePath: profile.lifePath,
            }
          );

          await speakOracleMessages([
            `I see a significant date approaching: ${nextDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...`,
            aiDateExplanation,
          ]);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await speakOracleMessages([
        "But there is something else I sense...",
        "There's someone in your life right now...",
        "Someone whose energy is affecting yours more than you realize.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await speakOracleMessages([
        "Do you know who I'm sensing?",
        "Who keeps appearing in your thoughts?",
      ]);

      setPhase('oracle_question_other_person');
      generateSuggestions("Who keeps appearing in your thoughts?");
    }

    // ----------------------------------------
    // PHASE: Oracle Question about other person
    // ----------------------------------------
    else if (phase === 'oracle_question_other_person') {
      addMessage({ type: 'user', content: trimmedValue });

      // Check if they want to skip
      if (trimmedValue.toLowerCase().includes('skip') || trimmedValue.toLowerCase().includes('myself')) {
        await handleSkipRelationship();
        return;
      }

      // AI-personalized acknowledgment of who they're thinking about
      const acknowledgment = await getAIAcknowledgment(
        trimmedValue,
        {
          userName: userProfile.fullName,
          lifePath: userProfile.lifePath,
        },
        phase
      );
      await speakOracleMessages([
        acknowledgment[0] || "I sense a strong connection forming in your mind...",
        "Tell me their name.",
      ]);

      setPhase('collecting_other_info');
      // No suggestions for name input
    }

    // ----------------------------------------
    // PHASE: Collecting Other Person's Info (name)
    // ----------------------------------------
    else if (phase === 'collecting_other_info') {
      addMessage({ type: 'user', content: trimmedValue });

      const nameValidation = validateName(trimmedValue);
      if (!nameValidation.valid && nameValidation.errorCode) {
        await handleValidationError(nameValidation.errorCode, trimmedValue, 'name');
        return;
      }

      setOtherPerson(trimmedValue);

      await speakOracleMessages([
        `${trimmedValue}...`,
        "The universe is aligning to reveal this connection.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await speakOracleMessages([
        "What is your relationship with them?",
        "What draws you to understand this connection?",
      ]);

      setPhase('oracle_question_relationship');
      generateSuggestions("What draws you to understand this connection?");
    }

    // ----------------------------------------
    // PHASE: Oracle Question about Relationship
    // ----------------------------------------
    else if (phase === 'oracle_question_relationship') {
      addMessage({ type: 'user', content: trimmedValue });

      const otherName = useConversationStore.getState().otherPerson?.name || 'them';

      // AI-personalized acknowledgment of their relationship description
      const acknowledgment = await getAIAcknowledgment(
        trimmedValue,
        {
          userName: userProfile.fullName,
          lifePath: userProfile.lifePath,
        },
        phase
      );

      await speakOracleMessages([
        acknowledgment[0] || "I feel the weight of this connection...",
        `Do you know when ${otherName} was born? This will unlock the compatibility between you.`,
      ]);

      setPhase('collecting_other_dob');
      // No suggestions for date input
    }

    // ----------------------------------------
    // PHASE: Collecting Other Person's DOB
    // ----------------------------------------
    else if (phase === 'collecting_other_dob') {
      addMessage({ type: 'user', content: trimmedValue });

      let parseResult = parseDateString(trimmedValue);

      // If parsing failed, try to interpret as a correction to the previous input
      if (isParseError(parseResult)) {
        const userMessages = messages.filter(m => m.type === 'user');
        const previousUserMessage = userMessages[userMessages.length - 1];

        if (previousUserMessage) {
          const correctionResult = tryParseAsCorrection(trimmedValue, previousUserMessage.content);
          if (correctionResult && !isParseError(correctionResult)) {
            parseResult = correctionResult;
          }
        }
      }

      if (isParseError(parseResult)) {
        await handleValidationError(parseResult.errorCode, parseResult.originalInput, 'date');
        return;
      }

      setOtherPersonDOB(parseResult.date);
      calculateCompatibilityScore();

      setPhase('filler_compatibility');

      const state = useConversationStore.getState();
      const otherLifePath = state.otherPerson?.lifePath;
      const compat = state.compatibility;
      const otherName = state.otherPerson?.name || 'them';
      const userName = state.userProfile.fullName?.split(' ')[0] || 'you';

      if (otherLifePath && compat) {
        // AI-personalized compatibility reveal
        const compatIntro = await getAITransition(
          'collecting_other_dob',
          'revealing_compatibility',
          {
            userName: userName,
            lifePath: state.userProfile.lifePath,
          },
          [
            `I've seen your numbers alongside ${otherName}'s now.`,
            `${userName}, I need you to understand something...`,
          ]
        );

        await speakOracleMessages([compatIntro[0]]);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await speakOracleMessages([compatIntro[1] || `${userName}, I need you to understand something...`]);

        // Show compatibility visualization
        setActiveVisualization('compatibility');

        await new Promise((resolve) => setTimeout(resolve, 3000));

        playSound('chime');
        setPhase('revealing_compatibility');

        // AI-personalized compatibility explanation
        const compatLevel = compat.score >= 70 ? 'high' : compat.score >= 50 ? 'moderate' : 'challenging';
        const compatExplanation = await getAITransition(
          'compatibility_reveal',
          'compatibility_explanation',
          {
            userName: userName,
            lifePath: state.userProfile.lifePath,
          },
          [
            `Your compatibility score is ${compat.score}%.`,
            compatLevel === 'high'
              ? "There's profound potential here. Your energies complement each other in ways that could sustain you both."
              : compatLevel === 'moderate'
              ? "The connection runs deeper than the surface suggests. There's work to be done, but the foundation is solid."
              : "This path requires awareness. The friction between your numbers can become either your greatest challenge or your catalyst for growth.",
          ]
        );

        await speakOracleMessages(compatExplanation);

        setActiveVisualization(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get AI-generated relationship advice
        const relationshipAdvice = await getAIRelationshipAdvice(
          {
            userName: userName,
            lifePath: state.userProfile.lifePath,
            expression: state.userProfile.expression,
            soulUrge: state.userProfile.soulUrge,
          },
          otherName,
          otherLifePath,
          {
            score: compat.score,
            level: compatLevel,
            areas: compat.areas,
          }
        );

        // Split the advice into digestible chunks for speaking
        const adviceLines = relationshipAdvice.split('\n').filter(line => line.trim());
        if (adviceLines.length > 0) {
          await speakOracleMessages([
            "I can see the complete picture now...",
          ]);

          // Speak the first 2-3 lines of advice
          const adviceToSpeak = adviceLines.slice(0, 3);
          for (const line of adviceToSpeak) {
            await speakOracleMessages([line]);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } else {
          await speakOracleMessages([
            "I can see the complete picture now.",
            "The harmony... and the warnings.",
          ]);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await speakOracleMessages([
          "Before I reveal everything, I need a way to preserve this reading for you.",
          "Where should I send your complete numerology profile?",
        ]);

        setPhase('collecting_email');
        // No suggestions for email input
      }
    }

    // ----------------------------------------
    // PHASE: Collecting Email
    // ----------------------------------------
    else if (phase === 'collecting_email') {
      addMessage({ type: 'user', content: trimmedValue });

      const emailValidation = validateEmail(trimmedValue);
      if (!emailValidation.valid && emailValidation.errorCode) {
        await handleValidationError(emailValidation.errorCode, trimmedValue, 'email');
        return;
      }

      setUserEmail(trimmedValue);
      setPhase('preparing_report');

      const otherName = otherPerson?.name;

      await speakOracleMessages([
        "Your reading is being prepared...",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Final Oracle question
      await speakOracleMessages([
        "Before we proceed...",
        "What is the one question burning in your heart right now?",
      ]);

      setPhase('oracle_final_question');
      generateSuggestions("What is burning in your heart?");
    }

    // ----------------------------------------
    // PHASE: Oracle Final Question
    // ----------------------------------------
    else if (phase === 'oracle_final_question') {
      addMessage({ type: 'user', content: trimmedValue });

      // AI-personalized acknowledgment of their burning question
      const acknowledgment = await getAIAcknowledgment(
        trimmedValue,
        {
          userName: userProfile.fullName,
          lifePath: userProfile.lifePath,
          expression: userProfile.expression,
          soulUrge: userProfile.soulUrge,
        },
        phase
      );

      await speakOracleMessages([
        acknowledgment[0] || "The stars have heard your question...",
        "The answer lies within your complete reading.",
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const otherName = otherPerson?.name;

      await speakOracleMessages([
        otherName
          ? `Do you wish to see what the numbers reveal about you and ${otherName}?`
          : "Do you wish to see your complete numerology profile?",
      ]);

      setPhase('paywall');
      generateSuggestions("Would you like to see your complete reading?");
    }

    // ----------------------------------------
    // FREE-FORM INPUT: Acknowledge and redirect with mystical handling
    // ----------------------------------------
    else {
      addMessage({ type: 'user', content: trimmedValue });

      // Use mystical validation for off-topic redirects
      await handleValidationError('OFF_TOPIC', trimmedValue, 'freeform');
    }
    } catch (error) {
      console.error('[ChatContainer] Unhandled error in handleUserInput:', error);
      // Show a fallback message so the user isn't left hanging
      addOracleMessageWithDuration(
        "I sense a disturbance in our connection... Let us try again.",
        2000
      );
    }
  };

  /**
   * Handle skipping the relationship section
   */
  const handleSkipRelationship = async () => {
    const profile = useConversationStore.getState().userProfile;
    const criticalDates = profile.dob && profile.lifePath
      ? calculateCriticalDates(profile.dob, profile.lifePath)
      : null;

    await speakOracleMessages([
      "I understand. Some journeys are meant to be walked alone first.",
      "Your personal numerology profile holds profound insights.",
    ]);

    if (criticalDates && criticalDates.dates.length > 0) {
      const nextDate = criticalDates.dates[0];
      await speakOracleMessages([
        `I see a significant date approaching: ${nextDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}...`,
      ]);
    }

    await speakOracleMessages([
      "Before I reveal your complete reading, I need a way to preserve it for you.",
      "Where should I send your full numerology profile?",
    ]);

    setPhase('collecting_email');
    // No suggestions for email input
  };

  // ============================================
  // HANDLE SUGGESTION CARDS
  // ============================================
  const handleSuggestion = async (suggestion: string) => {
    // Skip relationship option
    if (suggestion.toLowerCase().includes('skip')) {
      addMessage({ type: 'user', content: suggestion });
      await handleSkipRelationship();
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

    if (suggestion.includes('Unlock') || suggestion.includes('Reveal') || suggestion.includes('Show me')) {
      // Paywall modal handles this - don't add message
      return;
    }

    // For all other suggestions, treat as user input
    await handleUserInput(suggestion);
  };

  const showPaywall = phase === 'paywall' && !hasPaid;

  // Show start screen before conversation begins
  if (showStartScreen) {
    const currentCopy = copyOptions[copyVariant];
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 relative">
        {/* Copy variant toggle button */}
        <button
          onClick={handleNextCopyVariant}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20
                     transition-colors border border-white/20 group"
          title={`Copy variant ${copyVariant + 1}/${copyOptions.length} - Click to switch`}
        >
          <span className="text-white/50 text-xs font-mono group-hover:text-white/70">
            {copyVariant + 1}/{copyOptions.length}
          </span>
        </button>

        <div className="text-center max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#9b59b6] flex items-center justify-center">
            <span className="text-4xl">🔮</span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-medium text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {currentCopy.headline}
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed text-base md:text-lg">
            {currentCopy.subhead}
          </p>
          <button
            onClick={handleBeginReading}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]
                     text-[#0a0a1a] font-semibold text-lg
                     hover:from-[#e0c04a] hover:to-[#c9a632] transition-all
                     box-glow-gold transform hover:scale-105"
          >
            {currentCopy.button}
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
      {/* Audio Controls */}
      <div className="absolute top-2 right-4 z-20 flex gap-2">
        {/* Voice Mute Button */}
        <button
          onClick={toggleVoiceMute}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20
                     transition-colors border border-white/20 group"
          title={voiceState.isMuted ? 'Unmute Voice' : 'Mute Voice'}
        >
          {voiceState.isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>

        {/* Ambient Sound Mute Button */}
        <button
          onClick={toggleAmbientMute}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20
                     transition-colors border border-white/20 group"
          title={isAmbientMuted ? 'Unmute Ambient' : 'Mute Ambient'}
        >
          {isAmbientMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
          )}
        </button>
      </div>

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

          {/* Calculation Animation - shows step-by-step numerology math */}
          {showCalculation && calculationDOB && (
            <CalculationAnimation
              steps={generateLifePathSteps(calculationDOB)}
              result={useConversationStore.getState().userProfile.lifePath || 0}
              resultLabel="Your Life Path"
            />
          )}

          {/* Visualization Components (inline with chat) */}
          {activeVisualization === 'sacred-geometry' && userProfile.lifePath && (
            <SacredGeometryReveal
              number={userProfile.lifePath}
              label="Life Path"
            />
          )}

          {activeVisualization === 'letter-transform' && userProfile.fullName && userProfile.expression && (
            <LetterTransform
              name={userProfile.fullName}
              number={userProfile.expression}
              label="Expression Number"
              numberType="expression"
            />
          )}

          {activeVisualization === 'compatibility' && userProfile.lifePath && otherPerson?.lifePath && compatibility && (
            <CompatibilityVisual
              userNumber={userProfile.lifePath}
              otherNumber={otherPerson.lifePath}
              compatibilityScore={compatibility.score}
              userName={userProfile.fullName?.split(' ')[0]}
              otherName={otherPerson.name}
            />
          )}

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
        dynamicSuggestions={aiSuggestions}
        isLoading={suggestionsLoading}
      />

      {/* Input area */}
      <UserInput phase={phase} onSubmit={handleUserInput} disabled={isTyping} />

      {/* Paywall modal */}
      {showPaywall && <PaywallModal isPersonalOnly={!otherPerson} />}
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
