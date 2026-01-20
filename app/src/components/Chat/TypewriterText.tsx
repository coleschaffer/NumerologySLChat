'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { NormalizedAlignment } from '@/hooks/useVoiceoverStreaming';

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
  /**
   * Alignment data from ElevenLabs for synced text reveal.
   * When provided, text reveals in sync with audio playback.
   */
  alignment?: NormalizedAlignment | null;
  /**
   * Current audio playback time in seconds.
   * Used with alignment for synced text reveal.
   */
  audioCurrentTime?: number;
  /**
   * Whether audio is currently playing.
   * Used to determine if synced mode is active.
   */
  isAudioPlaying?: boolean;
}

/**
 * TypewriterText - Displays text with a letter-by-letter typing animation
 *
 * Supports two modes:
 * 1. Time-based: Uses duration/msPerChar to animate typing
 * 2. Audio-synced: Uses alignment data and currentTime to sync with audio
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
  alignment,
  audioCurrentTime = 0,
  isAudioPlaying = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(skipAnimation ? text : '');
  const [isComplete, setIsComplete] = useState(skipAnimation);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  // Use ref for onComplete to prevent animation restart when callback changes
  const onCompleteRef = useRef(onComplete);
  // Track if animation has started to prevent restarts
  const hasStartedRef = useRef(false);
  // Track if we've completed in synced mode
  const syncedCompleteRef = useRef(false);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // SYNCED MODE: Calculate visible characters based on audio time
  const syncedVisibleLength = useMemo(() => {
    if (!alignment || !isAudioPlaying) return null;

    const currentTimeMs = audioCurrentTime * 1000;
    let visibleChars = 0;

    for (let i = 0; i < alignment.characters.length; i++) {
      if (alignment.characters[i].startMs <= currentTimeMs) {
        visibleChars = i + 1;
      } else {
        break;
      }
    }

    return Math.min(visibleChars, text.length);
  }, [alignment, audioCurrentTime, isAudioPlaying, text.length]);

  // Handle synced mode completion
  useEffect(() => {
    if (
      alignment &&
      isAudioPlaying &&
      syncedVisibleLength === text.length &&
      !syncedCompleteRef.current
    ) {
      syncedCompleteRef.current = true;
      setIsComplete(true);
      onCompleteRef.current?.();
    }
  }, [alignment, isAudioPlaying, syncedVisibleLength, text.length]);

  // Reset synced complete ref when text changes
  useEffect(() => {
    syncedCompleteRef.current = false;
  }, [text]);

  // TIME-BASED MODE: Animate character by character
  useEffect(() => {
    // Skip time-based animation if using synced mode
    if (alignment && isAudioPlaying) {
      return;
    }

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
  }, [text, duration, msPerChar, skipAnimation, alignment, isAudioPlaying]);

  // Determine what text to display
  const textToShow = useMemo(() => {
    // Synced mode: use alignment-based calculation
    if (alignment && isAudioPlaying && syncedVisibleLength !== null) {
      return text.slice(0, syncedVisibleLength);
    }
    // Time-based mode: use state
    return displayedText;
  }, [alignment, isAudioPlaying, syncedVisibleLength, text, displayedText]);

  const showCursor = alignment && isAudioPlaying
    ? syncedVisibleLength !== null && syncedVisibleLength < text.length
    : !isComplete;

  return (
    <span className={className}>
      {textToShow}
      {showCursor && (
        <span className="animate-pulse text-[#d4af37]">|</span>
      )}
    </span>
  );
}
