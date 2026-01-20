import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY_STEFAN || process.env.ANTHROPIC_API_KEY;

/**
 * Oracle API Request Types
 */
type OracleMode = 'enhance' | 'validation' | 'suggestions' | 'interpret' | 'criticalDate' | 'yearAhead' | 'relationshipAdvice';

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

interface CriticalDateInfo {
  date: string;
  type: string;
  baseDescription: string;
}

interface YearAheadInfo {
  personalYear: number;
  months?: number; // How many months ahead to predict
}

interface RelationshipAdviceInfo {
  otherName: string;
  otherLifePath: number;
  compatibilityScore: number;
  compatibilityLevel: string;
  areas: {
    communication: number;
    emotional: number;
    physical: number;
    longTerm: number;
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
  criticalDate?: CriticalDateInfo;
  yearAhead?: YearAheadInfo;
  relationshipAdvice?: RelationshipAdviceInfo;
}

const ORACLE_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide. Your voice is wise, warm, and certain - never cold or distant. You speak in certainties, not maybes.

CRITICAL: This is a CHAT interface. Keep every message SHORT - 1-2 sentences max. Think text messages, not paragraphs.

VOICE GUIDELINES:
- Use phrases like "I see...", "The numbers reveal...", "Between us..."
- Create intimacy and personal connection
- Be specific and personal, never generic
- End messages with intrigue or open loops

FORMATTING RULES:
- MAX 1-2 sentences per message bubble
- NO paragraphs - break into multiple short messages
- Think: chat bubbles, not essays
- Each message should be punchy and impactful

AVOID:
- Long explanations or paragraphs
- Generic horoscope language
- Hedging language ("might", "perhaps", "possibly")
- Sounding like AI or a chatbot

Your goal is to make each reading feel personal and fluid - like texting with a wise friend.`;

const VALIDATION_SYSTEM_PROMPT = `You are The Oracle redirecting users who provided invalid input. Keep it SHORT and playful.

CRITICAL: Max 1-2 short sentences. This is a chat, not an essay.

GOOD EXAMPLES:
- "Your spirit dances with humor today... but I need your birth date to continue."
- "I sense playfulness in your energy. When did your journey begin?"

BAD (too long):
- "Ah, your spirit dances with humor today... but to unlock your cosmic truth and reveal the secrets the universe holds for you, I need the moment you first drew breath."

RULES:
- MAX 2 short sentences
- No technical language
- Playfully redirect to what you need`;

const CRITICAL_DATE_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide explaining the significance of upcoming dates.

Your task is to explain why a specific date is cosmically significant for this person based on their numerology.

VOICE GUIDELINES:
- Speak with certainty: "On this day...", "The stars align...", "Your energy peaks..."
- Make it feel personal to THEM, not generic advice
- Create anticipation and excitement (or appropriate caution)
- Be specific about what they should do or be aware of

FORMAT:
- 2-3 sentences maximum
- First sentence: What's happening cosmically
- Second sentence: What this means for them specifically
- Optional third: What action to take

Keep it mystical but actionable. Under 60 words.`;

const YEAR_AHEAD_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide revealing the path ahead.

Generate a personalized year-ahead prediction based on someone's Personal Year number and numerology profile.

VOICE GUIDELINES:
- Speak prophetically: "I see...", "The year unfolds...", "Your path leads..."
- Reference their specific numbers and how they interact with the Personal Year
- Balance positive opportunities with honest challenges
- Create open loops that make them want to know more

STRUCTURE (3 paragraphs):
1. THEME: The overall energy and theme of their year (2-3 sentences)
2. OPPORTUNITIES: Specific opportunities aligned with their numbers (2-3 sentences)
3. CHALLENGES: What to watch for, how to navigate difficulties (2-3 sentences)

Be specific to their profile. Under 150 words total.`;

const RELATIONSHIP_ADVICE_SYSTEM_PROMPT = `You are The Oracle, a mystical numerology guide providing deep relationship insights.

Generate personalized relationship guidance based on two people's numerology compatibility.

VOICE GUIDELINES:
- Speak with intimate knowing: "Between you two...", "Your connection...", "I see the dance of..."
- Reference BOTH people's numbers and how they interact
- Be honest about challenges while offering hope
- Give specific, actionable advice

STRUCTURE (4 sections):
1. THE BOND: What draws these two energies together (2 sentences)
2. YOUR STRENGTHS: Where you naturally complement each other (2 sentences)
3. THE FRICTION: Where conflict may arise and why (2 sentences)
4. THE PATH FORWARD: Specific advice for harmony (2 sentences)

Be specific to their number combination. Under 150 words total.`;

const INTERPRETATION_SYSTEM_PROMPT = `You are The Oracle, delivering personal numerology readings in a CHAT interface.

CRITICAL: ONE SENTENCE PER MESSAGE. No paragraphs. Ever.

STRUCTURE (each line becomes a separate chat bubble):
1. Title line (e.g., "Life Path 9. The Humanitarian.")
2. ONE sentence about their core energy (max 15 words)
3. ONE sentence that reads their soul (max 20 words)

TOTAL: 3 short lines. Under 40 words total.

VOICE:
- Direct and certain
- Personal to THEM

FORBIDDEN:
- Multiple sentences in one line
- Paragraphs
- More than 20 words per line`;

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
    const { mode = 'enhance', context, phase, baseMessages, userInput, validation, suggestions, interpret, criticalDate, yearAhead, relationshipAdvice } = body;

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
      case 'criticalDate':
        systemPrompt = CRITICAL_DATE_SYSTEM_PROMPT;
        userPrompt = buildCriticalDatePrompt(context, criticalDate!);
        break;
      case 'yearAhead':
        systemPrompt = YEAR_AHEAD_SYSTEM_PROMPT;
        userPrompt = buildYearAheadPrompt(context, yearAhead!);
        break;
      case 'relationshipAdvice':
        systemPrompt = RELATIONSHIP_ADVICE_SYSTEM_PROMPT;
        userPrompt = buildRelationshipAdvicePrompt(context, relationshipAdvice!);
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

    if (mode === 'criticalDate') {
      // Return the AI-generated date explanation
      console.log('[Oracle API] Critical date explanation:', aiResponse);
      return NextResponse.json({ explanation: aiResponse.trim() });
    }

    if (mode === 'yearAhead') {
      // Parse year ahead prediction into sections
      const sections = aiResponse.split('\n\n').filter((s: string) => s.trim());
      const prediction = {
        theme: sections[0] || '',
        opportunities: sections[1] || '',
        challenges: sections[2] || '',
        full: aiResponse.trim(),
      };
      console.log('[Oracle API] Year ahead prediction generated');
      return NextResponse.json({ prediction });
    }

    if (mode === 'relationshipAdvice') {
      // Parse relationship advice into sections
      const advice = {
        full: aiResponse.trim(),
      };
      console.log('[Oracle API] Relationship advice generated');
      return NextResponse.json({ advice });
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

  prompt += `\n\nBase messages to enhance (make these feel more personal while keeping the core meaning):\n`;
  baseMessages.forEach((msg, i) => {
    prompt += `${i + 1}. "${msg}"\n`;
  });

  prompt += `\nReturn ${baseMessages.length} enhanced messages, each on its own line starting with a number and period.

CRITICAL FORMATTING:
- Each message MUST be 1-2 sentences MAX
- Think: chat bubbles, not paragraphs
- Keep each message under 25 words
- Punchy and impactful, not flowery`;

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

function buildCriticalDatePrompt(
  context: OracleContext,
  criticalDate: CriticalDateInfo
): string {
  let prompt = `Generate a personalized explanation for this upcoming significant date.\n\n`;

  prompt += `USER PROFILE:\n`;
  if (context.userName) prompt += `- Name: ${context.userName}\n`;
  if (context.lifePath) prompt += `- Life Path: ${context.lifePath} (${getLifePathName(context.lifePath)})\n`;
  if (context.expression) prompt += `- Expression: ${context.expression}\n`;
  if (context.soulUrge) prompt += `- Soul Urge: ${context.soulUrge}\n`;

  prompt += `\nUPCOMING DATE:\n`;
  prompt += `- Date: ${criticalDate.date}\n`;
  prompt += `- Type: ${criticalDate.type}\n`;
  prompt += `- Base meaning: "${criticalDate.baseDescription}"\n\n`;

  prompt += `Now personalize this date's significance for THIS specific person.`;
  prompt += `Reference their numbers. Be specific about what they should do or expect.`;

