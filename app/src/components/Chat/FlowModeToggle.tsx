'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useConversationStore, FlowMode } from '@/store/conversationStore';

interface FlowModeToggleProps {
  disabled?: boolean;
}

export default function FlowModeToggle({ disabled = false }: FlowModeToggleProps) {
  const shouldReduceMotion = useReducedMotion();
  const { flowMode, setFlowMode } = useConversationStore();

  const handleToggle = (mode: FlowMode) => {
    if (!disabled) {
      setFlowMode(mode);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-white/40 text-xs uppercase tracking-wider">
        Response Mode
      </span>
      <div
        className={`relative flex items-center bg-white/5 rounded-full p-1 border border-white/10 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {/* Background slider */}
        <motion.div
          className="absolute h-[calc(100%-8px)] rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]"
          initial={false}
          animate={{
            x: flowMode === 'templated' ? 4 : '100%',
            width: flowMode === 'templated' ? 72 : 56,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          style={{ marginLeft: flowMode === 'ai' ? -4 : 0 }}
        />

        {/* Classic button */}
        <button
          onClick={() => handleToggle('templated')}
          disabled={disabled}
          className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            flowMode === 'templated'
              ? 'text-[#0a0a1a]'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Classic
        </button>

        {/* AI button */}
        <button
          onClick={() => handleToggle('ai')}
          disabled={disabled}
          className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
            flowMode === 'ai'
              ? 'text-[#0a0a1a]'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
            />
          </svg>
          AI
        </button>
      </div>

      {/* Tooltip */}
      <motion.span
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/30 text-[10px] text-center max-w-[200px]"
      >
        {flowMode === 'ai'
          ? 'AI generates unique responses for you'
          : 'Classic pre-written mystical journey'}
      </motion.span>
    </motion.div>
  );
}
