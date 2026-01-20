'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConstellationRevealProps {
  number: number;
  onComplete?: () => void;
  label?: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  isKeyPoint: boolean;
}

/**
 * Generate constellation points that form a number
 * Uses predetermined point patterns for digits 0-9 and master numbers
 */
function getNumberPoints(num: number): { x: number; y: number }[] {
  // Normalize to canvas coordinates (0-100)
  const patterns: Record<number, { x: number; y: number }[]> = {
    1: [
      { x: 50, y: 15 },
      { x: 50, y: 35 },
      { x: 50, y: 55 },
      { x: 50, y: 75 },
      { x: 50, y: 95 },
      { x: 35, y: 30 },
    ],
    2: [
      { x: 30, y: 25 },
      { x: 50, y: 15 },
      { x: 70, y: 25 },
      { x: 70, y: 45 },
      { x: 50, y: 60 },
      { x: 30, y: 75 },
      { x: 30, y: 95 },
      { x: 70, y: 95 },
    ],
    3: [
      { x: 30, y: 20 },
      { x: 50, y: 15 },
      { x: 70, y: 25 },
      { x: 55, y: 50 },
      { x: 70, y: 75 },
      { x: 50, y: 90 },
      { x: 30, y: 80 },
    ],
    4: [
      { x: 30, y: 15 },
      { x: 30, y: 55 },
      { x: 70, y: 55 },
      { x: 70, y: 15 },
      { x: 70, y: 75 },
      { x: 70, y: 95 },
    ],
    5: [
      { x: 70, y: 15 },
      { x: 30, y: 15 },
      { x: 30, y: 45 },
      { x: 60, y: 45 },
      { x: 70, y: 60 },
      { x: 70, y: 80 },
      { x: 50, y: 95 },
      { x: 30, y: 85 },
    ],
    6: [
      { x: 60, y: 15 },
      { x: 40, y: 25 },
      { x: 30, y: 50 },
      { x: 35, y: 75 },
      { x: 50, y: 90 },
      { x: 65, y: 80 },
      { x: 65, y: 60 },
      { x: 50, y: 50 },
      { x: 35, y: 55 },
    ],
    7: [
      { x: 30, y: 15 },
      { x: 70, y: 15 },
      { x: 60, y: 40 },
      { x: 50, y: 60 },
      { x: 45, y: 80 },
      { x: 40, y: 95 },
    ],
    8: [
      { x: 50, y: 15 },
      { x: 35, y: 25 },
      { x: 35, y: 40 },
      { x: 50, y: 50 },
      { x: 65, y: 40 },
      { x: 65, y: 25 },
      { x: 35, y: 60 },
      { x: 35, y: 80 },
      { x: 50, y: 90 },
      { x: 65, y: 80 },
      { x: 65, y: 60 },
    ],
    9: [
      { x: 65, y: 30 },
      { x: 50, y: 15 },
      { x: 35, y: 25 },
      { x: 35, y: 45 },
      { x: 50, y: 55 },
      { x: 65, y: 50 },
      { x: 65, y: 70 },
      { x: 55, y: 90 },
      { x: 40, y: 95 },
    ],
    11: [
      // First 1
      { x: 25, y: 15 },
      { x: 25, y: 50 },
      { x: 25, y: 85 },
      { x: 15, y: 30 },
      // Second 1
      { x: 75, y: 15 },
      { x: 75, y: 50 },
      { x: 75, y: 85 },
      { x: 65, y: 30 },
    ],
    22: [
      // First 2
      { x: 15, y: 25 },
      { x: 25, y: 15 },
      { x: 35, y: 25 },
      { x: 25, y: 55 },
      { x: 15, y: 85 },
      { x: 35, y: 85 },
      // Second 2
      { x: 65, y: 25 },
      { x: 75, y: 15 },
      { x: 85, y: 25 },
      { x: 75, y: 55 },
      { x: 65, y: 85 },
      { x: 85, y: 85 },
    ],
    33: [
      // First 3
      { x: 15, y: 20 },
      { x: 25, y: 15 },
      { x: 35, y: 25 },
      { x: 25, y: 50 },
      { x: 35, y: 75 },
      { x: 25, y: 85 },
      { x: 15, y: 75 },
      // Second 3
      { x: 65, y: 20 },
      { x: 75, y: 15 },
      { x: 85, y: 25 },
      { x: 75, y: 50 },
      { x: 85, y: 75 },
      { x: 75, y: 85 },
      { x: 65, y: 75 },
    ],
  };

  return patterns[num] || patterns[num % 10] || patterns[1];
}

