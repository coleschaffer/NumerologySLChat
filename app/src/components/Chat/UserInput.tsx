'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationPhase } from '@/store/conversationStore';

interface UserInputProps {
  phase: ConversationPhase;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function UserInput({ phase, onSubmit, disabled }: UserInputProps) {
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when phase changes and not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !textValue.trim()) return;

    onSubmit(textValue.trim());
    setTextValue('');
  };

  const getPlaceholder = () => {
    switch (phase) {
      case 'collecting_dob':
        return 'Type your birthday (e.g., March 15, 1990)...';
      case 'collecting_name':
        return 'Enter your full birth name...';
      case 'collecting_other_name':
        return 'Enter their name...';
      case 'collecting_other_dob':
        return 'Type their birthday...';
      case 'relationship_hook':
        return "Enter someone's name...";
      case 'collecting_email':
        return 'Enter your email address...';
      default:
        return 'Type your message...';
    }
  };

  const getInputType = () => {
    if (phase === 'collecting_email') return 'email';
    return 'text';
  };

  // Hide input during certain phases (Oracle is speaking / paywall)
  const hideInput =
    phase === 'opening' ||
    phase === 'first_reveal' ||
    phase === 'deeper_reveal' ||
    phase === 'compatibility_tease' ||
    phase === 'paywall' ||
    phase === 'personal_paywall';

  if (hideInput) return null;

  const isDatePhase = phase === 'collecting_dob' || phase === 'collecting_other_dob';

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onSubmit={handleSubmit}
        className="px-4 py-4"
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type={getInputType()}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={disabled}
            autoComplete={phase === 'collecting_email' ? 'email' : 'off'}
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

        {isDatePhase && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-white/40 mt-2"
          >
            e.g., "March 15, 1990" or "3/15/1990"
          </motion.p>
        )}
        {phase === 'collecting_email' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-white/40 mt-2"
          >
            Your reading will be saved and sent to this address
          </motion.p>
        )}
      </motion.form>
    </AnimatePresence>
  );
}
