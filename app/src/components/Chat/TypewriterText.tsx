'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  /**
   * Duration in milliseconds for the entire text to be typed out.
   * If not provided, uses a default speed based on text length.
   */
  duration?: number;
  /**
   * Milliseconds per character (alternative to duration).
   * Default: 50ms per character for a slow, immersive feel.
   */
  msPerChar?: number;
  /**
   * Callback when typing animation completes
   */
  onComplete?: () => void;
  /**
   * If true, show full text immediately (skip animation)
   */
  skipAnimation?: boolean;
  /**
   * CSS class name for the text
   */
  className?: string;
}

/**
 * TypewriterText - Displays text with a letter-by-letter typing animation
 *
 * Creates an immersive, slower typing effect that makes the Oracle
 * feel like a real entity carefully choosing its words.
 */
export default function TypewriterText({
  text,
  duration,
  msPerChar = 50,
  onComplete,
  skipAnimation = false,
  className = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(skipAnimation ? text : '');
  const [isComplete, setIsComplete] = useState(skipAnimation);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    if (skipAnimation) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Calculate delay per character
    const charDelay = duration ? duration / text.length : msPerChar;

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;

        // Add slight variance for natural feel (±20%)
        const variance = charDelay * 0.2 * (Math.random() - 0.5);
        const nextDelay = Math.max(10, charDelay + variance);

        // Longer pause after punctuation
        const currentChar = text[indexRef.current - 1];
        const punctuationPause =
          currentChar === '.' || currentChar === '!' || currentChar === '?'
            ? 300
            : currentChar === ','
            ? 150
            : currentChar === '...'
            ? 400
            : 0;

        timeoutRef.current = setTimeout(typeNextChar, nextDelay + punctuationPause);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    // Start typing after a brief delay
    timeoutRef.current = setTimeout(typeNextChar, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, duration, msPerChar, skipAnimation, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse text-[#d4af37]">|</span>
      )}
    </span>
  );
}
