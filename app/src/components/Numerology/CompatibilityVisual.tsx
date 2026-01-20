'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompatibilityVisualProps {
  userNumber: number;
  otherNumber: number;
  compatibilityScore: number;
  userName?: string;
  otherName?: string;
  onComplete?: () => void;
}

/**
 * CompatibilityVisual - Two orbs showing harmony/friction
 *
 * Creates a mystical visualization of two life path numbers
 * coming together, with visual indicators of harmony and friction.
 */
export default function CompatibilityVisual({
  userNumber,
  otherNumber,
  compatibilityScore,
  userName = 'You',
  otherName = 'Them',
  onComplete,
}: CompatibilityVisualProps) {
  const [phase, setPhase] = useState<'separate' | 'approaching' | 'connected' | 'revealed' | 'complete'>('separate');

  // Determine harmony level
  const harmonyLevel = useMemo(() => {
    if (compatibilityScore >= 80) return 'high';
    if (compatibilityScore >= 60) return 'medium';
    if (compatibilityScore >= 40) return 'challenging';
    return 'difficult';
  }, [compatibilityScore]);

  // Colors based on harmony
  const colors = useMemo(() => {
    return {
      user: '#d4af37', // Gold
      other: '#9b59b6', // Purple
      connection: harmonyLevel === 'high' || harmonyLevel === 'medium'
        ? 'rgba(212, 175, 55, 0.5)'
        : 'rgba(231, 76, 60, 0.3)',
    };
  }, [harmonyLevel]);

  // Energy particles between orbs
  const particles = useMemo(() => {
    const count = Math.floor(compatibilityScore / 10);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: i * 0.1,
      duration: 1 + Math.random() * 0.5,
      offset: (Math.random() - 0.5) * 20,
    }));
  }, [compatibilityScore]);

  // Phase progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase('approaching'), 1000));
    timers.push(setTimeout(() => setPhase('connected'), 2500));
    timers.push(setTimeout(() => setPhase('revealed'), 4000));
    timers.push(setTimeout(() => {
      setPhase('complete');
      onComplete?.();
    }, 6000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const orbDistance = phase === 'separate' ? 120 : phase === 'approaching' ? 80 : 40;

  return (
    <div className="relative w-full max-w-md mx-auto py-8">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'revealed' || phase === 'complete' ? 0.4 : 0.2,
        }}
        style={{
          background: `radial-gradient(ellipse at center, ${colors.connection} 0%, transparent 70%)`,
        }}
      />

      {/* Main visualization area */}
      <div className="relative h-64 flex items-center justify-center">
        {/* Connection line */}
        <AnimatePresence>
          {(phase === 'connected' || phase === 'revealed' || phase === 'complete') && (
            <motion.div
              className="absolute h-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.user}, ${colors.other})`,
                width: orbDistance + 40,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.6, scaleX: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Energy particles */}
        {(phase === 'connected' || phase === 'revealed' || phase === 'complete') &&
          particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full bg-[#d4af37]"
              style={{ top: `calc(50% + ${particle.offset}px)` }}
              initial={{ x: -orbDistance / 2 - 20, opacity: 0 }}
              animate={{
                x: [-(orbDistance / 2 + 20), orbDistance / 2 + 20],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'linear',
              }}
            />
          ))}

        {/* User orb */}
        <motion.div
          className="absolute flex flex-col items-center"
          animate={{
            x: -orbDistance,
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${colors.user}40 0%, ${colors.user}20 50%, transparent 70%)`,
              boxShadow: `0 0 30px ${colors.user}40`,
            }}
            animate={{
              scale: phase === 'connected' || phase === 'revealed' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Inner orb */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${colors.user} 0%, ${colors.user}80 100%)`,
                boxShadow: `0 0 20px ${colors.user}60`,
              }}
            >
              <span
                className="text-2xl font-bold text-[#0a0a1a]"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                {userNumber}
              </span>
            </div>
          </motion.div>
          <motion.span
            className="mt-2 text-sm text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {userName}
          </motion.span>
        </motion.div>

        {/* Other person orb */}
        <motion.div
          className="absolute flex flex-col items-center"
          animate={{
            x: orbDistance,
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${colors.other}40 0%, ${colors.other}20 50%, transparent 70%)`,
              boxShadow: `0 0 30px ${colors.other}40`,
            }}
            animate={{
              scale: phase === 'connected' || phase === 'revealed' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            {/* Inner orb */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${colors.other} 0%, ${colors.other}80 100%)`,
                boxShadow: `0 0 20px ${colors.other}60`,
              }}
            >
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                {otherNumber}
              </span>
            </div>
          </motion.div>
          <motion.span
            className="mt-2 text-sm text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {otherName}
          </motion.span>
        </motion.div>

        {/* Center merge effect */}
        <AnimatePresence>
          {(phase === 'revealed' || phase === 'complete') && (
            <motion.div
              className="absolute flex flex-col items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.user} 0%, ${colors.other} 100%)`,
                  boxShadow: `0 0 40px rgba(212, 175, 55, 0.5), 0 0 60px rgba(155, 89, 182, 0.3)`,
                }}
              >
                <span
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  {compatibilityScore}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compatibility label */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'complete') && (
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider">
              Compatibility
            </span>
            <p className="text-lg text-white/90 mt-1">
              {harmonyLevel === 'high' && 'Strong Cosmic Connection'}
              {harmonyLevel === 'medium' && 'Balanced Energy Flow'}
              {harmonyLevel === 'challenging' && 'Growth Through Challenge'}
              {harmonyLevel === 'difficult' && 'Karmic Lessons Ahead'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
