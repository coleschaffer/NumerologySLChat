'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [titleVisible, setTitleVisible] = useState(false);

  // Generate floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    // Show title first
    setTitleVisible(true);

    // Slower timing so users can follow the calculation process
    const stepDelay = 1800; // Much slower - 1.8 seconds per step
    const timers: NodeJS.Timeout[] = [];

    steps.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleSteps(index + 1);
      }, 1500 + (index + 1) * stepDelay);
      timers.push(timer);
    });

    // Show result after all steps with extra pause for dramatic effect
    const resultTimer = setTimeout(() => {
      setShowResult(true);
    }, 1500 + (steps.length + 1.5) * stepDelay);
    timers.push(resultTimer);

    // Add pulse effect
    const pulseTimer = setTimeout(() => {
      setShowPulse(true);
    }, 1500 + (steps.length + 2) * stepDelay);
    timers.push(pulseTimer);

    // Call onComplete callback
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 1500 + (steps.length + 3) * stepDelay);
    timers.push(completeTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [steps, onComplete]);

  return (
    <div className="my-8 mx-auto max-w-md relative">
      {/* Floating particles background */}
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
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
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

      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            '0 0 30px rgba(212, 175, 55, 0.1), inset 0 0 30px rgba(212, 175, 55, 0.05)',
            '0 0 50px rgba(212, 175, 55, 0.2), inset 0 0 50px rgba(212, 175, 55, 0.1)',
            '0 0 30px rgba(212, 175, 55, 0.1), inset 0 0 30px rgba(212, 175, 55, 0.05)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative bg-gradient-to-b from-[#0a0a1a]/90 to-[#1a0a2e]/90 backdrop-blur-sm rounded-2xl p-6 border border-[#d4af37]/30">
        {/* Title */}
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-[#d4af37]/60 uppercase tracking-[0.3em] mb-2"
              >
                ✦ Decoding ✦
              </motion.div>
              <h3
                className="text-lg font-medium text-[#d4af37] tracking-wider"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                YOUR BIRTH NUMBERS
              </h3>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mt-3"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {steps.slice(0, visibleSteps).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col gap-2 p-4 rounded-lg bg-white/5 border border-[#d4af37]/20"
              >
                {/* Row 1: Label and original value */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm uppercase tracking-wider font-medium">
                    {step.label}
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-mono text-white/90 text-lg"
                  >
                    {step.original}
                  </motion.span>
                </div>

                {/* Row 2: Intermediate calculation (if any) */}
                {step.intermediate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center justify-end gap-2 text-sm"
                  >
                    <span className="text-white/40">reducing:</span>
                    <span className="font-mono text-[#d4af37]/80">
                      {step.intermediate}
                    </span>
                  </motion.div>
                )}

                {/* Row 3: Final result */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: step.intermediate ? 1.0 : 0.6, duration: 0.4 }}
                  className="flex items-center justify-end gap-3 pt-1 border-t border-[#d4af37]/10"
                >
                  <span className="text-white/40 text-xs uppercase">Reduces to</span>
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: step.intermediate ? 1.2 : 0.8, type: 'spring', stiffness: 200 }}
                    className="font-mono text-[#d4af37] font-bold text-2xl"
                    style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}
                  >
                    {step.final}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summation divider */}
        {visibleSteps >= steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="my-5 flex items-center justify-center gap-4"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-[#d4af37]/50"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#d4af37]/60 text-sm"
            >
              {steps.map(s => s.final).join(' + ')} = {steps.reduce((sum, s) => sum + parseInt(s.final), 0)}
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/50 to-[#d4af37]/50"
            />
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center pt-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/50 text-xs uppercase tracking-wider block mb-3"
              >
                {resultLabel}
              </motion.span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="relative inline-block"
              >
                <motion.div
                  animate={
                    showPulse
                      ? {
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 20px rgba(212, 175, 55, 0.3)',
                            '0 0 60px rgba(212, 175, 55, 0.6)',
                            '0 0 20px rgba(212, 175, 55, 0.3)',
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: showPulse ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  className="w-20 h-20 rounded-full border-2 border-[#d4af37] flex items-center justify-center
                           bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5"
                >
                  <span
                    className="text-4xl font-bold text-[#d4af37]"
                    style={{
                      textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                      fontFamily: 'var(--font-cinzel), serif',
                    }}
                  >
                    {result}
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

/**
 * Generate calculation steps for Life Path number
 * Shows comprehensive breakdown so users understand how numbers are derived
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

  // Show the digit-by-digit breakdown
  const getDigitSum = (num: number): string => {
    const digits = String(num).split('');
    return digits.join(' + ');
  };

  const monthReduced = reduceToSingle(month);
  const dayReduced = reduceToSingle(day);
  const yearDigits = String(year).split('');
  const yearSum = yearDigits.reduce((a, b) => a + parseInt(b), 0);
  const yearReduced = reduceToSingle(yearSum);

  return [
    {
      label: 'Month',
      original: String(month).padStart(2, '0'),
      intermediate: month > 9 ? `${Math.floor(month / 10)} + ${month % 10} = ${Math.floor(month / 10) + month % 10}` : undefined,
      final: String(monthReduced),
    },
    {
      label: 'Day',
      original: String(day).padStart(2, '0'),
      intermediate: day > 9 ? `${Math.floor(day / 10)} + ${day % 10} = ${Math.floor(day / 10) + day % 10}` : undefined,
      final: String(dayReduced),
    },
    {
      label: 'Year',
      original: String(year),
      intermediate: `${yearDigits.join(' + ')} = ${yearSum}${yearSum > 9 && yearSum !== 11 && yearSum !== 22 && yearSum !== 33 ? ` → ${getDigitSum(yearSum)} = ${yearReduced}` : ''}`,
      final: String(yearReduced),
    },
  ];
}
