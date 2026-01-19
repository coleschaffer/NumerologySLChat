# Numerology Oracle Chat - Product Requirements Document

## Overview

A conversational sales interface disguised as a mystical "Oracle" that delivers personalized numerology readings through an engaging chat experience. Inspired by Blair Gorman's Numerology VSL, this product transforms the traditional video sales letter into an interactive, personalized journey that progressively reveals insights while strategically introducing paid offerings.

**Core Concept:** The chat IS the sales letter. Each message builds intrigue, delivers value, and guides users toward conversion—all while feeling like a mystical, personalized experience.

---

## The Big Idea (Stefan Georgi Framework)

### Building Blocks

**Block A (Core Claim):** Your birth date contains a hidden numerical code that reveals your life path, relationship compatibility, and untapped potential—most people live their entire lives never knowing their true numbers.

**Block B (Angle/Frame):** An ancient Oracle, now accessible through modern technology, can decode your personal numerology in real-time and reveal what the universe has been trying to tell you.

### Why This Works (Big Idea Criteria)

1. **Emotionally Compelling** ✓ - Taps into deep desires: understanding oneself, relationship clarity, feeling "chosen" or special
2. **Built-In Intrigue** ✓ - "What are MY numbers? What do they mean?" Creates irresistible open loops
3. **Easily Understood** ✓ - Birth date → hidden meaning → revealed by Oracle
4. **Believable but Surprising** ✓ - Numerology is familiar enough to be credible, specific enough to feel personal
5. **Difficult to Steal** ✓ - The conversational format + personalization engine is the moat

### The Mechanism

The Oracle doesn't just tell you what your numbers mean—it **calculates the vibrational frequency patterns** between your core numbers and the people in your life. This is why generic horoscopes never felt right: they weren't comparing your specific numerical signature against the actual people around you.

---

## User Experience Flow

### Phase 1: The Opening (Free)

**Goal:** Hook user immediately with intrigue and quick personalization

```
[Cosmos background animates slowly - stars, nebulae, subtle movement]

Oracle: "I've been waiting for you..."

Oracle: "Before we begin, I need to ask you something important."

Oracle: "When were you born?"

[Date picker appears OR user types DOB]
```

**First Reveal:** Life Path Number calculation with dramatic presentation
- Show the calculation visually (date → single digit reduction)
- Deliver 2-3 compelling, specific traits
- End with an open loop: "But this is only your surface number. Your TRUE nature lies deeper..."

### Phase 2: The Deepening (Free → Soft Gate)

**Goal:** Build investment through progressive questioning and reveals

**Questions to Ask:**
1. Birth date (Life Path Number)
2. Full birth name (Expression/Destiny Number)
3. Current relationship status
4. Name of someone important to them (partner, crush, family member)
5. That person's birth date (if known)
6. Biggest current challenge (career, love, money, health, purpose)

**Key Insight Reveals:**
- Life Path Number interpretation
- Expression Number interpretation
- Soul Urge Number (from vowels)
- Birthday Number
- **Compatibility reading** with the person they mentioned

### Phase 3: The Comparison Hook (Conversion Point)

**Goal:** Create irresistible desire to know more about specific relationships

```
Oracle: "I see something interesting about [Partner Name]..."

Oracle: "Your numbers create a unique pattern together.
         In some areas, you amplify each other.
         In others... there is friction I must warn you about."

Oracle: "I can show you the complete compatibility matrix,
         including the THREE critical dates this year
         where your paths will intersect in meaningful ways."

[Suggestion Card: "Reveal My Compatibility Reading - $9"]
```

### Phase 4: Unlockable Content (Paid Tiers)

**Tier 1: Personal Deep Dive ($9)**
- Complete personal numerology profile
- Year ahead forecast with specific dates
- Lucky numbers, colors, elements
- Career alignment analysis

**Tier 2: Relationship Matrix ($19)**
- Full compatibility analysis with named person
- Communication style translation guide
- Conflict resolution based on numbers
- "Soul Contract" reading

