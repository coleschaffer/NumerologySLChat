/**
 * useVoiceover - Manages Oracle voice narration using ElevenLabs
 *
 * Generates speech from text and plays it, with support for:
 * - Queuing multiple messages
 * - Waiting for playback to complete
 * - Muting/unmuting
 * - Preloading upcoming messages
 */

import { useRef, useState, useCallback, useEffect } from 'react';

interface VoiceoverState {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  currentText: string | null;
  error: string | null;
}

interface UseVoiceoverReturn {
  state: VoiceoverState;
  speak: (text: string) => Promise<number>; // Resolves with duration when audio is ready
  stop: () => void;
  toggleMute: () => void;
  preload: (text: string) => void;
}

// Cache for preloaded audio
const audioCache = new Map<string, ArrayBuffer>();

/**
 * Estimate speaking duration based on text length
 * ElevenLabs multilingual_v2 speaks at roughly 10-12 chars/second
 * Using ~95ms per character to account for audio loading delay
 */
const MS_PER_CHAR = 95;
const MIN_DURATION = 1200;
const AUDIO_LOAD_BUFFER = 800; // Extra time for audio to load and start

function estimateDuration(text: string): number {
  const baseDuration = text.length * MS_PER_CHAR;
  // Add extra time for punctuation pauses
  const punctuationCount = (text.match(/[.!?,;:]/g) || []).length;
  const punctuationPause = punctuationCount * 200;
  // Add buffer for audio loading
  return Math.max(MIN_DURATION, baseDuration + punctuationPause + AUDIO_LOAD_BUFFER);
}

export function useVoiceover(): UseVoiceoverReturn {
  const [state, setState] = useState<VoiceoverState>({
    isPlaying: false,
    isMuted: false,
    isLoading: false,
    currentText: null,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => {
        setState((prev) => ({ ...prev, isPlaying: false, currentText: null }));
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          error: 'Audio playback failed',
        }));
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Generate speech and return audio blob URL
  const generateSpeech = useCallback(async (text: string): Promise<string> => {
    // Check cache first
    const cached = audioCache.get(text);
    if (cached) {
      console.log('[Voiceover] Using cached audio for:', text.substring(0, 30) + '...');
      const blob = new Blob([cached], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    }

    console.log('[Voiceover] Generating speech for:', text.substring(0, 30) + '...');

    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Voiceover] API error:', response.status, errorText);
      throw new Error(`Failed to generate speech: ${response.status}`);
    }

    const audioData = await response.arrayBuffer();
    console.log('[Voiceover] Received audio data:', audioData.byteLength, 'bytes');

    // Cache for future use
    audioCache.set(text, audioData);

    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }, []);

  /**
   * SYNCED SPEAK: Waits for audio to load, then starts playback and returns duration
   * This allows text animation to start exactly when audio starts
   */
  const speak = useCallback(
    async (text: string): Promise<number> => {
      const estimated = estimateDuration(text);
      console.log('[Voiceover] speak() called for:', text.substring(0, 30) + '...');

      // If muted, just return estimated duration (no audio fetch)
      if (state.isMuted) {
        console.log('[Voiceover] Muted, skipping audio fetch');
        return estimated;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const audioUrl = await generateSpeech(text);

        if (!audioRef.current) {
          return estimated;
        }

        const audio = audioRef.current;

        return new Promise((resolve) => {
          let resolved = false;

          // Timeout after 8 seconds - use estimated duration as fallback
          const timeoutId = setTimeout(() => {
            if (!resolved) {
              console.warn('[Voiceover] Audio load timeout, using estimated duration');
              resolved = true;
              setState((prev) => ({ ...prev, isLoading: false }));
              resolve(estimated);
            }
          }, 8000);

          const handleEnded = () => {
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              currentText: null,
            }));
            setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
          };

          const handleError = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeoutId);
            console.error('[Voiceover] Audio error');
            setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
            resolve(estimated);
          };

          const handleCanPlay = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeoutId);

            // Get actual duration from loaded audio
            const actualDuration = audio.duration * 1000;
            console.log('[Voiceover] Audio ready, duration:', actualDuration, 'ms');

            setState((prev) => ({
              ...prev,
              isLoading: false,
              isPlaying: true,
              currentText: text,
            }));

            // Start playback
            audio.play().catch((e) => {
              console.error('[Voiceover] Playback failed:', e);
            });

            // Return actual duration so text animation matches audio
            resolve(actualDuration);
          };

          audio.onended = handleEnded;
          audio.onerror = handleError;
          audio.oncanplaythrough = handleCanPlay;

          audio.src = audioUrl;
          audio.load();
        });
      } catch (error) {
        console.error('[Voiceover] Speech generation failed:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
        return estimated;
      }
    },
    [state.isMuted, generateSpeech]
  );

  // Stop current playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({ ...prev, isPlaying: false, currentText: null }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState((prev) => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  // Preload audio for upcoming messages
  const preload = useCallback(
    (text: string) => {
      // Don't preload if already cached
      if (audioCache.has(text)) return;

      // Generate in background
      generateSpeech(text).catch(console.error);
    },
    [generateSpeech]
  );

  return {
    state,
    speak,
    stop,
    toggleMute,
    preload,
  };
}

export default useVoiceover;
