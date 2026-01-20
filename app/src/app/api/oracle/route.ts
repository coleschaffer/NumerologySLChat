import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY_STEFAN || process.env.ANTHROPIC_API_KEY;

interface OracleRequest {
  context: {
    lifePath?: number;
    expression?: number;
    soulUrge?: number;
    personality?: number;
    birthdayNumber?: number;
    userName?: string;
    otherPersonName?: string;
    otherLifePath?: number;
    compatibilityScore?: number;
    compatibilityLevel?: string;
  };
  phase: string;
  baseMessages: string[];
  userInput?: string;
}

const ORACLE_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide. Your voice is wise, warm, and certain - never cold or distant. You speak in certainties, not maybes.

VOICE GUIDELINES:
- Use phrases like "I see...", "The numbers reveal...", "Between us..."
- Reference "the stars" or "the universe" occasionally
- Create intimacy and personal connection
- Be specific and personal, never generic
- Speak with authority but warmth
- End messages with intrigue or open loops when appropriate

AVOID:
- Generic horoscope language
- Overly flowery/purple prose
- Hedging or uncertain language ("might", "perhaps", "possibly")
- Sounding like AI or a chatbot
- Long paragraphs - keep messages punchy and dramatic

Your goal is to make each reading feel deeply personal and profound, building intrigue and emotional investment.`;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    // Fallback to returning base messages if no API key
    const body: OracleRequest = await request.json();
    return NextResponse.json({ messages: body.baseMessages });
  }

  try {
    const body: OracleRequest = await request.json();
    const { context, phase, baseMessages, userInput } = body;

    // Build the user prompt based on phase and context
    let userPrompt = buildPrompt(context, phase, baseMessages, userInput);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: ORACLE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', await response.text());
      return NextResponse.json({ messages: baseMessages });
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || '';

    // Parse the response into separate messages
    const messages = parseOracleResponse(aiResponse, baseMessages);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Oracle API error:', error);
    const body: OracleRequest = await request.json().catch(() => ({ baseMessages: [] }));
    return NextResponse.json({ messages: body.baseMessages || [] });
  }
}

function buildPrompt(
  context: OracleRequest['context'],
  phase: string,
  baseMessages: string[],
  userInput?: string
): string {
  let prompt = `Current phase: ${phase}\n\n`;

  if (context.userName) {
    prompt += `User's name: ${context.userName}\n`;
  }
  if (context.lifePath) {
    prompt += `User's Life Path Number: ${context.lifePath}\n`;
  }
  if (context.expression) {
    prompt += `User's Expression Number: ${context.expression}\n`;
  }
  if (context.soulUrge) {
    prompt += `User's Soul Urge Number: ${context.soulUrge}\n`;
  }
  if (context.otherPersonName) {
    prompt += `\nOther person: ${context.otherPersonName}\n`;
    if (context.otherLifePath) {
      prompt += `Their Life Path Number: ${context.otherLifePath}\n`;
    }
    if (context.compatibilityScore) {
      prompt += `Compatibility Score: ${context.compatibilityScore}%\n`;
      prompt += `Compatibility Level: ${context.compatibilityLevel}\n`;
    }
  }

  if (userInput) {
    prompt += `\nUser just said: "${userInput}"\n`;
    prompt += `\nThe user has typed something off-script. Acknowledge what they said warmly, then redirect back to the reading flow. Don't be overly interactive - this is a reading, not a conversation.`;
  }

  prompt += `\n\nBase messages to enhance (make these feel more personal and profound while keeping the core meaning):\n`;
  baseMessages.forEach((msg, i) => {
    prompt += `${i + 1}. "${msg}"\n`;
  });

  prompt += `\nReturn ${baseMessages.length} enhanced messages, each on its own line starting with a number and period (e.g., "1. Message here"). Keep messages relatively short (1-2 sentences each). Make them feel personal to this specific user based on their numbers.`;

  return prompt;
}

function parseOracleResponse(response: string, fallback: string[]): string[] {
  // Try to parse numbered messages
  const lines = response.split('\n').filter((line) => line.trim());
  const messages: string[] = [];

  for (const line of lines) {
    // Match lines starting with a number and period
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      messages.push(match[1].trim());
    }
  }

  // If we got the expected number of messages, return them
  if (messages.length >= fallback.length) {
    return messages.slice(0, fallback.length);
  }

  // If parsing failed, try to split by sentences
  if (messages.length === 0) {
    const sentences = response.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    if (sentences.length >= fallback.length) {
      return sentences.slice(0, fallback.length);
    }
  }

  // Fallback to original messages
  return fallback;
}