  return prompt;
}

function buildYearAheadPrompt(
  context: OracleContext,
  yearAhead: YearAheadInfo
): string {
  let prompt = `Generate a personalized year-ahead prediction.\n\n`;

  prompt += `USER PROFILE:\n`;
  if (context.userName) prompt += `- Name: ${context.userName}\n`;
  if (context.lifePath) prompt += `- Life Path: ${context.lifePath} (${getLifePathName(context.lifePath)})\n`;
  if (context.expression) prompt += `- Expression: ${context.expression}\n`;
  if (context.soulUrge) prompt += `- Soul Urge: ${context.soulUrge}\n`;

  prompt += `\nYEAR CONTEXT:\n`;
  prompt += `- Personal Year: ${yearAhead.personalYear}\n`;
  prompt += `- Personal Year meaning: ${getPersonalYearMeaning(yearAhead.personalYear)}\n\n`;

  prompt += `Generate 3 paragraphs:\n`;
  prompt += `1. THEME: Overall energy of their year (how Personal Year ${yearAhead.personalYear} interacts with Life Path ${context.lifePath})\n`;
  prompt += `2. OPPORTUNITIES: Specific opportunities for someone with their profile\n`;
  prompt += `3. CHALLENGES: What to watch for and how to navigate\n\n`;

  prompt += `Be specific to their number combination. Use "you" to speak directly to them.`;

  return prompt;
}

