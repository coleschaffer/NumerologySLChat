import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY_STEFAN || process.env.ANTHROPIC_API_KEY;

/**
 * Oracle API Request Types
 */
type OracleMode = 'enhance' | 'validation' | 'suggestions';

interface OracleContext {
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
}

interface ValidationInfo {
  errorCode: string;
  originalInput: string;
  expectedInput: 'date' | 'name' | 'email' | 'freeform';
}

interface SuggestionInfo {
  /** The question Oracle just asked */
  oracleQuestion: string;
  /** Number of suggestions to generate */
  count: number;
}

interface OracleRequest {
  mode?: OracleMode;
  context: OracleContext;
  phase: string;
  baseMessages: string[];
  userInput?: string;
  validation?: ValidationInfo;
  suggestions?: SuggestionInfo;
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
- Technical error messages - everything should feel mystical

Your goal is to make each reading feel deeply personal and profound, building intrigue and emotional investment.`;

const VALIDATION_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide. Your task is to gently redirect users who have provided invalid or off-topic input.

VOICE GUIDELINES:
- Never sound like an error message or technical system
- Acknowledge the user's energy or spirit playfully
- Warmly guide them back to what you need
- Keep responses mystical but brief (1-2 sentences each)
- Create intrigue even when redirecting

EXAMPLES OF GOOD REDIRECTS:
- "Ah, your spirit dances with humor today... but to unlock your cosmic truth, I need the moment you first drew breath."
- "I sense playfulness in your energy. The universe smiles. Now, when did your journey on this Earth begin?"
- "Your words carry an unexpected vibration... Let us return to the path. Share with me your birth date."

AVOID:
- Technical language ("invalid format", "please enter", "error")
- Sounding frustrated or impatient
- Generic responses - personalize to their specific input when possible`;

const SUGGESTIONS_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide. Generate suggested responses for users based on their numerology profile and the current conversation context.

GUIDELINES:
- Create 3-4 brief, engaging response options
- Make suggestions feel natural and conversational
- Personalize based on the user's numerology numbers
- Include a mix of curious, emotional, and practical responses
- Keep each suggestion under 8 words
- Make suggestions feel like natural things a curious person would ask

EXAMPLES:
- "Tell me more about this..."
- "What does this mean for love?"
- "I've always felt different..."
- "Is this why I struggle with...?"`;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    // Fallback to returning base messages if no API key
    const body: OracleRequest = await request.json();
    return NextResponse.json({ messages: body.baseMessages, suggestions: [] });
  }

  try {
    const body: OracleRequest = await request.json();
    const { mode = 'enhance', context, phase, baseMessages, userInput, validation, suggestions } = body;

    let systemPrompt: string;
    let userPrompt: string;

    switch (mode) {
      case 'validation':
        systemPrompt = VALIDATION_SYSTEM_PROMPT;
        userPrompt = buildValidationPrompt(context, phase, validation!, baseMessages);
        break;
      case 'suggestions':
        systemPrompt = SUGGESTIONS_SYSTEM_PROMPT;
        userPrompt = buildSuggestionsPrompt(context, phase, suggestions!);
        break;
      case 'enhance':
      default:
        systemPrompt = ORACLE_SYSTEM_PROMPT;
        userPrompt = buildEnhancePrompt(context, phase, baseMessages, userInput);
        break;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: mode === 'suggestions' ? 256 : 1024,
        system: systemPrompt,
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
      return NextResponse.json({ messages: baseMessages, suggestions: [] });
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || '';

    if (mode === 'suggestions') {
      const parsedSuggestions = parseSuggestionsResponse(aiResponse);
      return NextResponse.json({ suggestions: parsedSuggestions });
    }

    // Parse the response into separate messages
    const messages = parseOracleResponse(aiResponse, baseMessages);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Oracle API error:', error);
    const body: OracleRequest = await request.json().catch(() => ({ baseMessages: [], context: {}, phase: '' }));
    return NextResponse.json({ messages: body.baseMessages || [], suggestions: [] });
  }
}

function buildEnhancePrompt(
  context: OracleContext,
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

function buildValidationPrompt(
  context: OracleContext,
  phase: string,
  validation: ValidationInfo,
  baseMessages: string[]
): string {
  let prompt = `Current phase: ${phase}\n`;
  prompt += `Expected input type: ${validation.expectedInput}\n`;
  prompt += `Error type: ${validation.errorCode}\n`;
  prompt += `User's input: "${validation.originalInput}"\n\n`;

  if (context.userName) {
    prompt += `User's name: ${context.userName}\n`;
  }
  if (context.lifePath) {
    prompt += `User's Life Path Number: ${context.lifePath}\n`;
  }

  prompt += `\nThe user has provided invalid or off-topic input. Generate a mystical, warm redirect that:
1. Playfully acknowledges their input or energy
2. Gently guides them back to providing a ${validation.expectedInput}

Base messages to enhance (make these feel more mystical and personalized):
`;
  baseMessages.forEach((msg, i) => {
    prompt += `${i + 1}. "${msg}"\n`;
  });

  prompt += `\nReturn ${baseMessages.length} mystical redirect messages, each on its own line starting with a number and period. Keep messages brief (1 sentence each) and ensure the last message clearly asks for the ${validation.expectedInput}.`;

  return prompt;
}

function buildSuggestionsPrompt(
  context: OracleContext,
  phase: string,
  suggestions: SuggestionInfo
): string {
  let prompt = `Current phase: ${phase}\n`;
  prompt += `Oracle just asked: "${suggestions.oracleQuestion}"\n\n`;

  if (context.userName) {
    prompt += `User's name: ${context.userName}\n`;
  }
  if (context.lifePath) {
    prompt += `User's Life Path Number: ${context.lifePath} (The ${getLifePathName(context.lifePath)})\n`;
  }
  if (context.expression) {
    prompt += `User's Expression Number: ${context.expression}\n`;
  }
  if (context.soulUrge) {
    prompt += `User's Soul Urge Number: ${context.soulUrge}\n`;
  }
  if (context.otherPersonName) {
    prompt += `\nThey're exploring their connection with: ${context.otherPersonName}\n`;
    if (context.compatibilityScore) {
      prompt += `Compatibility Score: ${context.compatibilityScore}%\n`;
    }
  }

  prompt += `\nGenerate ${suggestions.count} suggested responses that feel natural for someone with this numerology profile.

Each suggestion should:
- Be brief (under 8 words)
- Feel like a natural response to the Oracle's question
- Relate to the user's numerology when relevant
- Include a mix of emotional and curious responses

Return exactly ${suggestions.count} suggestions, one per line, starting with a number and period (e.g., "1. Tell me more about this").`;

  return prompt;
}

function getLifePathName(lifePath: number): string {
  const names: Record<number, string> = {
    1: 'Leader',
    2: 'Diplomat',
    3: 'Creative',
    4: 'Builder',
    5: 'Freedom Seeker',
    6: 'Nurturer',
    7: 'Seeker',
    8: 'Achiever',
    9: 'Humanitarian',
    11: 'Intuitive',
    22: 'Master Builder',
    33: 'Master Teacher',
  };
  return names[lifePath] || 'Path';
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

function parseSuggestionsResponse(response: string): string[] {
  const lines = response.split('\n').filter((line) => line.trim());
  const suggestions: string[] = [];

  for (const line of lines) {
    // Match lines starting with a number and period
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      const suggestion = match[1].trim();
      // Remove quotes if present
      const cleaned = suggestion.replace(/^["']|["']$/g, '');
      suggestions.push(cleaned);
    }
  }

  // Return what we found (up to 4 suggestions)
  return suggestions.slice(0, 4);
}