**Tier 3: Inner Circle Readings ($29)**
- Add up to 5 people to your matrix
- See how they all interact numerologically
- Family dynamics analysis
- "Who should you trust?" readings

**Tier 4: Monthly Oracle Subscription ($9/month)**
- Weekly personalized readings
- Monthly "cosmic weather" for your numbers
- Access to ask Oracle specific questions
- New relationship compatibility checks

---

## Interface Design

### Visual Theme

**Background:**
- Deep space cosmos with slow-moving stars/nebulae
- Subtle particle effects (floating light motes)
- Color palette: Deep purples, midnight blues, gold accents, cosmic dust pinks
- Occasional subtle "energy" pulses when important reveals happen

**Chat Interface:**
- Clean, minimal chat bubbles
- Oracle messages appear with slight glow effect
- User messages are simpler, grounded
- Typing indicator shows "Oracle is reading the stars..."

### Suggestion Cards

Floating cards that appear contextually to guide conversation:

**Early Stage:**
- "Tell me my Life Path meaning"
- "What does my birthday reveal?"
- "I want to understand myself better"

**Mid Stage:**
- "What about my love life?"
- "Compare me to [Name]"
- "What's blocking my success?"

**Conversion Stage:**
- "Reveal my full reading" → leads to purchase
- "Show me our compatibility" → leads to purchase
- "Unlock my year ahead" → leads to purchase

### Typography & UI Elements

- **Oracle Name:** Something like "The Oracle" or "Numeris" or "The Codex"
- **Font:** Mystical but readable (something like Cinzel for headers, clean sans for body)
- **Numbers:** Should appear with special styling when calculated (gold, glowing)
- **Progress Indicator:** Subtle indicator of "reading depth" or "connection strength"

---

## Technical Architecture

### Frontend

```
/app
├── /components
│   ├── Chat/
│   │   ├── ChatContainer.tsx      # Main chat wrapper
│   │   ├── MessageBubble.tsx      # Individual messages
│   │   ├── OracleMessage.tsx      # Styled oracle responses
│   │   ├── UserInput.tsx          # Text input + date picker
│   │   ├── SuggestionCards.tsx    # Clickable prompt cards
│   │   └── TypingIndicator.tsx    # "Oracle is reading..."
│   ├── Background/
│   │   ├── CosmosBackground.tsx   # Animated space background
│   │   └── ParticleField.tsx      # Floating particles
│   ├── Numerology/
│   │   ├── NumberReveal.tsx       # Dramatic number display
│   │   ├── CompatibilityChart.tsx # Visual compatibility
│   │   └── CalculationVisual.tsx  # Show math happening
│   ├── Payment/
│   │   ├── PaywallModal.tsx       # Unlock content prompt
│   │   └── TierSelector.tsx       # Choose reading level
│   └── UI/
│       ├── GlowButton.tsx
│       └── MysticalCard.tsx
├── /hooks
│   ├── useNumerology.ts           # All calculations
│   ├── useConversationFlow.ts     # State machine for chat
│   └── usePayment.ts              # Stripe integration
├── /lib
│   ├── numerology.ts              # Core calculation functions
│   ├── interpretations.ts         # Reading text content
│   └── compatibility.ts           # Relationship analysis
└── /data
    ├── lifePathMeanings.ts
    ├── expressionMeanings.ts
    └── compatibilityMatrix.ts
```

### Numerology Calculation Engine

**Core Numbers to Calculate:**

1. **Life Path Number** (from DOB)
   - Reduce month + day + year to single digit (or master number 11, 22, 33)

2. **Expression/Destiny Number** (from full name)
   - A=1, B=2... convert and reduce

3. **Soul Urge Number** (from vowels in name)
   - Reveals inner desires

4. **Personality Number** (from consonants)
   - How others perceive you

5. **Birthday Number** (just the day)
   - Special talents