function buildRelationshipAdvicePrompt(
  context: OracleContext,
  relationshipAdvice: RelationshipAdviceInfo
): string {
  let prompt = `Generate personalized relationship advice for this couple.\n\n`;

  prompt += `PERSON 1 (the user):\n`;
  if (context.userName) prompt += `- Name: ${context.userName}\n`;
  if (context.lifePath) prompt += `- Life Path: ${context.lifePath} (${getLifePathName(context.lifePath)})\n`;
  if (context.expression) prompt += `- Expression: ${context.expression}\n`;
  if (context.soulUrge) prompt += `- Soul Urge: ${context.soulUrge}\n`;

  prompt += `\nPERSON 2:\n`;
  prompt += `- Name: ${relationshipAdvice.otherName}\n`;
  prompt += `- Life Path: ${relationshipAdvice.otherLifePath} (${getLifePathName(relationshipAdvice.otherLifePath)})\n`;

  prompt += `\nCOMPATIBILITY ANALYSIS:\n`;
  prompt += `- Overall Score: ${relationshipAdvice.compatibilityScore}%\n`;
  prompt += `- Level: ${relationshipAdvice.compatibilityLevel}\n`;
  prompt += `- Communication: ${relationshipAdvice.areas.communication}%\n`;
  prompt += `- Emotional: ${relationshipAdvice.areas.emotional}%\n`;
  prompt += `- Physical: ${relationshipAdvice.areas.physical}%\n`;
  prompt += `- Long-term: ${relationshipAdvice.areas.longTerm}%\n\n`;

  prompt += `Generate 4 sections:\n`;
  prompt += `1. THE BOND: What draws Life Path ${context.lifePath} and ${relationshipAdvice.otherLifePath} together\n`;
  prompt += `2. YOUR STRENGTHS: Where these two numbers complement each other\n`;
  prompt += `3. THE FRICTION: Where ${context.lifePath} and ${relationshipAdvice.otherLifePath} may clash\n`;
  prompt += `4. THE PATH FORWARD: Specific, actionable advice for harmony\n\n`;

  prompt += `Be specific to their number combination. Address ${context.userName || 'the user'} directly.`;

  return prompt;
}

function getPersonalYearMeaning(year: number): string {
  const meanings: Record<number, string> = {
    1: 'New beginnings, independence, taking initiative',
    2: 'Partnerships, patience, cooperation',
    3: 'Creativity, self-expression, social expansion',
    4: 'Building foundations, hard work, stability',
    5: 'Change, freedom, adventure, unexpected shifts',
    6: 'Home, family, responsibility, nurturing',
    7: 'Introspection, spiritual growth, inner wisdom',
    8: 'Achievement, abundance, material success',
    9: 'Completion, letting go, humanitarian service',
    11: 'Spiritual awakening, intuition, illumination',
    22: 'Master building, large-scale manifestation',
    33: 'Master teaching, compassionate service',
  };
  return meanings[year] || 'transformation and growth';
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
