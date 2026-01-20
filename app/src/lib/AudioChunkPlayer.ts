/**
 * AudioChunkPlayer - Web Audio API based player for streaming audio chunks
 *
 * Features:
 * - Gapless playback between chunks
 * - Precise timing for text sync
 * - Mute/unmute without stopping
 * - Clean resource management
 */

export class AudioChunkPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private scheduledTime: number = 0;
  private startTime: number = 0;
  private sources: AudioBufferSourceNode[] = [];
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private timeUpdateInterval: number | null = null;

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.isMuted ? 0 : 1;
  }

  /**
   * Queue an audio chunk for playback
   * @param base64Audio - Base64 encoded audio data (MP3)
   */
  async queueChunk(base64Audio: string): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      await this.initialize();
    }

    const ctx = this.audioContext!;
    const gain = this.gainNode!;

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode audio data
    const audioBuffer = await ctx.decodeAudioData(bytes.buffer);

    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gain);

    // Schedule for gapless playback
    const now = ctx.currentTime;

    if (!this.isPlaying) {
      // First chunk - start immediately
      this.startTime = now;
      this.scheduledTime = now;
      this.isPlaying = true;
      this.startTimeUpdates();
    }

    const startAt = Math.max(this.scheduledTime, now);
    source.start(startAt);

    // Track when this chunk ends
    this.scheduledTime = startAt + audioBuffer.duration;

    // Clean up when done
    source.onended = () => {
      const idx = this.sources.indexOf(source);
      if (idx > -1) this.sources.splice(idx, 1);
    };

    this.sources.push(source);
  }

  /**
   * Get current playback time in seconds (relative to start)
   */
  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) return 0;
    return this.audioContext.currentTime - this.startTime;
  }

  /**
   * Set callback for time updates (called ~60fps)
   */
  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  private startTimeUpdates(): void {
    if (this.timeUpdateInterval) return;

    const update = () => {
      if (this.isPlaying && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.getCurrentTime());
      }
      this.timeUpdateInterval = requestAnimationFrame(update);
    };

    this.timeUpdateInterval = requestAnimationFrame(update);
  }

  private stopTimeUpdates(): void {
    if (this.timeUpdateInterval) {
      cancelAnimationFrame(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  /**
   * Check if all scheduled audio has finished
   */
  isFinished(): boolean {
    if (!this.audioContext) return true;
    return this.audioContext.currentTime >= this.scheduledTime;
  }

  /**
   * Wait for all queued audio to finish playing
   */
  async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.isFinished()) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /**
   * Mute audio without stopping playback
   */
  mute(): void {
    this.isMuted = true;
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
  }

  /**
   * Unmute audio
   */
  unmute(): void {
    this.isMuted = false;
    if (this.gainNode) {
      this.gainNode.gain.value = 1;
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  /**
   * Get mute state
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Stop all playback and reset
   */
  stop(): void {
    this.stopTimeUpdates();

    // Stop all active sources
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });
    this.sources = [];

    this.isPlaying = false;
    this.scheduledTime = 0;
    this.startTime = 0;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
    this.onTimeUpdateCallback = null;
  }
}

// Singleton instance for app-wide use
let playerInstance: AudioChunkPlayer | null = null;

export function getAudioChunkPlayer(): AudioChunkPlayer {
  if (!playerInstance) {
    playerInstance = new AudioChunkPlayer();
  }
  return playerInstance;
}
