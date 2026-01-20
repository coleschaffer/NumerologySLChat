import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY_STEFAN || process.env.ANTHROPIC_API_KEY;

/**
 * Oracle API Request Types
 */
type OracleMode = 'enhance' | 'validation' | 'suggestions' | 'interpret';

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

interface InterpretInfo {
  /** Which number type to interpret */
  numberType: 'lifePath' | 'expression' | 'soulUrge' | 'compatibility';
  /** The number value */
  number: number;
  /** Base interpretation to personalize */
  baseInterpretation: {
    name: string;
    shortDescription: string;
    coreDescription: string;
  };
}

interface OracleRequest {
  mode?: OracleMode;
  context: OracleContext;
  phase: string;
  baseMessages: string[];
  userInput?: string;
  validation?: ValidationInfo;
  suggestions?: SuggestionInfo;
  interpret?: InterpretInfo;
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

const INTERPRETATION_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide delivering deeply personal numerology readings.

Your task is to take a base interpretation and make it PROFOUNDLY PERSONAL to this specific user.

VOICE GUIDELINES:
- Speak with certainty and authority - "I see...", "The numbers reveal...", "You are..."
- Make it feel like you're reading THEIR soul specifically, not generic traits
- Reference their specific number combination when relevant
- Build intrigue and emotional connection
- Use second person ("you") to speak directly to them

STRUCTURE YOUR RESPONSE:
1. A short, punchy title line (e.g., "Life Path 5. The Freedom Seeker.")
2. A brief poetic description (1 sentence, evocative)
3. A deeper personal revelation (2-3 sentences that feel like you're reading their soul)

Keep the total response under 100 words. Make every word count.

Do NOT:
- Use generic horoscope language
- Be vague or hedge with "might" or "perhaps"
- Repeat the base interpretation verbatim
- Include bullet points or lists`;

const SUGGESTIONS_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide. Generate suggested responses that DIRECTLY answer the Oracle's question.

CRITICAL RULE: Suggestions must be ANSWERS to the Oracle's question, not follow-up questions.

If Oracle asks "What aspect of your life feels most affected by this energy?" - suggestions should be answers like:
- "My relationships feel most affected"
- "My career and sense of purpose"
- "My inner peace and self-worth"

If Oracle asks "Have you ever felt drawn to certain skills or abilities?" - suggestions should be:
- "Yes, creativity and artistic expression"
- "Leadership and guiding others"
- "Intuition and reading people"

GUIDELINES:
- Generate exactly 3 direct responses to the Oracle's question
- Personalize based on the user's numerology numbers when relevant
- Keep each suggestion 3-7 words
- Make suggestions feel like authentic personal revelations
- Do NOT generate questions - generate ANSWERS

BAD examples (these are questions, not answers):
- "Tell me more about this"
- "What does this mean?"

GOOD examples (these are answers):
- "My relationships feel strained"
- "I've always been drawn to leadership"
- "Someone I deeply care about"`;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    // Fallback to returning base messages if no API key
    const body: OracleRequest = await request.json();
    return NextResponse.json({ messages: body.baseMessages, suggestions: [] });
  }

