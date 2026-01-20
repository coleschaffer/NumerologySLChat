'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConstellationRevealProps {
  number: number;
  onComplete?: () => void;
  label?: string;
  /** If true, component renders as a fixed overlay */
  isOverlay?: boolean;
  /** If true, stays visible indefinitely (doesn't auto-fade) */
  persist?: boolean;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  isKeyPoint: boolean;
}

interface NumberPattern {
  points: { x: number; y: number }[];
  /** Explicit connections - each is [fromIndex, toIndex] */
  connections: [number, number][];
}

/**
 * Generate constellation points and connections that form a number
 * Each number has explicit connection paths for proper shape rendering
 */
function getNumberPattern(num: number): NumberPattern {
  const patterns: Record<number, NumberPattern> = {
    1: {
      points: [
        { x: 50, y: 10 },   // 0: top
        { x: 50, y: 30 },   // 1: upper middle
        { x: 50, y: 50 },   // 2: middle
        { x: 50, y: 70 },   // 3: lower middle
        { x: 50, y: 90 },   // 4: bottom
        { x: 38, y: 22 },   // 5: serif
      ],
      connections: [[5, 0], [0, 1], [1, 2], [2, 3], [3, 4]],
    },
    2: {
      points: [
        { x: 30, y: 25 },   // 0: top left
        { x: 50, y: 12 },   // 1: top center
        { x: 70, y: 25 },   // 2: top right
        { x: 70, y: 42 },   // 3: upper right
        { x: 50, y: 55 },   // 4: middle
        { x: 30, y: 72 },   // 5: lower left
        { x: 30, y: 90 },   // 6: bottom left
        { x: 70, y: 90 },   // 7: bottom right
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    },
    3: {
      points: [
        { x: 28, y: 18 },   // 0: top left
        { x: 50, y: 10 },   // 1: top center
        { x: 72, y: 22 },   // 2: top right
        { x: 60, y: 45 },   // 3: upper middle
        { x: 72, y: 70 },   // 4: lower right
        { x: 50, y: 90 },   // 5: bottom center
        { x: 28, y: 78 },   // 6: bottom left
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    },
    4: {
      points: [
        { x: 30, y: 10 },   // 0: top left vertical start
        { x: 30, y: 55 },   // 1: left vertical end / horizontal start
        { x: 70, y: 55 },   // 2: horizontal end / intersect with right vertical
        { x: 70, y: 10 },   // 3: right vertical top
        { x: 70, y: 90 },   // 4: right vertical bottom
      ],
      connections: [[0, 1], [1, 2], [3, 2], [2, 4]],
    },
    5: {
      points: [
        { x: 70, y: 10 },   // 0: top right
        { x: 30, y: 10 },   // 1: top left
        { x: 30, y: 45 },   // 2: middle left
        { x: 55, y: 45 },   // 3: middle right
        { x: 70, y: 55 },   // 4: curve top
        { x: 72, y: 72 },   // 5: curve right
        { x: 55, y: 90 },   // 6: curve bottom
        { x: 30, y: 82 },   // 7: bottom left
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    },
    6: {
      points: [
        { x: 62, y: 12 },   // 0: top right (start of curve)
        { x: 42, y: 20 },   // 1: upper left
        { x: 28, y: 45 },   // 2: left side
        { x: 30, y: 72 },   // 3: lower left
        { x: 50, y: 88 },   // 4: bottom
        { x: 70, y: 75 },   // 5: lower right
        { x: 70, y: 55 },   // 6: right side of loop
        { x: 50, y: 45 },   // 7: inner top of loop
        { x: 32, y: 52 },   // 8: closes inner loop
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
    },
    7: {
      points: [
        { x: 28, y: 10 },   // 0: top left
        { x: 72, y: 10 },   // 1: top right
        { x: 58, y: 35 },   // 2: upper diagonal
        { x: 48, y: 55 },   // 3: middle diagonal
        { x: 42, y: 75 },   // 4: lower diagonal
        { x: 38, y: 90 },   // 5: bottom
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    },
    8: {
      points: [
        { x: 50, y: 10 },   // 0: top center
        { x: 32, y: 22 },   // 1: upper left
        { x: 32, y: 40 },   // 2: middle left upper
        { x: 50, y: 50 },   // 3: center
        { x: 68, y: 40 },   // 4: middle right upper
        { x: 68, y: 22 },   // 5: upper right
        { x: 32, y: 62 },   // 6: middle left lower
        { x: 32, y: 80 },   // 7: lower left
        { x: 50, y: 90 },   // 8: bottom center
        { x: 68, y: 80 },   // 9: lower right
        { x: 68, y: 62 },   // 10: middle right lower
      ],
      // Top loop and bottom loop
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 3]],
    },
    9: {
      points: [
        { x: 68, y: 30 },   // 0: right of upper loop
        { x: 50, y: 12 },   // 1: top center
        { x: 32, y: 25 },   // 2: left of upper loop
        { x: 32, y: 42 },   // 3: bottom left of upper loop
        { x: 50, y: 52 },   // 4: bottom of upper loop
        { x: 68, y: 45 },   // 5: closes upper loop, starts tail
        { x: 68, y: 68 },   // 6: tail middle
        { x: 55, y: 85 },   // 7: tail curve
        { x: 38, y: 90 },   // 8: tail end
      ],
      connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [5, 6], [6, 7], [7, 8]],
    },
    11: {
      points: [
        // First 1
        { x: 25, y: 10 },
        { x: 25, y: 50 },
        { x: 25, y: 90 },
        { x: 15, y: 25 },
        // Second 1
        { x: 75, y: 10 },
        { x: 75, y: 50 },
        { x: 75, y: 90 },
        { x: 65, y: 25 },
      ],
      connections: [[3, 0], [0, 1], [1, 2], [7, 4], [4, 5], [5, 6]],
    },
    22: {
      points: [
        // First 2
        { x: 12, y: 25 },
        { x: 25, y: 12 },
        { x: 38, y: 25 },
        { x: 38, y: 40 },
        { x: 25, y: 55 },
        { x: 12, y: 75 },
        { x: 12, y: 90 },
        { x: 38, y: 90 },
        // Second 2
        { x: 62, y: 25 },
        { x: 75, y: 12 },
        { x: 88, y: 25 },
        { x: 88, y: 40 },
        { x: 75, y: 55 },
        { x: 62, y: 75 },
        { x: 62, y: 90 },
        { x: 88, y: 90 },
      ],
      connections: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
        [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
      ],
    },
    33: {
      points: [
        // First 3
        { x: 12, y: 18 },
        { x: 25, y: 10 },
        { x: 38, y: 22 },
        { x: 28, y: 45 },
        { x: 38, y: 70 },
        { x: 25, y: 85 },
        { x: 12, y: 75 },
        // Second 3
        { x: 62, y: 18 },
        { x: 75, y: 10 },
        { x: 88, y: 22 },
        { x: 78, y: 45 },
        { x: 88, y: 70 },
        { x: 75, y: 85 },
        { x: 62, y: 75 },
      ],
      connections: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
      ],
    },
  };

  // Fallback for numbers not explicitly defined
  const pattern = patterns[num] || patterns[num % 10] || patterns[1];
  return pattern;
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
  isOverlay = false,
  persist = false,
}: ConstellationRevealProps) {
  const [phase, setPhase] = useState<'stars' | 'connecting' | 'revealed' | 'complete'>('stars');
  const [visibleConnections, setVisibleConnections] = useState(0);

  // Get pattern with points and explicit connections
  const pattern = useMemo(() => getNumberPattern(number), [number]);

  const stars = useMemo(() => {
    const result: Star[] = [];

    // Key points that form the number
    pattern.points.forEach((point, i) => {
      result.push({
        id: i,
        x: point.x,
        y: point.y,
        size: 3.5,
        delay: i * 0.08,
        isKeyPoint: true,
      });
    });

    // Background stars - more of them for a richer starfield
    for (let i = 0; i < 50; i++) {
      result.push({
        id: pattern.points.length + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 0.5,
        isKeyPoint: false,
      });
    }

    return result;
  }, [pattern]);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Stars appear (already showing)
    timers.push(setTimeout(() => setPhase('connecting'), 1500));

    // Phase 2: Connections draw
    timers.push(setTimeout(() => {
      const connectionInterval = setInterval(() => {
        setVisibleConnections((prev) => {
          if (prev >= pattern.connections.length) {
            clearInterval(connectionInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 180);
      timers.push(connectionInterval as unknown as NodeJS.Timeout);
    }, 1600));

    // Phase 3: Revealed
    timers.push(setTimeout(() => setPhase('revealed'), 2800 + pattern.connections.length * 180));

    // Phase 4: Complete (only if not persisting)
    if (!persist) {
      timers.push(setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, 4500 + pattern.connections.length * 180));
    } else {
      // Still call onComplete but don't change phase
      timers.push(setTimeout(() => {
        onComplete?.();
      }, 4500 + pattern.connections.length * 180));
    }

    return () => timers.forEach(clearTimeout);
  }, [pattern.connections.length, onComplete, persist]);

  const containerClasses = isOverlay
    ? "fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
    : "relative w-full max-w-xs mx-auto aspect-square";

  const innerClasses = isOverlay
    ? "w-[min(80vw,400px)] aspect-square relative"
    : "w-full h-full relative";

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: phase === 'revealed' || phase === 'complete' ? 0.4 : 0.15,
            scale: phase === 'revealed' || phase === 'complete' ? 1.15 : 1,
          }}
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 60%)',
          }}
        />

        {/* SVG Canvas */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Connection lines with glow effect */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#f5d78e" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          <AnimatePresence>
            {phase !== 'stars' &&
              pattern.connections.slice(0, visibleConnections).map((conn, i) => {
                const from = pattern.points[conn[0]];
                const to = pattern.points[conn[1]];
                return (
                  <motion.line
                    key={`conn-${i}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="url(#goldGradient)"
                    strokeWidth="1"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
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
              fill={star.isKeyPoint ? '#d4af37' : 'rgba(255,255,255,0.8)'}
              filter={star.isKeyPoint ? 'url(#glow)' : undefined}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: star.isKeyPoint
                  ? phase === 'revealed' || phase === 'complete'
                    ? 1
                    : 0.85
                  : 0.5,
                scale: phase === 'revealed' && star.isKeyPoint ? 1.3 : 1,
              }}
              transition={{
                delay: star.delay,
                duration: 0.5,
              }}
            />
          ))}
        </svg>

        {/* Label */}
        <AnimatePresence>
          {(phase === 'revealed' || phase === 'complete') && (
            <motion.div
              className="absolute -bottom-8 left-0 right-0 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="text-sm text-[#d4af37] uppercase tracking-[0.2em] font-medium"
                style={{
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                  fontFamily: 'var(--font-cinzel), serif',
                }}
              >
                {label} {number}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
