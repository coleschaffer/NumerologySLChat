'use client';

import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
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
