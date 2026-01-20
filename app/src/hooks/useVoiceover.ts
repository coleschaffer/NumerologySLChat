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
  speak: (text: string) => Promise<number>; // Returns duration in ms
  stop: () => void;
  toggleMute: () => void;
  preload: (text: string) => void;
}

// Cache for preloaded audio
const audioCache = new Map<string, ArrayBuffer>();

// Estimate speaking duration based on text length
// Average speaking rate is ~150 words per minute, or ~12.5 chars per second
function estimateDuration(text: string): number {
  const charsPerSecond = 12;
  const baseDuration = (text.length / charsPerSecond) * 1000;
  // Add padding for natural pauses
  return baseDuration + 500;
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

  // Speak text - generates audio, starts playback, and returns duration immediately
  // This allows the caller to start typing animation in sync with audio
  const speak = useCallback(
    async (text: string): Promise<number> => {
      console.log('[Voiceover] speak() called for:', text.substring(0, 30) + '...');

      if (!audioRef.current) {
        console.warn('[Voiceover] No audio element available');
        return estimateDuration(text);
      }

      // If muted, just return estimated duration
      if (state.isMuted) {
        console.log('[Voiceover] Muted, skipping audio playback');
        return estimateDuration(text);
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const audioUrl = await generateSpeech(text);
        console.log('[Voiceover] Audio URL generated:', audioUrl);

        // Return a promise that resolves with duration once audio is ready to play
        // (not when it ends - we want to start typing in sync)
        // Add timeout to prevent hanging if audio fails to load
        return new Promise((resolve) => {
          if (!audioRef.current) {
            resolve(estimateDuration(text));
            return;
          }

          const audio = audioRef.current;
          let resolved = false;

          // Timeout: if audio doesn't load in 10 seconds, fallback to estimated duration
          const timeoutId = setTimeout(() => {
            if (!resolved) {
              console.warn('[Voiceover] Audio load timed out, using estimated duration');
              resolved = true;
              cleanup();
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: null, // Don't show error for timeout, just continue silently
              }));
              resolve(estimateDuration(text));
            }
          }, 10000);

          const handleEnded = () => {
            cleanup();
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              currentText: null,
            }));
          };

          const handleError = (e: Event) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeoutId);
            cleanup();
            console.error('Audio error:', e);
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              isLoading: false,
              error: 'Playback failed',
            }));
            resolve(estimateDuration(text));
          };

          const handleCanPlay = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeoutId);
            console.log('[Voiceover] Audio can play, duration:', audio.duration);
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isPlaying: true,
              currentText: text,
            }));

            // Get actual duration before starting playback
            const actualDuration = audio.duration * 1000;

            audio.play()
              .then(() => {
                console.log('[Voiceover] Playback started successfully');
                // Resolve immediately with duration so typing can start in sync
                resolve(actualDuration);
              })
              .catch((e) => {
                console.error('[Voiceover] Playback failed:', e);
                handleError(e);
              });
          };

          const cleanup = () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            // Don't revoke URL immediately - audio still needs it
            setTimeout(() => URL.revokeObjectURL(audioUrl), 60000);
          };

          audio.addEventListener('ended', handleEnded);
          audio.addEventListener('error', handleError);
          audio.addEventListener('canplaythrough', handleCanPlay);

          audio.src = audioUrl;
          audio.load();
        });
      } catch (error) {
        console.error('Speech generation error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to generate speech',
        }));
        // Return estimated duration so typing can continue
        return estimateDuration(text);
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
