'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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

// Note: Dynamic suggestions are always preferred
// These are only used as absolute fallbacks when AI fails
// The useDynamicSuggestions hook has contextual fallbacks that should be used first

export default function SuggestionCards({
  phase,
  onSelect,
  userName,
  otherPersonName,
  dynamicSuggestions,
  isLoading,
}: SuggestionCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  // Check if suggestions should be shown for this phase
  if (!shouldShowSuggestions(phase)) {
    return null;
  }

  // Use dynamic suggestions - these should always be provided by the hook
  // which handles both AI-generated and contextual fallbacks
  const suggestions = dynamicSuggestions || [];

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
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-wrap gap-2 justify-center px-4 py-3"
      >
        {isLoading ? (
          // Loading state - show shimmer placeholders
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={`loading-${i}`}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: shouldReduceMotion ? 0 : i * 0.08, ease: 'easeOut' }}
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
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: shouldReduceMotion ? 0 : index * 0.08, ease: 'easeOut' }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
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
