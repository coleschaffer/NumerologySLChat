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
      const blob = new Blob([cached], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    }

    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioData = await response.arrayBuffer();

    // Cache for future use
    audioCache.set(text, audioData);

    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }, []);

  // Speak text and return promise that resolves with duration
  const speak = useCallback(
    async (text: string): Promise<number> => {
      if (!audioRef.current) {
        return estimateDuration(text);
      }

      // If muted, just return estimated duration
      if (state.isMuted) {
        return estimateDuration(text);
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const audioUrl = await generateSpeech(text);

        return new Promise((resolve, reject) => {
          if (!audioRef.current) {
            resolve(estimateDuration(text));
            return;
          }

          const audio = audioRef.current;

          const handleEnded = () => {
            cleanup();
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              currentText: null,
            }));
            resolve(audio.duration * 1000);
          };

          const handleError = (e: Event) => {
            cleanup();
            console.error('Audio error:', e);
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              isLoading: false,
              error: 'Playback failed',
            }));
            // Still resolve with estimated duration so typing continues
            resolve(estimateDuration(text));
          };

          const handleCanPlay = () => {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isPlaying: true,
              currentText: text,
            }));
            audio.play().catch(handleError);
          };

          const cleanup = () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            URL.revokeObjectURL(audioUrl);
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
