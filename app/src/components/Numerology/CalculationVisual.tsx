'use client';

import { motion } from 'framer-motion';
import type { getLifePathCalculationSteps } from '@/lib/numerology';

interface CalculationVisualProps {
  steps: ReturnType<typeof getLifePathCalculationSteps>;
}

export default function CalculationVisual({ steps }: CalculationVisualProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="oracle-border rounded-xl px-6 py-5 max-w-sm w-full"
    >
      <motion.div
        variants={itemVariants}
        className="text-xs text-[#d4af37]/70 uppercase tracking-wider mb-4"
      >
        Decoding Your Birth Numbers
      </motion.div>

      <div className="space-y-3 font-mono text-sm">
        {/* Month */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-white/50 w-16">Month:</span>
          <span className="text-white/80">{steps.month.original}</span>
          <span className="text-[#d4af37]/50">→</span>
          <span className="text-[#d4af37] glow-gold">{steps.month.reduced}</span>
        </motion.div>

        {/* Day */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-white/50 w-16">Day:</span>
          <span className="text-white/80">{steps.day.original}</span>
          <span className="text-[#d4af37]/50">→</span>
          <span className="text-[#d4af37] glow-gold">{steps.day.reduced}</span>
        </motion.div>

        {/* Year */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-white/50 w-16">Year:</span>
          <span className="text-white/80">{steps.year.original}</span>
          <span className="text-[#d4af37]/50">→</span>
          <span className="text-[#d4af37] glow-gold">{steps.year.reduced}</span>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="border-t border-[#d4af37]/20 my-3"
        />

        {/* Sum */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="text-white/50 w-16">Sum:</span>
          <span className="text-white/80">
            {steps.month.reduced} + {steps.day.reduced} + {steps.year.reduced}
          </span>
          <span className="text-[#d4af37]/50">=</span>
          <span className="text-[#d4af37]">{steps.sum}</span>
        </motion.div>

        {/* Final */}
        {steps.sum !== steps.final && (
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="text-white/50 w-16">Reduce:</span>
            <span className="text-white/80">{steps.sum}</span>
            <span className="text-[#d4af37]/50">→</span>
            <motion.span
              animate={{
                textShadow: [
                  '0 0 10px rgba(212, 175, 55, 0.5)',
                  '0 0 20px rgba(212, 175, 55, 0.8)',
                  '0 0 10px rgba(212, 175, 55, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-lg font-bold text-[#d4af37]"
            >
              {steps.final}
            </motion.span>
          </motion.div>
        )}

        {/* Life Path Label */}
        <motion.div
          variants={itemVariants}
          className="mt-4 pt-3 border-t border-[#d4af37]/20 text-center"
        >
          <span className="text-[#d4af37]/70 text-xs uppercase tracking-wider">
            Your Life Path Number
          </span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            className="mt-2"
          >
            <span className="text-4xl font-bold text-[#d4af37] glow-gold">
              {steps.final}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
