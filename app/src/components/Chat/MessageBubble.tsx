'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Message } from '@/store/conversationStore';
import NumberReveal from '../Numerology/NumberReveal';
import CalculationVisual from '../Numerology/CalculationVisual';
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
}

export default function MessageBubble({
  message,
  isLatest,
  typingDuration,
  onTypingComplete,
}: MessageBubbleProps) {
  const isOracle = message.type === 'oracle';
  const isUser = message.type === 'user';
  const isNumberReveal = message.type === 'number-reveal';
  const isCalculation = message.type === 'calculation';

  // Track if this message's animation has completed
  const [hasAnimated, setHasAnimated] = useState(false);

  // Only animate if this is the latest Oracle message and hasn't animated yet
  const shouldAnimate = isOracle && isLatest && !hasAnimated && typingDuration;

  // Mark as animated when component unmounts or when no longer latest
  useEffect(() => {
    if (!isLatest && isOracle) {
      setHasAnimated(true);
    }
  }, [isLatest, isOracle]);

  const handleTypingComplete = () => {
    setHasAnimated(true);
    onTypingComplete?.();
  };

  if (isNumberReveal && message.metadata?.number) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex justify-center my-6"
      >
        <NumberReveal number={message.metadata.number} />
      </motion.div>
    );
  }

  if (isCalculation && message.metadata?.calculationSteps) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center my-4"
      >
        <CalculationVisual steps={message.metadata.calculationSteps} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
            />
          ) : (
            message.content
          )}
        </p>
      </div>
    </motion.div>
  );
}
