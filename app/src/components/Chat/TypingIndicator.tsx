'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function TypingIndicator() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl oracle-border">
        <span
          className="text-sm italic mr-2 shimmer-text"
          style={{
            background: 'linear-gradient(90deg, rgba(212,175,55,0.7) 0%, rgba(245,215,142,1) 50%, rgba(212,175,55,0.7) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 2.5s ease-in-out infinite',
          }}
        >
          The Oracle is reading the stars
        </span>
        <div className="flex gap-1">
          <span className="typing-dot w-2 h-2 rounded-full bg-[#d4af37]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#d4af37]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#d4af37]" />
        </div>
      </div>
    </motion.div>
  );
}
