'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredGeometryRevealProps {
  number: number;
  onComplete?: () => void;
  label?: string;
}

/**
 * SacredGeometryReveal - Golden ratio spirals reveal number
 *
 * Creates a mystical effect with sacred geometry patterns
 * (golden spirals, flower of life elements) that converge
 * to reveal the number.
 */
export default function SacredGeometryReveal({
  number,
  onComplete,
  label = 'Your Number',
}: SacredGeometryRevealProps) {
  const [phase, setPhase] = useState<'building' | 'spiraling' | 'revealed' | 'complete'>('building');
  const [spiralProgress, setSpiralProgress] = useState(0);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Start spiral animation
    timers.push(setTimeout(() => {
      setPhase('spiraling');
      const spiralInterval = setInterval(() => {
        setSpiralProgress((prev) => {
          if (prev >= 1) {
            clearInterval(spiralInterval);
            return 1;
          }
          return prev + 0.02;
        });
      }, 30);
    }, 500));

    // Phase 2: Revealed
    timers.push(setTimeout(() => setPhase('revealed'), 2500));

    // Phase 3: Complete
    timers.push(setTimeout(() => {
      setPhase('complete');
      onComplete?.();
    }, 4000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Golden ratio
  const phi = 1.618033988749;

  // Generate spiral points
  const spiralPoints = [];
  const numPoints = 100;
  for (let i = 0; i < numPoints * spiralProgress; i++) {
    const angle = i * 0.2;
    const radius = Math.pow(phi, angle / (2 * Math.PI)) * 2;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      spiralPoints.push({ x, y, opacity: 1 - i / (numPoints * spiralProgress) });
    }
  }

  // Generate concentric circles (flower of life inspired)
  const circles = [
    { r: 8, delay: 0 },
    { r: 16, delay: 0.1 },
    { r: 24, delay: 0.2 },
    { r: 32, delay: 0.3 },
    { r: 40, delay: 0.4 },
  ];

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'revealed' || phase === 'complete' ? 0.4 : 0.2,
        }}
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(155, 89, 182, 0.2) 50%, transparent 70%)',
        }}
      />

      {/* SVG Canvas */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sacredGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f5d78e" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric circles */}
        {circles.map((circle, i) => (
          <motion.circle
            key={`circle-${i}`}
            cx="50"
            cy="50"
            r={circle.r}
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="0.3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: phase === 'revealed' || phase === 'complete' ? 0.3 : 0.5,
              scale: 1,
            }}
            transition={{ delay: circle.delay, duration: 0.8 }}
          />
        ))}

        {/* Golden spiral */}
        {phase !== 'building' && (
          <motion.path
            d={`M ${spiralPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="0.5"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: spiralProgress }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* Spiral particles */}
        {spiralPoints.slice(-20).map((point, i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="#d4af37"
            initial={{ opacity: 0 }}
            animate={{ opacity: point.opacity * 0.8 }}
          />
        ))}

        {/* Hexagonal overlay (sacred geometry) */}
        <motion.polygon
          points="50,15 75,32.5 75,67.5 50,85 25,67.5 25,32.5"
          fill="none"
          stroke="url(#sacredGold)"
          strokeWidth="0.3"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{
            opacity: phase === 'revealed' || phase === 'complete' ? 0.5 : 0.2,
            rotate: phase === 'spiraling' ? 30 : 0,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 50%' }}
        />

        {/* Inner triangle */}
        <motion.polygon
          points="50,25 70,60 30,60"
          fill="none"
          stroke="url(#sacredGold)"
          strokeWidth="0.3"
          initial={{ opacity: 0 }}
          animate={{
            opacity: phase === 'revealed' || phase === 'complete' ? 0.6 : 0.3,
          }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </svg>

      {/* Number reveal */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'complete') && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
          >
            <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider mb-1">
              {label}
            </span>
            <span
              className="text-5xl font-bold text-[#d4af37]"
              style={{
                textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
                fontFamily: 'var(--font-cinzel), serif',
              }}
            >
              {number}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rotating outer ring */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="0.2"
            strokeDasharray="2 8"
          />
        </svg>
      </motion.div>
    </div>
  );
}
