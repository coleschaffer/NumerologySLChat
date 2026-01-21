'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface NumberRevealProps {
  number: number;
  label?: string;
}

export default function NumberReveal({ number, label }: NumberRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: shouldReduceMotion ? 0 : 0.2,
      }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { rotate: -30 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  boxShadow: [
                    '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
                    '0 0 40px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
                    '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
                  ],
                }
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full border-2 border-[#d4af37]/50 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a1628]/80"
          style={{
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
          }}
        >
          <motion.span
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: 0.3, ease: 'easeOut' }}
            className="text-5xl font-bold text-[#d4af37] glow-gold"
            style={{ fontFamily: 'serif' }}
          >
            {number}
          </motion.span>
        </motion.div>

        {/* Decorative ring */}
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-[#d4af37]/20"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(212, 175, 55, 0.1), transparent)`,
          }}
        />
      </motion.div>

      {label && (
        <motion.span
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: 0.3, ease: 'easeOut' }}
          className="text-sm text-[#d4af37]/70 uppercase tracking-wider"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}
