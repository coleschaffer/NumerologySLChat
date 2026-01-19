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
        <span className="text-sm text-[#d4af37]/70 italic mr-2">
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
