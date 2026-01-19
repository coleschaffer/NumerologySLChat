'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationPhase } from '@/store/conversationStore';

interface SuggestionCardsProps {
  phase: ConversationPhase;
  onSelect: (suggestion: string) => void;
  userName?: string;
  otherPersonName?: string;
}

const suggestionsByPhase: Record<ConversationPhase, string[]> = {
  opening: [],
  collecting_dob: [],
  first_reveal: [
    'Tell me more about this number',
    'What does this mean for my life?',
    'I want to understand myself better',
  ],
  collecting_name: [],
  deeper_reveal: [
    'What about my love life?',
    'What career suits me?',
    "What's blocking my success?",
  ],
  relationship_hook: [],
  collecting_other_name: [],
  collecting_other_dob: [],
  compatibility_tease: [
    'Tell me about our connection',
    'What challenges do we face?',
    'Is this meant to be?',
  ],
  paywall: [
    'Unlock My Complete Reading',
    'Reveal Our Compatibility',
    'Maybe later',
  ],
  paid_reading: [
    'Tell me about my year ahead',
    'What about another person?',
    'Explain my soul urge',
  ],
};

export default function SuggestionCards({
  phase,
  onSelect,
  userName,
  otherPersonName,
}: SuggestionCardsProps) {
  const suggestions = suggestionsByPhase[phase] || [];

  if (suggestions.length === 0) return null;

  // Replace placeholders
  const processedSuggestions = suggestions.map((s) =>
    s
      .replace('[Name]', userName || 'them')
      .replace('[OtherName]', otherPersonName || 'them')
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap gap-2 justify-center px-4 py-3"
      >
        {processedSuggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(suggestion)}
            className={`px-4 py-2.5 rounded-full text-sm transition-all ${
              suggestion.includes('Unlock') || suggestion.includes('Reveal')
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a1a] font-medium box-glow-gold'
                : suggestion === 'Maybe later'
                ? 'bg-transparent border border-white/20 text-white/60 hover:border-white/40'
                : 'bg-white/5 border border-[#d4af37]/30 text-white/80 hover:bg-white/10 hover:border-[#d4af37]/50'
            }`}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
