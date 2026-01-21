'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/store/conversationStore';
import type { NormalizedAlignment } from '@/hooks/useVoiceoverStreaming';
import NumberReveal from '../Numerology/NumberReveal';
import CalculationVisual from '../Numerology/CalculationVisual';
import LetterTransform from '../Numerology/LetterTransform';
import TypewriterText from './TypewriterText';

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  /**
   * Duration for typing animation (ms). If provided, enables typewriter effect.
   * Only applies to Oracle messages.
   */
  typingDuration?: number;
  /**
   * Callback when typing animation completes
   */
  onTypingComplete?: () => void;
  /**
   * Alignment data for synced text reveal (from ElevenLabs WebSocket)
   */
  alignment?: NormalizedAlignment | null;
  /**
   * Current audio playback time in seconds
   */
  audioCurrentTime?: number;
  /**
   * Whether audio is currently playing
   */
  isAudioPlaying?: boolean;
  /**
   * Whether this message is currently being spoken (for streaming mode)
   */
  isSpeaking?: boolean;
  /**
   * Callback when calculation animation step changes (for auto-scroll)
   */
  onCalculationStepChange?: () => void;
}

export default function MessageBubble({
  message,
  isLatest,
  typingDuration,
  onTypingComplete,
  alignment,
  audioCurrentTime,
  isAudioPlaying,
  isSpeaking,
  onCalculationStepChange,
}: MessageBubbleProps) {
  const shouldReduceMotion = useReducedMotion();
  const isOracle = message.type === 'oracle';
  const isUser = message.type === 'user';
  const isNumberReveal = message.type === 'number-reveal';
  const isCalculation = message.type === 'calculation';
  const isLetterTransform = message.type === 'letter-transform';

  // Track if this message's animation has completed
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animate if: Oracle + latest + not yet animated + (has duration OR is being spoken for streaming)
  const shouldAnimate = isOracle && isLatest && !hasAnimated && (typingDuration || isSpeaking);

  // Mark as animated when component unmounts or when no longer latest
  useEffect(() => {
    if (!isLatest && isOracle) {
      setHasAnimated(true);
    }
  }, [isLatest, isOracle]);

  const handleTypingComplete = useCallback(() => {
    setHasAnimated(true);
    onTypingComplete?.();
  }, [onTypingComplete]);

  if (isNumberReveal && message.metadata?.number) {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-center my-6"
      >
        <NumberReveal number={message.metadata.number} />
      </motion.div>
    );
  }

  if (isCalculation && message.metadata?.calculationSteps) {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-center my-4"
      >
        <CalculationVisual
          steps={message.metadata.calculationSteps}
          onStepChange={onCalculationStepChange}
        />
      </motion.div>
    );
  }

  if (isLetterTransform && message.metadata?.letterTransform) {
    const { name, number, label, numberType } = message.metadata.letterTransform;
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-center my-4"
      >
        <LetterTransform
          name={name}
          number={number}
          label={label}
          numberType={numberType}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] ${
          isOracle
            ? 'oracle-border rounded-2xl rounded-tl-sm px-5 py-4'
            : isUser
            ? 'bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-2xl rounded-tr-sm px-5 py-3'
            : 'text-center text-sm text-white/50 py-2'
        }`}
      >
        {isOracle && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#d4af37] glow-gold" />
            <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider font-medium">
              The Oracle
            </span>
          </div>
        )}
        <p
          className={`leading-relaxed ${
            isOracle
              ? 'text-white/90'
              : isUser
              ? 'text-white/90'
              : 'text-white/50'
          }`}
        >
          {shouldAnimate ? (
            <TypewriterText
              text={message.content}
              duration={typingDuration}
              onComplete={handleTypingComplete}
              alignment={alignment}
              audioCurrentTime={audioCurrentTime}
              isAudioPlaying={isAudioPlaying}
            />
          ) : (
            message.content
          )}
        </p>
      </div>
    </motion.div>
  );
}
