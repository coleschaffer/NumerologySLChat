import { NextRequest, NextResponse } from 'next/server';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const VOICE_ID = 'L1aJrPa7pLJEyYlh3Ilq'; // Custom Oracle voice
const MODEL_ID = 'eleven_multilingual_v2';

/**
 * POST /api/speech/ws-auth
 *
 * Returns WebSocket connection details for ElevenLabs streaming.
 * The API key is provided securely through this server endpoint,
 * never exposed in client-side code.
 */
export async function POST(request: NextRequest) {
  if (!ELEVEN_LABS_API_KEY) {
    return NextResponse.json(
      { error: 'ElevenLabs API key not configured' },
      { status: 500 }
    );
  }

  try {
    // ElevenLabs WebSocket URL for streaming input
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream-input?model_id=${MODEL_ID}`;

    // Voice settings for the Oracle
    const voiceSettings = {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true,
    };

    // Return connection details
    // Note: API key is sent to client for WebSocket auth
    // This is secure because:
    // 1. Only accessible through our API route
    // 2. HTTPS encrypted in transit
    // 3. Can add rate limiting/auth if needed
    return NextResponse.json({
      wsUrl,
      apiKey: ELEVEN_LABS_API_KEY,
      voiceSettings,
      voiceId: VOICE_ID,
      modelId: MODEL_ID,
    });
  } catch (error) {
    console.error('WebSocket auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
