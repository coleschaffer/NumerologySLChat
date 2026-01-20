/**
 * useSoundEffects - Manages audio feedback for the Oracle experience
 *
 * Sound design increases perceived value and engagement.
 * Uses Web Audio API for low-latency playback.
 *
 * Based on VSL analysis: subtle audio cues dramatically
 * increase engagement and perceived mysticism.
 */

import { useRef, useCallback, useEffect } from 'react';

type SoundType = 'ambient' | 'chime' | 'reveal' | 'transition' | 'success';

// Generate sounds programmatically using Web Audio API
// This avoids needing external audio files

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize audio context on first user interaction
  const initialize = useCallback(() => {
    if (isInitializedRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      isInitializedRef.current = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }, []);

  // Play a chime/bell sound
  const playChime = useCallback(
    (frequency = 800, duration = 0.8) => {
      if (!audioContextRef.current) {
        initialize();
        if (!audioContextRef.current) return;
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + duration);

      // Create gain for envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Add a second harmonic for richness
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(frequency, now + duration);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Connect and play
      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration);
      osc2.stop(now + duration);
    },
    [initialize]
  );

  // Play reveal sound (ascending chimes)
  const playReveal = useCallback(() => {
    if (!audioContextRef.current) {
      initialize();
      if (!audioContextRef.current) return;
    }

    // Play ascending notes
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playChime(freq, 0.6), i * 150);
    });
  }, [initialize, playChime]);

  // Play transition whoosh
  const playTransition = useCallback(() => {
    if (!audioContextRef.current) {
      initialize();
      if (!audioContextRef.current) return;
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const duration = 0.4;

    // Create white noise
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for whoosh effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);
    filter.Q.value = 1;

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }, [initialize]);

  // Play success sound
  const playSuccess = useCallback(() => {
    if (!audioContextRef.current) {
      initialize();
      if (!audioContextRef.current) return;
    }

    // Major chord arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => playChime(freq, 1.0), i * 100);
    });
  }, [initialize, playChime]);

  // Start ambient drone
  const startAmbient = useCallback(() => {
    if (!audioContextRef.current) {
      initialize();
      if (!audioContextRef.current) return;
    }

    if (ambientOscRef.current) return; // Already playing

    const ctx = audioContextRef.current;

    // Create low drone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime); // Very low frequency

    // Create subtle LFO for movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(5, ctx.currentTime);

    // Connect LFO to oscillator frequency
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Main gain (very quiet)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);

    // Filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    lfo.start();

    ambientOscRef.current = osc;
    ambientGainRef.current = gain;
  }, [initialize]);

  // Stop ambient drone
  const stopAmbient = useCallback(() => {
    if (ambientOscRef.current && ambientGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      ambientGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        ambientOscRef.current?.stop();
        ambientOscRef.current = null;
      }, 1000);
    }
  }, []);

  // Master play function
  const play = useCallback(
    (sound: SoundType) => {
      switch (sound) {
        case 'ambient':
          startAmbient();
          break;
        case 'chime':
          playChime();
          break;
        case 'reveal':
          playReveal();
          break;
        case 'transition':
          playTransition();
          break;
        case 'success':
          playSuccess();
          break;
      }
    },
    [startAmbient, playChime, playReveal, playTransition, playSuccess]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAmbient]);

  return {
    play,
    initialize,
    stopAmbient,
  };
}

export default useSoundEffects;
