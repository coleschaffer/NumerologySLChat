'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/store/conversationStore';
import NumberReveal from '../Numerology/NumberReveal';
import CalculationVisual from '../Numerology/CalculationVisual';

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isOracle = message.type === 'oracle';
  const isUser = message.type === 'user';
  const isNumberReveal = message.type === 'number-reveal';
  const isCalculation = message.type === 'calculation';

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
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
