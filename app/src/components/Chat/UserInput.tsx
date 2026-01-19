'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationPhase } from '@/store/conversationStore';

interface UserInputProps {
  phase: ConversationPhase;
  onSubmit: (value: string | Date) => void;
  disabled?: boolean;
}

export default function UserInput({ phase, onSubmit, disabled }: UserInputProps) {
  const [textValue, setTextValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine input type based on phase
  const isDateInput =
    phase === 'collecting_dob' || phase === 'collecting_other_dob';
  const isNameInput =
    phase === 'collecting_name' || phase === 'collecting_other_name';

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (isDateInput && dateValue) {
      const date = new Date(dateValue + 'T12:00:00');
      onSubmit(date);
      setDateValue('');
    } else if (textValue.trim()) {
      onSubmit(textValue.trim());
      setTextValue('');
    }
  };

  const getPlaceholder = () => {
    switch (phase) {
      case 'collecting_dob':
        return 'Select your birth date';
      case 'collecting_name':
        return 'Enter your full birth name...';
      case 'collecting_other_name':
        return 'Enter their name...';
      case 'collecting_other_dob':
        return 'Select their birth date';
      case 'relationship_hook':
        return "Enter someone's name...";
      default:
        return 'Type your message...';
    }
  };

  // Hide input during certain phases
  const hideInput =
    phase === 'opening' ||
    phase === 'first_reveal' ||
    phase === 'deeper_reveal' ||
    phase === 'compatibility_tease' ||
    phase === 'paywall';

  if (hideInput) return null;

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
          {isDateInput ? (
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                disabled={disabled}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-[#d4af37]/30
                         text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]/60
                         focus:ring-2 focus:ring-[#d4af37]/20 transition-all disabled:opacity-50
                         [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50
                         [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={disabled}
              className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-[#d4af37]/30
                       text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]/60
                       focus:ring-2 focus:ring-[#d4af37]/20 transition-all disabled:opacity-50"
            />
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={disabled || (!textValue.trim() && !dateValue)}
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

        {isDateInput && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-white/40 mt-2"
          >
            Your birth date unlocks the secrets of your Life Path
          </motion.p>
        )}
      </motion.form>
    </AnimatePresence>
  );
}
