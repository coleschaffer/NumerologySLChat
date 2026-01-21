'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ConversationPhase } from '@/lib/phaseConfig';
import { getPhaseConfig, shouldShowInput } from '@/lib/phaseConfig';

interface UserInputProps {
  phase: ConversationPhase;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function UserInput({ phase, onSubmit, disabled }: UserInputProps) {
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Get phase configuration
  const config = getPhaseConfig(phase);

  // Focus input when phase changes and not disabled
  useEffect(() => {
    if (!disabled && inputRef.current && shouldShowInput(phase)) {
      inputRef.current.focus();
    }
  }, [phase, disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !textValue.trim()) return;

    onSubmit(textValue.trim());
    setTextValue('');
  };

  // Use config-based visibility
  if (!shouldShowInput(phase)) {
    return null;
  }

  const getInputType = () => {
    switch (config.inputType) {
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  };

  const getAutoComplete = () => {
    switch (config.inputType) {
      case 'email':
        return 'email';
      case 'name':
        return 'name';
      default:
        return 'off';
    }
  };

  const isDatePhase = config.validation === 'date';
  const isEmailPhase = config.validation === 'email';

  return (
    <AnimatePresence>
      <motion.form
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className="px-4 py-4"
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type={getInputType()}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={config.placeholder}
            disabled={disabled}
            autoComplete={getAutoComplete()}
            className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-[#d4af37]/30
                     text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]/60
                     focus:ring-2 focus:ring-[#d4af37]/20 transition-all disabled:opacity-50"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={disabled || !textValue.trim()}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]
                     text-[#0a0a1a] font-medium disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-[#e0c04a] hover:to-[#c9a632] transition-all box-glow-gold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </motion.button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}
