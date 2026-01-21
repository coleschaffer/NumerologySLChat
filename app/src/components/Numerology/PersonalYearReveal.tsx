'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalYearRevealProps {
  year: number;
  onComplete?: () => void;
  /** If true, stays visible indefinitely (doesn't auto-fade) */
  persist?: boolean;
}

/**
 * PersonalYearReveal - 9-year cycle visualization
 *
 * Creates a mystical effect where 9 circles arranged in a ring
 * represent the numerology cycle, with the current year highlighted.
 * An animated journey shows progression through the cycle.
 */
export default function PersonalYearReveal({
  year,
  onComplete,
  persist = false,
}: PersonalYearRevealProps) {
  const [phase, setPhase] = useState<'appearing' | 'journey' | 'revealed' | 'complete'>('appearing');
  const [journeyProgress, setJourneyProgress] = useState(0);

  // Normalize year to 1-9 (master numbers 11, 22, 33 reduce to their base)
  const normalizedYear = year <= 9 ? year : year === 11 ? 2 : year === 22 ? 4 : year === 33 ? 6 : year % 9 || 9;

  // Generate the 9 positions around the circle
  const cyclePositions = useMemo(() => {
    const positions = [];
    for (let i = 1; i <= 9; i++) {
      // Start from top (-90 degrees) and go clockwise
      const angle = ((i - 1) / 9) * 2 * Math.PI - Math.PI / 2;
      const radius = 35;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      positions.push({
        number: i,
        x,
        y,
        angle: (angle * 180) / Math.PI,
        isActive: i === normalizedYear,
        isPast: i < normalizedYear,
        isFuture: i > normalizedYear,
      });
    }
    return positions;
  }, [normalizedYear]);

  // Year themes for tooltips/labels
  const yearThemes: Record<number, string> = {
    1: 'New Beginnings',
    2: 'Partnership',
    3: 'Creativity',
    4: 'Foundation',
    5: 'Change',
    6: 'Responsibility',
    7: 'Reflection',
    8: 'Abundance',
    9: 'Completion',
  };

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Circles appear (staggered)
    timers.push(setTimeout(() => setPhase('journey'), 1500));

    // Phase 2: Journey animation - light travels around the ring
    timers.push(setTimeout(() => {
      const journeyInterval = setInterval(() => {
        setJourneyProgress((prev) => {
          const target = normalizedYear / 9;
          if (prev >= target) {
            clearInterval(journeyInterval);
            return target;
          }
          return prev + 0.015;
        });
      }, 40);
      timers.push(journeyInterval as unknown as NodeJS.Timeout);
    }, 1600));

    // Phase 3: Revealed
    timers.push(setTimeout(() => setPhase('revealed'), 3000));

    // Phase 4: Complete (only if not persisting)
    if (!persist) {
      timers.push(setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, 5000));
    } else {
      // Still call onComplete but don't change phase
      timers.push(setTimeout(() => {
        onComplete?.();
      }, 5000));
    }

    return () => timers.forEach(clearTimeout);
  }, [normalizedYear, onComplete, persist]);

  return (
    <div className="my-8 mx-auto max-w-xs relative">
      <div className="w-full aspect-square relative">
        {/* Background cosmic glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: phase === 'revealed' || phase === 'complete' ? 0.5 : 0.2,
            scale: phase === 'revealed' || phase === 'complete' ? 1.1 : 1,
          }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(155, 89, 182, 0.15) 50%, transparent 70%)',
          }}
        />

        {/* SVG Canvas */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="cycleGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#f5d78e" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <filter id="yearGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring (dashed) */}
          <motion.circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="url(#cycleGold)"
            strokeWidth="0.3"
            strokeDasharray="2 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.5 }}
          />

          {/* Journey trail */}
          {phase !== 'appearing' && journeyProgress > 0 && (
            <motion.circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#cycleGold)"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#softGlow)"
              strokeDasharray={`${journeyProgress * 220} 220`}
              strokeDashoffset="55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
            />
          )}

          {/* Cycle position circles */}
          {cyclePositions.map((pos, i) => (
            <motion.g key={pos.number}>
              {/* Outer glow for active year */}
              {pos.isActive && (phase === 'revealed' || phase === 'complete') && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="10"
                  fill="rgba(212, 175, 55, 0.2)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Circle background */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="6"
                fill={pos.isActive ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.05)'}
                stroke={pos.isActive ? '#d4af37' : pos.isPast ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth={pos.isActive ? '1.5' : '0.5'}
                filter={pos.isActive && (phase === 'revealed' || phase === 'complete') ? 'url(#yearGlow)' : undefined}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: pos.isActive && (phase === 'revealed' || phase === 'complete') ? 1.2 : 1,
                  opacity: 1,
                }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.4,
                  scale: { duration: 0.3 },
                }}
              />

              {/* Number text */}
              <motion.text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={pos.isActive ? '#d4af37' : pos.isPast ? 'rgba(212, 175, 55, 0.7)' : 'rgba(255, 255, 255, 0.4)'}
                fontSize={pos.isActive ? '5' : '4'}
                fontWeight={pos.isActive ? 'bold' : 'normal'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
              >
                {pos.number}
              </motion.text>
            </motion.g>
          ))}

          {/* Center area */}
          <motion.circle
            cx="50"
            cy="50"
            r="18"
            fill="rgba(10, 10, 26, 0.8)"
            stroke="url(#cycleGold)"
            strokeWidth="0.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </svg>

        {/* Center content - Year number and theme */}
        <AnimatePresence>
          {(phase === 'revealed' || phase === 'complete') && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
            >
              <span className="text-[10px] text-[#d4af37]/70 uppercase tracking-wider mb-1">
                Personal Year
              </span>
              <span
                className="text-4xl font-bold text-[#d4af37]"
                style={{
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
                  fontFamily: 'var(--font-cinzel), serif',
                }}
              >
                {year}
              </span>
              <span className="text-[8px] text-white/60 mt-1 uppercase tracking-wider">
                {yearThemes[normalizedYear]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label below */}
        <AnimatePresence>
          {(phase === 'revealed' || phase === 'complete') && (
            <motion.div
              className="absolute -bottom-6 left-0 right-0 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span
                className="text-xs text-white/50 tracking-wider"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                Year {normalizedYear} of 9 in your cycle
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rotating stars/sparkles around the edge */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180 - Math.PI / 2;
              const x = 50 + 46 * Math.cos(rad);
              const y = 50 + 46 * Math.sin(rad);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill="rgba(212, 175, 55, 0.4)"
                />
              );
            })}
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
