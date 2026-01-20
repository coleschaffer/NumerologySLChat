'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationPhase } from '@/lib/phaseConfig';
import { shouldShowSuggestions } from '@/lib/phaseConfig';

interface SuggestionCardsProps {
  phase: ConversationPhase;
  onSelect: (suggestion: string) => void;
  userName?: string;
  otherPersonName?: string;
  /** Dynamic AI-generated suggestions - takes priority over static ones */
  dynamicSuggestions?: string[];
  /** Whether dynamic suggestions are loading */
  isLoading?: boolean;
}

/**
 * Fallback static suggestions for when dynamic suggestions aren't available
 */
const staticSuggestionsByPhase: Partial<Record<ConversationPhase, string[]>> = {
  oracle_question_1: [
    'Tell me more about this number',
    'What does this mean for my life?',
    'I want to understand myself better',
  ],
  oracle_question_2: [
    'What about my love life?',
    'What career suits me?',
    "What's blocking my success?",
  ],
  oracle_question_other_person: [
    'Yes, someone keeps coming to mind',
    'Skip for now',
  ],
  collecting_other_info: [],
  oracle_question_relationship: [
    'Tell me about our connection',
    'What challenges do we face?',
    'Is this meant to be?',
  ],
  oracle_final_question: [
    'Show me my complete reading',
    'What else can you reveal?',
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
  dynamicSuggestions,
  isLoading,
}: SuggestionCardsProps) {
  // Check if suggestions should be shown for this phase
  if (!shouldShowSuggestions(phase)) {
    return null;
  }

  // Use dynamic suggestions if available, otherwise fall back to static
  const suggestions = dynamicSuggestions && dynamicSuggestions.length > 0
    ? dynamicSuggestions
    : staticSuggestionsByPhase[phase] || [];

  if (suggestions.length === 0 && !isLoading) return null;

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
        {isLoading ? (
          // Loading state - show shimmer placeholders
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={`loading-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 animate-pulse"
              >
                <div className="h-4 w-24 bg-white/10 rounded" />
              </motion.div>
            ))}
          </>
        ) : (
          processedSuggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(suggestion)}
              className={`px-4 py-2.5 rounded-full text-sm transition-all ${getButtonStyle(suggestion)}`}
            >
              {suggestion}
            </motion.button>
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get button styling based on the suggestion content
 */
function getButtonStyle(suggestion: string): string {
  // Call-to-action buttons (unlock, reveal, show)
  if (
    suggestion.includes('Unlock') ||
    suggestion.includes('Reveal') ||
    suggestion.includes('Show me')
  ) {
    return 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a1a] font-medium box-glow-gold';
  }

  // Skip/later buttons
  if (
    suggestion === 'Maybe later' ||
    suggestion.includes('Skip')
  ) {
    return 'bg-transparent border border-white/20 text-white/60 hover:border-white/40';
  }

  // Default style
  return 'bg-white/5 border border-[#d4af37]/30 text-white/80 hover:bg-white/10 hover:border-[#d4af37]/50';
}
