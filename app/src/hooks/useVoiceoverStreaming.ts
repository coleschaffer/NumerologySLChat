'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getAudioChunkPlayer, AudioChunkPlayer } from '@/lib/AudioChunkPlayer';

/**
 * Alignment data from ElevenLabs WebSocket
 * Contains character-level timing information for text sync
 */
export interface AlignmentData {
  chars: string[];
  charStartTimesMs: number[];
  charDurationsMs: number[];
}

/**
 * Normalized alignment for easier use
 */
export interface NormalizedAlignment {
  characters: Array<{
    char: string;
    startMs: number;
    endMs: number;
  }>;
  totalDurationMs: number;
}

interface WebSocketAuthResponse {
  wsUrl: string;
  apiKey: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  voiceId: string;
  modelId: string;
}

interface UseVoiceoverStreamingReturn {
  /** Speak text with streaming audio and alignment data */
  speak: (text: string) => Promise<NormalizedAlignment | null>;
  /** Stop current playback */
  stop: () => void;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is muted */
  isMuted: boolean;
  /** Toggle mute state */
  toggleMute: () => void;
  /** Current playback time in seconds */
  currentTime: number;
  /** Whether the hook is ready (auth fetched) */
  isReady: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Progressive alignment data (updates as chunks arrive) */
  currentAlignment: NormalizedAlignment | null;
}

/**
 * useVoiceoverStreaming - WebSocket-based streaming voiceover with alignment
 *
 * Uses ElevenLabs WebSocket API for:
 * - Low-latency streaming audio
 * - Character-level alignment data for perfect text sync
 */
export function useVoiceoverStreaming(): UseVoiceoverStreamingReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Progressive alignment - updates as chunks arrive for real-time sync
  const [currentAlignment, setCurrentAlignment] = useState<NormalizedAlignment | null>(null);

  const authRef = useRef<WebSocketAuthResponse | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<AudioChunkPlayer | null>(null);
  const alignmentRef = useRef<AlignmentData | null>(null);

  // Initialize audio player
  useEffect(() => {
    playerRef.current = getAudioChunkPlayer();
    playerRef.current.onTimeUpdate(setCurrentTime);

    return () => {
      // Don't dispose the singleton, just clean up our listener
    };
  }, []);

  // Fetch WebSocket auth on mount
  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await fetch('/api/speech/ws-auth', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch WebSocket auth');
        }

        authRef.current = await response.json();
        setIsReady(true);
      } catch (err) {
        console.error('[useVoiceoverStreaming] Auth fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    fetchAuth();
  }, []);

  /**
   * Normalize alignment data for easier consumption
   */
  const normalizeAlignment = (alignment: AlignmentData): NormalizedAlignment => {
    const characters = alignment.chars.map((char, i) => ({
      char,
      startMs: alignment.charStartTimesMs[i],
      endMs: alignment.charStartTimesMs[i] + alignment.charDurationsMs[i],
    }));

    const lastChar = characters[characters.length - 1];
    const totalDurationMs = lastChar ? lastChar.endMs : 0;

    return { characters, totalDurationMs };
  };

  /**
   * Speak text using WebSocket streaming
   */
  const speak = useCallback(async (text: string): Promise<NormalizedAlignment | null> => {
    if (!authRef.current) {
      console.error('[useVoiceoverStreaming] Not ready - auth not fetched');
      return null;
    }

    const auth = authRef.current;
    const player = playerRef.current;

    if (!player) {
      console.error('[useVoiceoverStreaming] Audio player not initialized');
      return null;
    }

    // Initialize audio context (requires user interaction)
    await player.initialize();

    return new Promise((resolve, reject) => {
      // Reset state
      alignmentRef.current = null;
      setCurrentAlignment(null);
      setIsPlaying(true);
      setCurrentTime(0);

      // Create WebSocket connection
      const ws = new WebSocket(auth.wsUrl);
      wsRef.current = ws;

      let hasReceivedAudio = false;
      let accumulatedAlignment: AlignmentData = {
        chars: [],
        charStartTimesMs: [],
        charDurationsMs: [],
      };

      ws.onopen = () => {
        // Send initial configuration with API key
        ws.send(JSON.stringify({
          text: ' ', // Initial space to start the stream
          voice_settings: auth.voiceSettings,
          xi_api_key: auth.apiKey,
          try_trigger_generation: true,
          flush: false,
        }));

        // Send the actual text
        ws.send(JSON.stringify({
          text: text,
          try_trigger_generation: true,
          flush: false,
        }));

        // Signal end of input
        ws.send(JSON.stringify({
          text: '',
          flush: true,
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle audio chunk
          if (data.audio) {
            hasReceivedAudio = true;
            await player.queueChunk(data.audio);
          }

          // Handle alignment data
          if (data.alignment) {
            // Accumulate alignment data (may come in multiple messages)
            const align = data.alignment;
            if (align.chars && align.charStartTimesMs && align.charDurationsMs) {
              // Calculate offset for this chunk based on accumulated duration
              const offset = accumulatedAlignment.chars.length > 0
                ? accumulatedAlignment.charStartTimesMs[accumulatedAlignment.chars.length - 1] +
                  accumulatedAlignment.charDurationsMs[accumulatedAlignment.chars.length - 1]
                : 0;

              accumulatedAlignment.chars.push(...align.chars);
              accumulatedAlignment.charStartTimesMs.push(
                ...align.charStartTimesMs.map((t: number) => t + offset)
              );
              accumulatedAlignment.charDurationsMs.push(...align.charDurationsMs);

              // Update progressive alignment state for real-time sync
              setCurrentAlignment(normalizeAlignment(accumulatedAlignment));
            }
          }

          // Handle completion
          if (data.isFinal) {
            alignmentRef.current = accumulatedAlignment;
          }
        } catch (err) {
          console.error('[useVoiceoverStreaming] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[useVoiceoverStreaming] WebSocket error:', event);
        setError('WebSocket connection error');
        reject(new Error('WebSocket error'));
      };

      ws.onclose = async () => {
        wsRef.current = null;

        // Wait for audio to finish playing
        if (hasReceivedAudio) {
          await player.waitForCompletion();
        }

        setIsPlaying(false);

        // Return normalized alignment
        if (alignmentRef.current && alignmentRef.current.chars.length > 0) {
          resolve(normalizeAlignment(alignmentRef.current));
        } else {
          resolve(null);
        }
      };
    });
  }, []);

  /**
   * Stop current playback
   */
  const stop = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio
    if (playerRef.current) {
      playerRef.current.stop();
    }

    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      const newMuted = playerRef.current.toggleMute();
      setIsMuted(newMuted);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isMuted,
    toggleMute,
    currentTime,
    isReady,
    error,
    currentAlignment,
  };
}
