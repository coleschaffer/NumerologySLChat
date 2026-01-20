// Numerology interpretations and meanings

export interface LifePathInterpretation {
  number: number;
  name: string;
  shortDescription: string;
  coreDescription: string;
  strengths: string[];
  challenges: string[];
  loveOverview: string;
  careers: string[];
  famousPeople: string[];
}

export const lifePathInterpretations: Record<number, LifePathInterpretation> = {
  1: {
    number: 1,
    name: "The Pioneer",
    shortDescription: "Independent, ambitious, and born to lead.",
    coreDescription: "You possess an innate drive to forge your own path. The universe marked you with the number of new beginnings—you are here to initiate, to pioneer, to lead where others fear to tread. Your spirit is that of the lone wolf who eventually builds a pack, the visionary who sees what others cannot.",
    strengths: [
      "Natural leadership that inspires others",
      "Unwavering determination and willpower",
      "Creative originality in problem-solving",
      "Courage to take the first step",
      "Self-reliance that carries you through adversity"
    ],
    challenges: [
      "Tendency toward stubbornness when challenged",
      "Difficulty accepting help from others",
      "Impatience with slower-moving people",
      "Risk of isolation through excessive independence",
      "Ego conflicts in partnerships"
    ],
    loveOverview: "In love, you need a partner who respects your independence while offering unwavering support. You're drawn to those with their own strength, but power struggles can emerge. Your ideal match admires your ambition without trying to dim your fire.",
    careers: ["Entrepreneur", "CEO", "Inventor", "Military Leader", "Surgeon"],
    famousPeople: ["Martin Luther King Jr.", "Tom Hanks", "Steve Jobs", "Lady Gaga"]
  },
  2: {
    number: 2,
    name: "The Diplomat",
    shortDescription: "Intuitive, cooperative, and deeply empathetic.",
    coreDescription: "You are the universe's peacemaker, born with an extraordinary sensitivity to the energies around you. Where others see conflict, you see the path to harmony. Your power lies not in dominance but in your ability to bridge divides, to sense what remains unspoken, to nurture what others overlook.",
    strengths: [
      "Exceptional intuition and emotional intelligence",
      "Natural mediator in conflicts",
      "Deep capacity for love and partnership",
      "Patience that outlasts obstacles",
      "Ability to work harmoniously with anyone"
    ],
    challenges: [
      "Oversensitivity to criticism",
      "Tendency to put others' needs before your own",
      "Difficulty making decisions alone",
      "Risk of being overlooked or undervalued",
      "Struggle with direct confrontation"
    ],
    loveOverview: "Love is your natural element. You flourish in partnership and have an almost psychic connection to your partner's needs. However, you must guard against losing yourself in relationships. Your ideal match appreciates your sensitivity and reciprocates your devotion.",
    careers: ["Counselor", "Diplomat", "Teacher", "Nurse", "Artist"],
    famousPeople: ["Barack Obama", "Jennifer Aniston", "Emma Watson", "Kanye West"]
  },
  3: {
    number: 3,
    name: "The Communicator",
    shortDescription: "Creative, expressive, and magnetically charismatic.",
    coreDescription: "The universe gifted you with the spark of creation itself. You are meant to express, to inspire, to bring joy and beauty into the world. Words flow through you like magic—whether spoken, written, sung, or painted. Your presence lights up rooms and your optimism is contagious.",
    strengths: [
      "Natural gift for communication and self-expression",
      "Infectious optimism and enthusiasm",
      "Creative genius across multiple mediums",
      "Ability to inspire and uplift others",
      "Social magnetism that draws people to you"
    ],
    challenges: [
      "Tendency to scatter energy across too many projects",
      "Difficulty with discipline and follow-through",
      "Risk of superficiality to avoid depth",
      "Mood swings when creativity is blocked",
      "Sensitivity to criticism of your work"
    ],
    loveOverview: "You need a partner who celebrates your creative spirit and keeps up with your social energy. Boredom is your enemy in relationships. Your ideal match is someone who stimulates your mind, laughs with you, and gives you space to create.",
    careers: ["Writer", "Actor", "Public Speaker", "Designer", "Entertainer"],
    famousPeople: ["John Travolta", "Celine Dion", "Snoop Dogg", "Hillary Clinton"]
  },
  4: {
    number: 4,
    name: "The Builder",
    shortDescription: "Practical, disciplined, and rock-solid reliable.",
    coreDescription: "You are the foundation upon which great things are built. The universe entrusted you with the sacred task of bringing order to chaos, of transforming visions into reality through patient, persistent effort. Where others dream, you construct. Where others waver, you stand firm.",
    strengths: [
      "Unmatched reliability and trustworthiness",
      "Exceptional organizational abilities",
      "Patience to see long-term projects through",
      "Practical problem-solving skills",
      "Strong moral foundation and integrity"
    ],
    challenges: [
      "Rigidity when plans must change",
      "Tendency to overwork and neglect rest",
      "Difficulty with spontaneity and flexibility",
      "Risk of becoming too controlling",
      "Struggle to express emotions openly"
    ],
    loveOverview: "You offer stability and loyalty that few can match. You need a partner who appreciates your steady nature and doesn't mistake your reserve for coldness. Your ideal match values security, shares your work ethic, and helps you loosen up occasionally.",
    careers: ["Architect", "Engineer", "Accountant", "Project Manager", "Surgeon"],
    famousPeople: ["Oprah Winfrey", "Bill Gates", "Elton John", "Usher"]
  },
  5: {
    number: 5,
    name: "The Freedom Seeker",
    shortDescription: "Adventurous, versatile, and endlessly curious.",
    coreDescription: "You are the universe's explorer, born with an insatiable hunger for experience. Routine is your prison; freedom is your oxygen. You are here to taste all of life's flavors, to adapt, to evolve, to show others that change is not something to fear but to embrace.",
    strengths: [
      "Remarkable adaptability to any situation",
      "Natural magnetism and charm",
      "Courage to embrace change and risk",
      "Quick wit and mental agility",
      "Ability to inspire others to live boldly"
    ],
    challenges: [
      "Restlessness that sabotages stability",
      "Tendency toward excess and overindulgence",
      "Difficulty with commitment and follow-through",
      "Risk of burning bridges impulsively",
      "Scattered focus that limits mastery"
    ],
    loveOverview: "Freedom in love is non-negotiable for you. You need a partner who is secure enough to give you space and adventurous enough to join your journeys. Your ideal match is independent, spontaneous, and doesn't try to cage your spirit.",
    careers: ["Travel Writer", "Sales", "Marketing", "Pilot", "Entrepreneur"],
    famousPeople: ["Angelina Jolie", "Steven Spielberg", "Beyoncé", "Abraham Lincoln"]
  },
  6: {
    number: 6,
    name: "The Nurturer",
    shortDescription: "Loving, responsible, and devoted to service.",
    coreDescription: "You carry the heart of the universe itself—vast, nurturing, and endlessly giving. Your purpose is to love, to heal, to create harmony in homes and communities. Others sense your warmth and are drawn to seek your counsel and comfort. You see beauty where others see ordinary.",
    strengths: [
      "Profound capacity for unconditional love",
      "Natural healing presence",
      "Strong sense of responsibility and duty",
      "Artistic eye for beauty and harmony",
      "Ability to create warm, welcoming spaces"
    ],
    challenges: [
      "Tendency to sacrifice self for others",
      "Difficulty accepting imperfection",
      "Risk of becoming controlling through 'helping'",
      "Struggle to receive as well as give",
      "Overwhelm from taking on others' problems"
    ],
    loveOverview: "Love and family are central to your existence. You give yourself completely to those you love and expect the same devotion in return. Your ideal match appreciates your nurturing nature, creates a beautiful home with you, and doesn't take your giving heart for granted.",
    careers: ["Therapist", "Teacher", "Interior Designer", "Chef", "Healthcare"],
    famousPeople: ["John Lennon", "Michael Jackson", "Meryl Streep", "Einstein"]
  },
  7: {
    number: 7,
    name: "The Seeker",
    shortDescription: "Analytical, spiritual, and profoundly introspective.",
    coreDescription: "You are the universe's philosopher, the one who asks the questions others fear to voice. Behind your contemplative exterior lies a mind that will not rest until it uncovers truth. You walk between the worlds of logic and spirit, science and mystery, seeking the hidden order beneath the chaos.",
    strengths: [
      "Exceptional analytical and research abilities",
      "Deep spiritual awareness and intuition",
      "Capacity for profound inner wisdom",
      "Independence of thought and belief",
      "Ability to see through illusion"
    ],
    challenges: [
      "Tendency toward isolation and withdrawal",
      "Difficulty trusting others fully",
      "Risk of overthinking and analysis paralysis",
      "Struggle with emotional expression",
      "Skepticism that blocks connection"
    ],
    loveOverview: "You need a partner who respects your need for solitude and intellectual depth. Surface-level relationships drain you. Your ideal match shares your quest for meaning, gives you space to think, and connects with you on a soul level.",
    careers: ["Scientist", "Researcher", "Philosopher", "Analyst", "Spiritual Teacher"],
    famousPeople: ["Princess Diana", "Leonardo DiCaprio", "Julia Roberts", "Johnny Depp"]
  },
  8: {
    number: 8,
    name: "The Powerhouse",
    shortDescription: "Ambitious, authoritative, and magnetically successful.",
    coreDescription: "You carry the vibration of abundance and authority. The universe designed you to wield power—not for ego, but for impact. You have an innate understanding of the material world, of how to build empires and create lasting legacies. Success is not just your goal; it's your destiny.",
    strengths: [
      "Natural business acumen and financial wisdom",
      "Exceptional leadership and management skills",
      "Determination that overcomes any obstacle",
      "Ability to manifest abundance",
      "Strength that inspires confidence in others"
    ],
    challenges: [
      "Workaholism that damages relationships",
      "Risk of measuring worth by achievements",
      "Tendency toward materialism",
      "Difficulty showing vulnerability",
      "Power struggles in partnerships"
    ],
    loveOverview: "You need a partner who matches your ambition and isn't intimidated by your power. You respect strength and have little patience for weakness. Your ideal match is accomplished in their own right, supports your goals, and helps you remember that love matters more than success.",
    careers: ["CEO", "Banker", "Real Estate", "Politician", "Lawyer"],
    famousPeople: ["Nelson Mandela", "Pablo Picasso", "Sandra Bullock", "50 Cent"]
  },
  9: {
    number: 9,
    name: "The Humanitarian",
    shortDescription: "Compassionate, wise, and devoted to serving humanity.",
    coreDescription: "You are an old soul, carrying the wisdom of all numbers that came before. The universe placed within you a vast compassion that extends beyond personal concerns to embrace all of humanity. You are here to give, to heal, to complete cycles and help others transcend their limitations.",
    strengths: [
      "Profound compassion for all beings",
      "Natural wisdom and spiritual maturity",
      "Artistic and creative talents",
      "Ability to let go and move forward",
      "Charisma that attracts devoted followers"
    ],
    challenges: [
      "Difficulty with personal boundaries",
      "Tendency to neglect personal needs",
      "Risk of becoming preachy or self-righteous",
      "Struggle to accept help from others",
      "Emotional wounds from past lives"
    ],
    loveOverview: "Your love is universal, which can make personal relationships challenging. You need a partner who shares your ideals and understands that your heart belongs partly to the world. Your ideal match is spiritually evolved, emotionally mature, and doesn't compete with your higher calling.",
    careers: ["Humanitarian", "Artist", "Teacher", "Healer", "Activist"],
    famousPeople: ["Mother Teresa", "Mahatma Gandhi", "Morgan Freeman", "Kurt Cobain"]
  },
  11: {
    number: 11,
    name: "The Illuminator",
    shortDescription: "Visionary, intuitive, and spiritually gifted.",
    coreDescription: "You carry a Master Number—the vibration of spiritual insight and illumination. The universe chose you as a channel between the seen and unseen worlds. Your intuition borders on the psychic; your presence can literally shift the energy in a room. You are here to inspire and awaken others.",
    strengths: [
      "Extraordinary intuition and psychic ability",
      "Inspirational presence that transforms others",
      "Visionary thinking ahead of its time",
      "Deep spiritual connection and awareness",
      "Ability to manifest through thought alone"
    ],
    challenges: [
      "Intense nervous energy and anxiety",
      "Feeling overwhelmed by your gifts",
      "Difficulty grounding yourself in reality",
      "High sensitivity that requires protection",
      "Pressure to live up to your potential"
    ],
    loveOverview: "You need a partner who can handle your intensity and support your spiritual mission. Ordinary relationships feel hollow to you. Your ideal match is evolved enough to understand your gifts, grounds you when needed, and walks the spiritual path alongside you.",
    careers: ["Spiritual Teacher", "Psychic", "Inventor", "Artist", "Inspirational Speaker"],
    famousPeople: ["Barack Obama", "Bill Clinton", "Robert Downey Jr.", "Edgar Allan Poe"]
  },
  22: {
    number: 22,
    name: "The Master Builder",
    shortDescription: "Visionary architect of lasting change.",
    coreDescription: "You possess the most powerful number in numerology—the Master Builder. Where others dream, you have the ability to transform those dreams into lasting reality on a global scale. The universe gave you the vision of the 11 combined with the practical power of the 4. You are here to build something that outlasts you.",
    strengths: [
      "Ability to manifest grand visions into reality",
      "Exceptional practical and organizational skills",
      "Leadership that inspires mass movements",
      "Unlimited potential for achievement",
      "Balance of spiritual wisdom and material mastery"
    ],
    challenges: [
      "Enormous pressure from your potential",
      "Risk of nervous breakdown from stress",
      "Tendency to become tyrannical",
      "Difficulty with the mundane aspects of life",
      "Impatience with those who don't share your vision"
    ],
    loveOverview: "You need a partner who understands the magnitude of your purpose and supports your mission. You can be demanding in relationships because you expect excellence. Your ideal match is accomplished, patient, and helps you remember to enjoy life between achievements.",
    careers: ["World Leader", "Architect", "Diplomat", "Visionary CEO", "Philanthropist"],
    famousPeople: ["Paul McCartney", "Richard Branson", "Tina Fey", "Will Smith"]
  },
  33: {
    number: 33,
    name: "The Master Teacher",
    shortDescription: "Selfless healer devoted to uplifting humanity.",
    coreDescription: "You carry the rarest Master Number—the vibration of the Master Teacher. The universe blessed you with the healing power of the 6 amplified to cosmic proportions. Your very presence can heal; your words can transform lives. You are here to serve humanity at the highest level.",
    strengths: [
      "Profound healing abilities",
      "Ability to teach through example",
      "Unconditional love for all beings",
      "Spiritual mastery and wisdom",
      "Capacity to inspire global change"
    ],
    challenges: [
      "Overwhelming sense of responsibility",
      "Self-sacrifice to the point of martyrdom",
      "Difficulty maintaining personal boundaries",
      "Risk of being taken advantage of",
      "Pressure to be perfect"
    ],
    loveOverview: "Your love is so vast it can be hard to contain in one relationship. You need a partner who shares your devotion to service and understands that your love extends to all beings. Your ideal match is spiritually evolved, supports your healing work, and helps you remember to care for yourself.",
    careers: ["Spiritual Leader", "Healer", "Teacher", "Humanitarian", "Artist"],
    famousPeople: ["Albert Einstein", "Stephen King", "Meryl Streep", "Thomas Edison"]
  }
};