/**
 * ConstellationReveal - Stars connect to form the number
 *
 * Creates a mystical effect where scattered stars gradually
 * align and connect with light beams to reveal a number.
 */
export default function ConstellationReveal({
  number,
  onComplete,
  label = 'Your Number',
}: ConstellationRevealProps) {
  const [phase, setPhase] = useState<'stars' | 'connecting' | 'revealed' | 'complete'>('stars');
  const [visibleConnections, setVisibleConnections] = useState(0);

  // Generate star positions
  const keyPoints = useMemo(() => getNumberPoints(number), [number]);

  const stars = useMemo(() => {
    const result: Star[] = [];

    // Key points that form the number
    keyPoints.forEach((point, i) => {
      result.push({
        id: i,
        x: point.x,
        y: point.y,
        size: 3,
        delay: i * 0.1,
        isKeyPoint: true,
      });
    });

    // Background stars
    for (let i = 0; i < 30; i++) {
      result.push({
        id: keyPoints.length + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 0.5,
        isKeyPoint: false,
      });
    }

    return result;
  }, [keyPoints]);

  // Connection lines between key points
  const connections = useMemo(() => {
    const lines: { from: number; to: number }[] = [];
    for (let i = 0; i < keyPoints.length - 1; i++) {
      lines.push({ from: i, to: i + 1 });
    }
    return lines;
  }, [keyPoints]);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Stars appear (already showing)
    timers.push(setTimeout(() => setPhase('connecting'), 1500));

    // Phase 2: Connections draw
    timers.push(setTimeout(() => {
      const connectionInterval = setInterval(() => {
        setVisibleConnections((prev) => {
          if (prev >= connections.length) {
            clearInterval(connectionInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
      timers.push(connectionInterval as unknown as NodeJS.Timeout);
    }, 1600));

    // Phase 3: Revealed
    timers.push(setTimeout(() => setPhase('revealed'), 2500 + connections.length * 150));

    // Phase 4: Complete
    timers.push(setTimeout(() => {
      setPhase('complete');
      onComplete?.();
    }, 4000 + connections.length * 150));

    return () => timers.forEach(clearTimeout);
  }, [connections.length, onComplete]);

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'revealed' || phase === 'complete' ? 0.3 : 0.1,
          scale: phase === 'revealed' || phase === 'complete' ? 1.1 : 1,
        }}
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* SVG Canvas */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Connection lines */}
        <AnimatePresence>
          {phase !== 'stars' &&
            connections.slice(0, visibleConnections).map((conn, i) => {
              const from = keyPoints[conn.from];
              const to = keyPoints[conn.to];
              return (
                <motion.line
                  key={`conn-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#goldGradient)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
        </AnimatePresence>

        {/* Stars */}
        {stars.map((star) => (
          <motion.circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={star.isKeyPoint ? '#d4af37' : 'white'}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: star.isKeyPoint
                ? phase === 'revealed' || phase === 'complete'
                  ? 1
                  : 0.8
                : 0.4,
              scale: phase === 'revealed' && star.isKeyPoint ? 1.5 : 1,
            }}
            transition={{
              delay: star.delay,
              duration: 0.5,
            }}
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#f5d78e" />
          </linearGradient>
        </defs>
      </svg>

      {/* Label only - no number overlay (constellation forms the number) */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'complete') && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider">
              {label} {number}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
