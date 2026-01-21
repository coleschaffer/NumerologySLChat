'use client';

import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

interface FloatingNumber {
  x: number;
  y: number;
  value: number;
  targetValue: number;
  opacity: number;
  size: number;
  speed: number;
  direction: number;
  transitionProgress: number;
}

interface CosmosBackgroundProps {
  personalizedNumber?: number | null;
}

/**
 * CosmosBackground - Animated starfield with floating numbers
 *
 * When personalizedNumber is set, all floating numbers gradually
 * transform into that number, creating a "this is YOUR universe" effect.
 * (From VSL analysis - Numerologist.com does this to great effect)
 */
export default function CosmosBackground({
  personalizedNumber,
}: CosmosBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const numbersRef = useRef<FloatingNumber[]>([]);
  const frameRef = useRef<number>(0);
  const personalizedRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update personalized number reference
  useEffect(() => {
    if (personalizedNumber && personalizedNumber !== personalizedRef.current) {
      personalizedRef.current = personalizedNumber;
      // Trigger transition for all floating numbers
      numbersRef.current.forEach((num) => {
        num.targetValue = personalizedNumber;
        num.transitionProgress = 0;
      });
    }
  }, [personalizedNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeElements();
    };

    // Initialize stars, nebulae, and floating numbers
    const initializeElements = () => {
      const numStars = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = Array.from({ length: numStars }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));

      // Create nebulae
      nebulaeRef.current = [
        {
          x: canvas.width * 0.2,
          y: canvas.height * 0.3,
          radius: Math.min(canvas.width, canvas.height) * 0.4,
          color: '139, 69, 182', // Purple
          opacity: 0.08,
        },
        {
          x: canvas.width * 0.8,
          y: canvas.height * 0.7,
          radius: Math.min(canvas.width, canvas.height) * 0.35,
          color: '59, 130, 246', // Blue
          opacity: 0.06,
        },
        {
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          radius: Math.min(canvas.width, canvas.height) * 0.5,
          color: '212, 175, 55', // Gold
          opacity: 0.03,
        },
      ];

      // Create floating numbers
      const numFloating = Math.floor((canvas.width * canvas.height) / 50000);
      numbersRef.current = Array.from(
        { length: Math.max(8, numFloating) },
        () => {
          const initialValue = Math.floor(Math.random() * 9) + 1;
          return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            value: initialValue,
            targetValue: personalizedRef.current || initialValue,
            opacity: Math.random() * 0.15 + 0.05,
            size: Math.random() * 30 + 20,
            speed: Math.random() * 0.3 + 0.1,
            direction: Math.random() * Math.PI * 2,
            transitionProgress: personalizedRef.current ? 0 : 1,
          };
        }
      );
    };

    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    let animationId: number;
    const animate = (time: number) => {
      frameRef.current = time;

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, '#050510');
      gradient.addColorStop(0.5, '#0a0a1a');
      gradient.addColorStop(1, '#050515');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulaeRef.current.forEach((nebula) => {
        const nebulaGradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        nebulaGradient.addColorStop(
          0,
          `rgba(${nebula.color}, ${nebula.opacity})`
        );
        nebulaGradient.addColorStop(
          0.5,
          `rgba(${nebula.color}, ${nebula.opacity * 0.5})`
        );
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating numbers (behind stars)
      numbersRef.current.forEach((num) => {
        // Update position only if reduced motion is not preferred
        if (!prefersReducedMotion) {
          num.x += Math.cos(num.direction) * num.speed;
          num.y += Math.sin(num.direction) * num.speed;

          // Wrap around screen
          if (num.x < -50) num.x = canvas.width + 50;
          if (num.x > canvas.width + 50) num.x = -50;
          if (num.y < -50) num.y = canvas.height + 50;
          if (num.y > canvas.height + 50) num.y = -50;
        }

        // Handle number transition (allow this even with reduced motion as it's a state change)
        if (num.transitionProgress < 1) {
          num.transitionProgress += prefersReducedMotion ? 0.05 : 0.005; // Faster transition if reduced motion
          if (num.transitionProgress >= 1) {
            num.value = num.targetValue;
          }
        }

        // Determine displayed value
        const displayValue =
          num.transitionProgress >= 0.5 ? num.targetValue : num.value;

        // Draw the number with glow (no pulse animation if reduced motion)
        const pulseOpacity = prefersReducedMotion
          ? num.opacity
          : num.opacity + Math.sin(time * 0.001 + num.x) * 0.03;

        // Glow effect (gold tint when personalized)
        const isPersonalized = personalizedRef.current !== null;
        const glowColor = isPersonalized
          ? `rgba(212, 175, 55, ${pulseOpacity * 0.3})`
          : `rgba(255, 255, 255, ${pulseOpacity * 0.2})`;

        ctx.save();
        ctx.font = `${num.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow layer
        ctx.shadowColor = isPersonalized
          ? 'rgba(212, 175, 55, 0.5)'
          : 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 15;

        // Transition flash effect
        if (num.transitionProgress > 0.4 && num.transitionProgress < 0.6) {
          const flashIntensity =
            1 - Math.abs(num.transitionProgress - 0.5) * 10;
          ctx.fillStyle = `rgba(212, 175, 55, ${flashIntensity * 0.8})`;
          ctx.fillText(String(displayValue), num.x, num.y);
        }

        // Main number
        ctx.fillStyle = isPersonalized
          ? `rgba(212, 175, 55, ${pulseOpacity})`
          : `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.fillText(String(displayValue), num.x, num.y);

        ctx.restore();
      });

      // Draw stars with twinkling (or static if reduced motion)
      starsRef.current.forEach((star) => {
        // Disable twinkling animation when reduced motion is preferred
        const twinkle = prefersReducedMotion ? 0 : Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const currentOpacity = star.opacity + twinkle * 0.2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentOpacity)})`;
        ctx.fill();

        // Add glow to larger stars
        if (star.size > 1.5) {
          const glow = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 3
          );
          glow.addColorStop(
            0,
            `rgba(255, 255, 255, ${currentOpacity * 0.3})`
          );
          glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#050510' }}
    />
  );
}