6. **Compatibility Score** (comparing two people)
   - Multiple factors combined

### Conversation State Machine

```typescript
type ConversationPhase =
  | 'opening'           // Initial hook
  | 'collecting_dob'    // Get birth date
  | 'first_reveal'      // Life Path reveal
  | 'collecting_name'   // Get full name
  | 'deeper_reveal'     // Expression + Soul numbers
  | 'relationship_hook' // Ask about someone
  | 'collecting_other'  // Get their details
  | 'compatibility_tease' // Show partial compatibility
  | 'paywall'           // Conversion point
  | 'paid_reading'      // Full unlocked content
```

### AI Integration (Optional Enhancement)

Use LLM to generate personalized narrative around the numbers:
- Take calculated numbers + user context
- Generate flowing, mystical prose
- Personalize based on their stated challenges
- Create unique "prophecies" and insights

**Prompt Template:**
```
You are a mystical numerology Oracle. The user has:
- Life Path: {lifePathNumber}
- Expression: {expressionNumber}
- Current challenge: {statedChallenge}
- Relationship query about: {otherPersonName}

Generate a 2-3 sentence mystical insight about their situation that:
1. References their numbers specifically
2. Addresses their stated challenge
3. Creates intrigue about what comes next
4. Feels personal and profound
```

---

## Conversion Strategy

### The Progressive Value Ladder

1. **Free:** Enough value to create investment (3-4 meaningful reveals)
2. **First Purchase ($9):** Completes their personal reading
3. **Upsell ($19):** Adds relationship dimension
4. **Expansion ($29):** Adds more people
5. **Recurring ($9/mo):** Ongoing relationship with Oracle

### Psychological Triggers

1. **Personalization Investment** - The more they share, the more they want to see the full picture
2. **Relationship Curiosity** - Once they know their numbers, they MUST know how they compare
3. **Specific Dates** - "Three critical dates this year" creates urgency
4. **Partial Reveals** - Show compatibility is HIGH or concerning, but not the details
5. **Social Proof** - "342 people have asked about Capricorn partners today"

### Paywall Copy Examples

**Soft Gate:**
```
Oracle: "Your full numerology profile reveals 7 more numbers
         that shape your destiny. I can see them clearly now..."

[Card: "Unlock My Complete Reading - $9"]
[Card: "Maybe later" → continues with limited content]
```

**Hard Gate (Relationship):**
```
Oracle: "I see the full picture of you and [Name] now.
         Your compatibility score is calculated.
         The areas of harmony... and the warnings...

         Do you wish to see what the numbers reveal?"

[Card: "Reveal Our Compatibility - $19"]
```

---

## Content Requirements

### Numerology Interpretations Needed

For each Life Path (1-9, 11, 22, 33):
- Core personality description (100-150 words)
- Strengths (5 bullet points)
- Challenges (5 bullet points)
- Love compatibility overview
- Career alignments
- Famous people with this number

For Compatibility (all combinations):
- Overall harmony score (1-100)
- Communication style match
- Emotional compatibility
- Physical/attraction energy
- Long-term potential
- Key challenges to navigate
- Advice for the pairing

### Oracle Voice Guidelines

**Tone:**
- Wise but warm, not cold or distant
- Speaks in certainties, not maybes
- Uses "I see..." and "The numbers reveal..."
- Creates intimacy: "Between us..."
- Occasionally references "the stars" or "the universe"

**Avoid:**
- Generic horoscope language
- Overly flowery/purple prose
- Anything that sounds like AI
- Hedging or uncertain language

**Example Messages:**

Good: "I see strength in you that others mistake for stubbornness. Your Life Path 1 demands that you lead, even when the path is lonely."

Bad: "As a Life Path 1, you might be seen as a natural leader who could potentially have some independent tendencies."

---

## Technical Requirements

### Stack Recommendation

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **State:** Zustand or React Context for conversation state
- **Payments:** Stripe Checkout or Stripe Elements
- **AI (optional):** Anthropic Claude API or OpenAI
- **Analytics:** Mixpanel or Amplitude for funnel tracking
- **Background:** Three.js or CSS animations for cosmos effect

