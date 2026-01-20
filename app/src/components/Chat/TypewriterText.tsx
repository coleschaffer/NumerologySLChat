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
  // Use ref for onComplete to prevent animation restart when callback changes
  const onCompleteRef = useRef(onComplete);
  // Track if animation has started to prevent restarts
  const hasStartedRef = useRef(false);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset when text changes
    if (skipAnimation) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Prevent animation restart if already started with same text
    if (hasStartedRef.current && displayedText.length > 0) {
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;
    hasStartedRef.current = true;

    // Calculate delay per character
    const charDelay = duration ? duration / text.length : msPerChar;

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;

        // When syncing with audio (duration provided), use consistent timing
        // When not syncing (no duration), add slight variance for natural feel
        let nextDelay: number;
        if (duration) {
          // Consistent timing to stay in sync with audio
          nextDelay = charDelay;
        } else {
          // Add slight variance for natural feel (±15%)
          const variance = charDelay * 0.15 * (Math.random() - 0.5);
          nextDelay = Math.max(10, charDelay + variance);

          // Longer pause after punctuation (only when not syncing with audio)
          const currentChar = text[indexRef.current - 1];
          const punctuationPause =
            currentChar === '.' || currentChar === '!' || currentChar === '?'
              ? 200
              : currentChar === ','
              ? 100
              : 0;
          nextDelay += punctuationPause;
        }

        timeoutRef.current = setTimeout(typeNextChar, nextDelay);
      } else {
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    };

    // Start typing immediately (no delay - sync with audio)
    typeNextChar();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // Only depend on text, duration, msPerChar, skipAnimation - NOT onComplete
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration, msPerChar, skipAnimation]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse text-[#d4af37]">|</span>
      )}
    </span>
  );
}
