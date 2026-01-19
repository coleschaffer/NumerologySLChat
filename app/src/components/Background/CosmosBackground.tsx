'use client';

import { useEffect, useRef } from 'react';

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

export default function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const frameRef = useRef<number>(0);

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

    // Initialize stars and nebulae
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
    };

    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    let animationId: number;
    const animate = (time: number) => {
      frameRef.current = time;

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
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
        nebulaGradient.addColorStop(0, `rgba(${nebula.color}, ${nebula.opacity})`);
        nebulaGradient.addColorStop(0.5, `rgba(${nebula.color}, ${nebula.opacity * 0.5})`);
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stars with twinkling
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
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
          glow.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.3})`);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#050510' }}
    />
  );
}