  try {
    const body: OracleRequest = await request.json();
    const { mode = 'enhance', context, phase, baseMessages, userInput, validation, suggestions, interpret } = body;

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
      case 'interpret':
        systemPrompt = INTERPRETATION_SYSTEM_PROMPT;
        userPrompt = buildInterpretPrompt(context, interpret!);
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
    console.log('[Oracle API] Mode:', mode, 'AI response length:', aiResponse.length);
    console.log('[Oracle API] AI response:', aiResponse.substring(0, 200));

    if (mode === 'suggestions') {
      const parsedSuggestions = parseSuggestionsResponse(aiResponse);
      console.log('[Oracle API] Parsed suggestions:', parsedSuggestions);
      // Return parsed suggestions, or empty array if none (let client handle fallback)
      return NextResponse.json({ suggestions: parsedSuggestions });
    }

    if (mode === 'interpret') {
      // Parse interpretation into structured format
      const lines = aiResponse.split('\n').filter((line: string) => line.trim());
      const interpretation = {
        title: lines[0] || '',
        shortDescription: lines[1] || '',
        coreDescription: lines.slice(2).join(' ') || '',
      };
      console.log('[Oracle API] Parsed interpretation:', interpretation);
      return NextResponse.json({ interpretation });
    }

    // Parse the response into separate messages
    const messages = parseOracleResponse(aiResponse, baseMessages);
    console.log('[Oracle API] Parsed messages:', messages.length, 'fallback had:', baseMessages.length);

    // If parsing returned empty or fewer messages than expected, use fallback
    if (messages.length === 0) {
      console.log('[Oracle API] Using fallback messages');
      return NextResponse.json({ messages: baseMessages });
    }

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
  let prompt = `Oracle's question to the user: "${suggestions.oracleQuestion}"\n\n`;

  prompt += `User context:\n`;
  if (context.userName) {
    prompt += `- Name: ${context.userName}\n`;
  }
  if (context.lifePath) {
    prompt += `- Life Path: ${context.lifePath} (${getLifePathName(context.lifePath)})\n`;
  }
  if (context.expression) {
    prompt += `- Expression: ${context.expression}\n`;
  }
  if (context.soulUrge) {
    prompt += `- Soul Urge: ${context.soulUrge}\n`;
  }
  if (context.otherPersonName) {
    prompt += `- Exploring connection with: ${context.otherPersonName}\n`;
    if (context.compatibilityScore) {
      prompt += `- Compatibility: ${context.compatibilityScore}%\n`;
    }
  }

  prompt += `\nGenerate ${suggestions.count} ANSWERS to the Oracle's question above.

IMPORTANT: These are RESPONSES the user might give, not follow-up questions.
- Each answer should be 3-7 words
- Personalize to their numerology profile (e.g., Life Path 5 might answer about freedom/change)
- Make answers feel authentic and revealing
- Mix of emotional, practical, and curious responses

Return exactly ${suggestions.count} answers, one per line, starting with a number and period.`;

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

function buildInterpretPrompt(
  context: OracleContext,
  interpret: InterpretInfo
): string {
  let prompt = `Generate a deeply personal ${interpret.numberType} interpretation for this user.\n\n`;

  prompt += `USER PROFILE:\n`;
  if (context.userName) {
    prompt += `- Name: ${context.userName}\n`;
  }
  if (context.lifePath) {
    prompt += `- Life Path: ${context.lifePath} (${getLifePathName(context.lifePath)})\n`;
  }
  if (context.expression) {
    prompt += `- Expression: ${context.expression}\n`;
  }
  if (context.soulUrge) {
    prompt += `- Soul Urge: ${context.soulUrge}\n`;
  }

  prompt += `\nNUMBER TO INTERPRET: ${interpret.numberType} ${interpret.number}\n`;
  prompt += `Archetype: "${interpret.baseInterpretation.name}"\n\n`;

  prompt += `BASE INTERPRETATION (use as inspiration, but personalize):\n`;
  prompt += `Short: "${interpret.baseInterpretation.shortDescription}"\n`;
  prompt += `Core: "${interpret.baseInterpretation.coreDescription}"\n\n`;

  prompt += `Now create a UNIQUE, PERSONAL interpretation that:\n`;
  prompt += `1. Feels like you're reading THIS person's soul\n`;
  prompt += `2. References their specific number combination if relevant\n`;
  prompt += `3. Uses "you" to speak directly to them\n`;
  prompt += `4. Is mysterious and evocative, not generic\n\n`;

  prompt += `Format:\n`;
  prompt += `Line 1: Title (e.g., "Life Path 5. The Freedom Seeker.")\n`;
  prompt += `Line 2: Short poetic description (1 sentence)\n`;
  prompt += `Line 3+: Deeper personal revelation (2-3 sentences)`;

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