### Performance Targets

- First Contentful Paint: < 1.5s
- Chat response time: < 500ms (pre-computed) or < 2s (AI-generated)
- Background animations: 60fps, low CPU usage
- Mobile-first, fully responsive

### Data Privacy

- Store minimal user data
- DOB and names only needed for session
- Payment through Stripe (no card storage)
- Clear privacy policy about numerology data usage
- Option to "forget me" and clear session

---

## Success Metrics

### Funnel Metrics

| Stage | Target |
|-------|--------|
| Landing → DOB entered | 70% |
| DOB → Name entered | 80% |
| Name → Relationship question | 75% |
| Free reading complete | 60% |
| Paywall view | 50% |
| First purchase ($9) | 8-12% |
| Upsell to $19 | 25% of purchasers |
| Subscription conversion | 15% of purchasers |

### Engagement Metrics

- Average messages exchanged: 15+
- Time on site: 5+ minutes
- Return visitors (for subscribers): 3x/month

### Revenue Targets

- Average order value: $15-20
- Customer acquisition cost target: < $8
- 30-day LTV: $25+

---

## Development Phases

### Phase 1: Core Chat MVP (Week 1-2)
- Basic chat interface with cosmos background
- DOB collection and Life Path calculation
- First reveal experience
- Suggestion cards system
- Mobile responsive

### Phase 2: Full Free Flow (Week 2-3)
- Name collection and Expression number
- Relationship question flow
- Compatibility tease (without full reveal)
- Paywall modal
- Polish animations and transitions

### Phase 3: Payment & Unlock (Week 3-4)
- Stripe integration
- Tier 1 unlockable content
- Full personal reading delivery
- Relationship reading delivery
- Receipt and access management

### Phase 4: Enhancement (Week 4+)
- AI-personalized narratives
- Subscription tier
- Email capture and follow-up
- A/B testing framework
- Analytics dashboard

---

## Competitive Differentiation

### Why This Beats Static Numerology Sites

| Traditional Sites | Numerology Oracle |
|------------------|-------------------|
| Fill form, get wall of text | Conversational, progressive reveal |
| Generic, impersonal | Every message references THEIR data |
| All info at once | Strategic open loops and intrigue |
| One-time visit | Relationship adds replay value |
| Static content | AI-enhanced personalization |

### Why This Beats Standard VSLs

| Video Sales Letter | Numerology Oracle |
|-------------------|-------------------|
| One-way communication | Interactive, user controls pace |
| Same script for everyone | Personalized to their DOB/name |
| Can't pause/skip easily | Read at their own pace |
| Have to wait for the pitch | Paywall appears when curiosity peaks |
| No immediate personalization | See their numbers in real-time |

---

## Open Questions

1. **Oracle naming:** "The Oracle" vs branded name like "Numeris" or "The Codex"?
2. **Social features:** Should users be able to share readings or compare with friends?
3. **Email capture:** Where in the flow? Before or after first payment?
4. **Gamification:** Badges, streaks for subscribers?
5. **Multiple people flow:** How to handle when user wants to check multiple relationships?

---

## Appendix: Numerology Quick Reference

### Life Path Calculation
```
DOB: March 15, 1990
Month: 3
Day: 1+5 = 6
Year: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1

Life Path: 3 + 6 + 1 = 10 → 1+0 = 1
```

### Letter-Number Mapping (Pythagorean)
```
1: A, J, S
2: B, K, T
3: C, L, U
4: D, M, V
5. E, N, W
6: F, O, X
7: G, P, Y
8: H, Q, Z
9: I, R
```

### Master Numbers
- **11:** Intuitive, spiritual, illuminating
- **22:** Master builder, practical visionary
- **33:** Master teacher, compassionate healer

---

*PRD Version 1.0 - Ready for implementation*
