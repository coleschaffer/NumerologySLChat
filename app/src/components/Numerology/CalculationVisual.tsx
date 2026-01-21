'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import type { getLifePathCalculationSteps } from '@/lib/numerology';

interface CalculationVisualProps {
  steps: ReturnType<typeof getLifePathCalculationSteps>;
  onStepChange?: () => void; // Callback for scroll triggers
}

/**
 * CalculationVisual - Shows detailed numerology calculation breakdown
 */
export default function CalculationVisual({ steps, onStepChange }: CalculationVisualProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showSummation, setShowSummation] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Generate floating particles (reduced count for performance)
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  // Create step data from the calculation steps
  const stepData = useMemo(() => {
    const getIntermediate = (original: number, reduced: number): string | undefined => {
      if (original <= 9) return undefined;
      const digits = String(original).split('');
      const sum = digits.reduce((a, b) => a + parseInt(b), 0);
      if (sum === reduced) {
        return `${digits.join(' + ')} = ${sum}`;
      }
      return `${digits.join(' + ')} = ${sum}`;
    };

    return [
      {
        label: 'Month',
        original: String(steps.month.original).padStart(2, '0'),
        intermediate: getIntermediate(steps.month.original, steps.month.reduced),
        final: String(steps.month.reduced),
      },
      {
        label: 'Day',
        original: String(steps.day.original).padStart(2, '0'),
        intermediate: getIntermediate(steps.day.original, steps.day.reduced),
        final: String(steps.day.reduced),
      },
      {
        label: 'Year',
        original: String(steps.year.original),
        intermediate: (() => {
          const digits = String(steps.year.original).split('');
          const sum = digits.reduce((a, b) => a + parseInt(b), 0);
          if (sum === steps.year.reduced) {
            return `${digits.join(' + ')} = ${sum}`;
          }
          const sumDigits = String(sum).split('');
          return `${digits.join(' + ')} = ${sum} → ${sumDigits.join(' + ')} = ${steps.year.reduced}`;
        })(),
        final: String(steps.year.reduced),
      },
    ];
  }, [steps]);

  // Calculate reduction steps for sum → final
  const reductionSteps = useMemo(() => {
    if (steps.sum === steps.final) return null;

    const reductions: string[] = [];
    let current = steps.sum;

    while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
      const digits = String(current).split('');
      const sum = digits.reduce((a, b) => a + parseInt(b), 0);
      reductions.push(`${digits.join(' + ')} = ${sum}`);
      current = sum;
    }

    return reductions;
  }, [steps.sum, steps.final]);

  useEffect(() => {
    const stepDelay = 800;
    const timers: NodeJS.Timeout[] = [];

    // Show steps one by one
    stepData.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleSteps(index + 1);
        onStepChange?.();
      }, 500 + index * stepDelay);
      timers.push(timer);
    });

    // Show summation
    const summationTimer = setTimeout(() => {
      setShowSummation(true);
      onStepChange?.();
    }, 500 + stepData.length * stepDelay + 400);
    timers.push(summationTimer);

    // Show reduction (if needed)
    if (reductionSteps) {
      const reductionTimer = setTimeout(() => {
        setShowReduction(true);
        onStepChange?.();
      }, 500 + stepData.length * stepDelay + 900);
      timers.push(reductionTimer);
    }

    // Show result
    const resultTimer = setTimeout(() => {
      setShowResult(true);
      onStepChange?.();
    }, 500 + stepData.length * stepDelay + (reductionSteps ? 1400 : 900));
    timers.push(resultTimer);

    // Start pulse
    const pulseTimer = setTimeout(() => {
      setShowPulse(true);
    }, 500 + stepData.length * stepDelay + (reductionSteps ? 1800 : 1300));
    timers.push(pulseTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [stepData, reductionSteps, onStepChange]);

  return (
    <div className="my-6 mx-auto max-w-lg w-full relative">
      {/* Floating particles background */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-[#d4af37]"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                willChange: 'transform, opacity',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Outer glow - uses opacity animation instead of boxShadow for performance */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.15), inset 0 0 30px rgba(212, 175, 55, 0.08)',
        }}
        animate={shouldReduceMotion ? {} : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative bg-gradient-to-b from-[#0a0a1a]/90 to-[#1a0a2e]/90 backdrop-blur-sm rounded-2xl p-5 border border-[#d4af37]/30">
        {/* Title */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center mb-5"
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-[#d4af37]/60 uppercase tracking-[0.3em] mb-1"
          >
            ✦ Decoding ✦
          </motion.div>
          <h3
            className="text-base font-medium text-[#d4af37] tracking-wider"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            YOUR BIRTH NUMBERS
          </h3>
          <motion.div
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: 0.3, ease: 'easeOut' }}
            className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mt-3"
          />
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {stepData.slice(0, visibleSteps).map((step, index) => (
              <motion.div
                key={index}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -10, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/5 border border-[#d4af37]/20"
              >
                {/* Row 1: Label and original value */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs uppercase tracking-wider font-medium">
                    {step.label}
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-white/90 text-base"
                  >
                    {step.original}
                  </motion.span>
                </div>

                {/* Row 2: Intermediate calculation (if any) */}
                {step.intermediate && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-end gap-2 text-xs"
                  >
                    <span className="text-white/40">reducing:</span>
                    <span className="font-mono text-[#d4af37]/80">
                      {step.intermediate}
                    </span>
                  </motion.div>
                )}

                {/* Row 3: Final result */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-end gap-2 pt-1 border-t border-[#d4af37]/10"
                >
                  <span className="text-white/40 text-xs uppercase">Reduces to</span>
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="font-mono text-[#d4af37] font-bold text-xl"
                    style={{ textShadow: '0 0 8px rgba(212, 175, 55, 0.5)' }}
                  >
                    {step.final}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summation divider */}
        <AnimatePresence>
          {showSummation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="my-4 flex items-center justify-center gap-3"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-[#d4af37]/50"
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#d4af37]/70 text-sm font-mono"
              >
                {steps.month.reduced} + {steps.day.reduced} + {steps.year.reduced} = {steps.sum}
              </motion.span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/50 to-[#d4af37]/50"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reduction animation (if sum needs to be reduced further) */}
        <AnimatePresence>
          {showReduction && reductionSteps && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4 p-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30"
            >
              <div className="text-center">
                <span className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                  Reducing to single digit
                </span>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="font-mono text-white/80 text-lg">{steps.sum}</span>
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#d4af37]/60"
                  >
                    →
                  </motion.span>
                  {reductionSteps.map((reduction, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.2 }}
                      className="font-mono text-[#d4af37] text-lg"
                    >
                      {reduction}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + reductionSteps.length * 0.2 }}
                    className="text-[#d4af37]/60"
                  >
                    →
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + reductionSteps.length * 0.2, type: 'spring' }}
                    className="font-mono text-[#d4af37] font-bold text-2xl"
                    style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
                  >
                    {steps.final}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center pt-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/50 text-xs uppercase tracking-wider block mb-2"
              >
                Your Life Path Number
              </motion.span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative inline-block"
              >
                <motion.div
                  animate={
                    showPulse
                      ? {
                          scale: [1, 1.08, 1],
                          boxShadow: [
                            '0 0 15px rgba(212, 175, 55, 0.3)',
                            '0 0 40px rgba(212, 175, 55, 0.5)',
                            '0 0 15px rgba(212, 175, 55, 0.3)',
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: showPulse ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 rounded-full border-2 border-[#d4af37] flex items-center justify-center
                           bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5"
                >
                  <span
                    className="text-3xl font-bold text-[#d4af37]"
                    style={{
                      textShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
                      fontFamily: 'var(--font-cinzel), serif',
                    }}
                  >
                    {steps.final}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