// Get interpretation for a life path number
export function getLifePathInterpretation(number: number): LifePathInterpretation | null {
  return lifePathInterpretations[number] || null;
}

// Oracle opening messages based on life path (Stefan Georgi style)
export function getOracleRevealMessage(lifePath: number): string[] {
  const interp = lifePathInterpretations[lifePath];
  if (!interp) return [];

  return [
    `Your Life Path Number is ${lifePath}...`,
    `You are "${interp.name}."`,
    interp.shortDescription,
    interp.coreDescription,
  ];
}

// Enhanced opening hook (Stefan Georgi "Surprising Claim" technique)
export function getEnhancedOpeningMessages(): string[] {
  return [
    "You felt it, didn't you?",
    "That pull. That sense that something in your life is slightly... off. Like you're following a script you didn't write.",
    "There's a reason for that. And it's hidden in the exact moment you took your first breath.",
    "Tell me... when were you born?",
  ];
}

// Enhanced reveal messages that reframe negatives as positives
export function getEnhancedRevealMessages(lifePath: number, userName?: string): string[] {
  const reframes: Record<number, { negative: string; positive: string; question: string }> = {
    1: {
      negative: "stubborn",
      positive: "You're not stubborn—you're CERTAIN. You see what needs to be done while others are still debating.",
      question: "Has someone ever held you back from something you knew was right?",
    },
    2: {
      negative: "too sensitive",
      positive: "You're not too sensitive—you're PERCEPTIVE. You see what others miss entirely.",
      question: "Have you ever known something was wrong before anyone else noticed?",
    },
    3: {
      negative: "scattered",
      positive: "You're not scattered—you're MULTIDIMENSIONAL. Your mind sees connections others can't.",
      question: "Do people ever fail to understand the vision you're trying to share?",
    },
    4: {
      negative: "rigid",
      positive: "You're not rigid—you're PRINCIPLED. You build things that last because you refuse to compromise on what matters.",
      question: "Have you ever been forced to abandon something you believed in?",
    },
    5: {
      negative: "restless",
      positive: "You're not restless—you're ALIVE. You understand that growth requires movement.",
      question: "Do you feel caged when life becomes too predictable?",
    },
    6: {
      negative: "controlling",
      positive: "You're not controlling—you're RESPONSIBLE. You care too much to let things fall apart.",
      question: "Do people come to you when everything else has failed?",
    },
    7: {
      negative: "distant",
      positive: "You're not distant—you're SELECTIVE. Your inner world is too rich for shallow connections.",
      question: "Do you sometimes feel like you're speaking a language no one else understands?",
    },
    8: {
      negative: "ambitious to a fault",
      positive: "You're not ambitious to a fault—you're DESTINED FOR IMPACT. Small thinking has never been an option for you.",
      question: "Have you ever known you were meant for more than where you are?",
    },
    9: {
      negative: "naive",
      positive: "You're not naive—you're HOPEFUL. You see the potential in people because you carry that same potential.",
      question: "Do you find yourself giving to others even when they don't deserve it?",
    },
    11: {
      negative: "anxious",
      positive: "You're not anxious—you're ATTUNED. You pick up energies others don't even know exist.",
      question: "Have you ever known something was about to happen before it did?",
    },
    22: {
      negative: "overwhelming",
      positive: "You're not overwhelming—you're VISIONARY. Your ideas are simply larger than most people can hold.",
      question: "Do your dreams feel too big to explain to others?",
    },
    33: {
      negative: "a doormat",
      positive: "You're not a doormat—you're a HEALER. Your giving isn't weakness, it's your greatest power.",
      question: "Do people seem to feel better just by being in your presence?",
    },
  };

  const reframe = reframes[lifePath] || reframes[9];
  const namePrefix = userName ? `${userName}, ` : "";

  return [
    `${namePrefix}let me tell you something about yourself...`,
    `You've been called "${reframe.negative}" before. But they don't understand.`,
    reframe.positive,
    reframe.question,
  ];
}

