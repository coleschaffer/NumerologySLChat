'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LetterTransformProps {
  name: string;
  number: number;
  onComplete?: () => void;
  label?: string;
  /** Type of number being calculated */
  numberType?: 'expression' | 'soul-urge' | 'personality';
}

// Letter to number mapping (Pythagorean system)
const letterValues: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

interface LetterData {
  char: string;
  value: number | null;
  isVowel: boolean;
  isSpace: boolean;
  index: number;
}

/**
 * LetterTransform - Name letters morph into numbers
 *
 * Creates a mystical effect where each letter of the name
 * transforms into its numerological value, then all values
 * combine into the final number.
 */
export default function LetterTransform({
  name,
  number,
  onComplete,
  label = 'Your Number',
  numberType = 'expression',
}: LetterTransformProps) {
  const [phase, setPhase] = useState<'name' | 'transforming' | 'summing' | 'revealed' | 'complete'>('name');
  const [transformedIndex, setTransformedIndex] = useState(-1);
  const [showSum, setShowSum] = useState(false);

  // Parse name into letter data
  const letters = useMemo((): LetterData[] => {
    return name.split('').map((char, index) => {
      const lower = char.toLowerCase();
      const isSpace = char === ' ';
      const isVowel = vowels.has(lower);
      let value: number | null = null;

      // Determine which letters get values based on number type
      if (!isSpace && letterValues[lower] !== undefined) {
        if (numberType === 'expression') {
          value = letterValues[lower];
        } else if (numberType === 'soul-urge' && isVowel) {
          value = letterValues[lower];
        } else if (numberType === 'personality' && !isVowel) {
          value = letterValues[lower];
        }
      }

      return { char, value, isVowel, isSpace, index };
    });
  }, [name, numberType]);

  // Calculate running sum for animation
  const runningSum = useMemo(() => {
    let sum = 0;
    return letters.map((letter) => {
      if (letter.value !== null) {
        sum += letter.value;
      }
      return sum;
    });
  }, [letters]);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Start transforming letters one by one
    timers.push(setTimeout(() => {
      setPhase('transforming');
      let index = 0;
      const transformInterval = setInterval(() => {
        if (index >= letters.length) {
          clearInterval(transformInterval);
          setPhase('summing');
          return;
        }
        setTransformedIndex(index);
        index++;
      }, 150);
    }, 800));

    // Show sum animation
    timers.push(setTimeout(() => {
      setShowSum(true);
    }, 800 + letters.length * 150 + 300));

    // Reveal final number
    timers.push(setTimeout(() => {
      setPhase('revealed');
    }, 800 + letters.length * 150 + 1200));

    // Complete
    timers.push(setTimeout(() => {
      setPhase('complete');
      onComplete?.();
    }, 800 + letters.length * 150 + 2500));

    return () => timers.forEach(clearTimeout);
  }, [letters.length, onComplete]);

  return (
    <div className="relative w-full max-w-md mx-auto py-8">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'revealed' || phase === 'complete' ? 0.3 : 0.1,
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* Letters container */}
      <div className="flex flex-wrap justify-center gap-1 px-4 mb-6">
        {letters.map((letter, i) => (
          <motion.div
            key={i}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {letter.isSpace ? (
              <span className="w-4 inline-block" />
            ) : (
              <div className="relative w-8 h-12 flex items-center justify-center">
                {/* Letter (fades out when transformed) */}
                <AnimatePresence>
                  {transformedIndex < i && (
                    <motion.span
                      className={`absolute text-2xl font-medium ${
                        letter.isVowel ? 'text-[#d4af37]' : 'text-white/80'
                      }`}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.5, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontFamily: 'var(--font-cinzel), serif' }}
                    >
                      {letter.char}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Number (appears when transformed) */}
                <AnimatePresence>
                  {transformedIndex >= i && letter.value !== null && (
                    <motion.span
                      className="absolute text-2xl font-bold text-[#d4af37]"
                      initial={{ opacity: 0, scale: 1.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      style={{
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                        fontFamily: 'var(--font-cinzel), serif',
                      }}
                    >
                      {letter.value}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Greyed out letter (for letters not used in this calculation) */}
                {transformedIndex >= i && letter.value === null && (
                  <motion.span
                    className="absolute text-2xl text-white/20"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0.2 }}
                    style={{ fontFamily: 'var(--font-cinzel), serif' }}
                  >
                    {letter.char}
                  </motion.span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sum indicator */}
      <AnimatePresence>
        {showSum && phase !== 'revealed' && phase !== 'complete' && (
          <motion.div
            className="flex justify-center items-center gap-2 text-[#d4af37]/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-sm">Sum:</span>
            <motion.span
              className="text-xl font-bold"
              key={runningSum[runningSum.length - 1]}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {runningSum[runningSum.length - 1]}
            </motion.span>
            <span className="text-sm mx-2">→</span>
            <span className="text-xl font-bold text-[#d4af37]">{number}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final number reveal */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'complete') && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          >
            <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider mb-1">
              {label}
            </span>
            <span
              className="text-6xl font-bold text-[#d4af37]"
              style={{
                textShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.3)',
                fontFamily: 'var(--font-cinzel), serif',
              }}
            >
              {number}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
