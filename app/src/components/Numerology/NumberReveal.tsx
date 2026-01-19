'use client';

import { motion } from 'framer-motion';

interface NumberRevealProps {
  number: number;
  label?: string;
}

export default function NumberReveal({ number, label }: NumberRevealProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        initial={{ rotate: -180 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
              '0 0 40px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
              '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full border-2 border-[#d4af37]/50 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a1628]/80"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-5xl font-bold text-[#d4af37] glow-gold"
            style={{ fontFamily: 'serif' }}
          >
            {number}
          </motion.span>
        </motion.div>

        {/* Decorative ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-[#d4af37]/20"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(212, 175, 55, 0.1), transparent)`,
          }}
        />
      </motion.div>

      {label && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-[#d4af37]/70 uppercase tracking-wider"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}
