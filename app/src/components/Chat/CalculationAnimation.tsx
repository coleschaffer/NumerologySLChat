'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalculationStep {
  label: string;
  original: string;
  intermediate?: string;
  final: string;
}

interface CalculationAnimationProps {
  steps: CalculationStep[];
  result: number;
  resultLabel: string;
  onComplete?: () => void;
}

/**
 * CalculationAnimation - Shows step-by-step numerology math
 *
 * Creates the feeling of "work being done" - dramatically increases
 * perceived value and engagement (from VSL analysis).
 */
export default function CalculationAnimation({
  steps,
  result,
  resultLabel,
  onComplete,
}: CalculationAnimationProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Animate steps one by one
    const stepDelay = 800;
    const timers: NodeJS.Timeout[] = [];

    steps.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleSteps(index + 1);
      }, (index + 1) * stepDelay);
      timers.push(timer);
    });

    // Show result after all steps
    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, (steps.length + 1) * stepDelay);
    timers.push(resultTimer);

    // Add pulse effect
    const pulseTimer = setTimeout(() => {
      setShowPulse(true);
    }, (steps.length + 1.5) * stepDelay);
    timers.push(pulseTimer);

    // Call onComplete callback
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, (steps.length + 2.5) * stepDelay);
    timers.push(completeTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [steps, onComplete]);

  return (
    <div className="my-6 mx-auto max-w-sm">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-[#d4af37]/20">
        {/* Steps */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {steps.slice(0, visibleSteps).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-white/50 text-sm min-w-[80px]">
                  {step.label}
                </span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: step.intermediate ? 0.4 : 1 }}
                    className="font-mono text-white/70 text-sm"
                  >
                    {step.original}
                  </motion.span>
                  {step.intermediate && (
                    <>
                      <span className="text-[#d4af37]/50">→</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-mono text-[#d4af37]/70 text-sm"
                      >
                        {step.intermediate}
                      </motion.span>
                    </>
                  )}
                  <span className="text-[#d4af37]/50">→</span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="font-mono text-[#d4af37] font-bold"
                  >
                    {step.final}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Divider */}
        {visibleSteps >= steps.length && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent my-4"
          />
        )}

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center"
            >
              <span className="text-white/60 text-sm block mb-1">
                {resultLabel}
              </span>
              <motion.div
                animate={
                  showPulse
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(212, 175, 55, 0)',
                          '0 0 30px 10px rgba(212, 175, 55, 0.3)',
                          '0 0 0 0 rgba(212, 175, 55, 0)',
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: showPulse ? 2 : 0,
                  ease: 'easeInOut',
                }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full
                         bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-[#0a0a1a]"
              >
                <span className="text-3xl font-bold">{result}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Generate calculation steps for Life Path number
 */
export function generateLifePathSteps(dob: Date): CalculationStep[] {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  const year = dob.getFullYear();

  const reduceToSingle = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = String(num)
        .split('')
        .reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
  };

  const monthReduced = reduceToSingle(month);
  const dayReduced = reduceToSingle(day);
  const yearSum = String(year)
    .split('')
    .reduce((a, b) => a + parseInt(b), 0);
  const yearReduced = reduceToSingle(yearSum);

  return [
    {
      label: 'Month',
      original: String(month),
      intermediate: month > 9 ? String(month) : undefined,
      final: String(monthReduced),
    },
    {
      label: 'Day',
      original: String(day),
      intermediate: day > 9 ? `${Math.floor(day / 10)}+${day % 10}` : undefined,
      final: String(dayReduced),
    },
    {
      label: 'Year',
      original: String(year),
      intermediate: String(yearSum),
      final: String(yearReduced),
    },
  ];
}