// Enhanced compatibility tease with specificity (Stefan Georgi "Partial Reveal with Stakes")
export function getEnhancedCompatibilityTease(
  lifePath1: number,
  lifePath2: number,
  name2: string,
  score: number
): string[] {
  const level = score >= 70 ? 'high' : score >= 50 ? 'moderate' : 'challenging';

  const harmonies = Math.floor(Math.random() * 2) + 2; // 2-3 harmony points
  const warnings = Math.floor(Math.random() * 2) + 1;  // 1-2 warning points

  return [
    `I've seen your numbers alongside ${name2}'s now.`,
    `I need you to understand something...`,
    `Your compatibility score is ${score}%.`,
    level === 'high'
      ? `That's strong. But strong connections require understanding.`
      : level === 'moderate'
      ? `That's not low. But it's not simple either.`
      : `That number carries weight. But challenging doesn't mean impossible.`,
    `I see ${harmonies} areas of deep harmony between you. Connection points that could sustain you both through anything.`,
    `But I also see ${warnings} friction pattern${warnings > 1 ? 's' : ''}. Places where your numbers clash in ways that could slowly erode what you've built...`,
    `The full picture reveals which paths strengthen you... and which ones to navigate with care.`,
  ];
}

// Compatibility messages
export function getCompatibilityTeaser(
  lifePath1: number,
  lifePath2: number,
  name2: string
): string[] {
  const interp1 = lifePathInterpretations[lifePath1];
  const interp2 = lifePathInterpretations[lifePath2];

  if (!interp1 || !interp2) return [];

  const messages = [
    `I see the numbers aligning between you and ${name2}...`,
    `You, ${interp1.name}, meeting ${interp2.name}.`,
    `There are patterns here that require... careful examination.`,
    `The compatibility between a ${lifePath1} and a ${lifePath2} is significant.`,
    `I can see areas where you strengthen each other.`,
    `And I see where friction may arise...`,
  ];

  return messages;
}
