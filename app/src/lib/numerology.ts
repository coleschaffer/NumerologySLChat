// Core numerology calculation functions

const LETTER_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Reduce a number to single digit or master number (11, 22, 33)
export function reduceToSingleDigit(num: number, preserveMaster = true): number {
  while (num > 9) {
    if (preserveMaster && (num === 11 || num === 22 || num === 33)) {
      return num;
    }
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

// Calculate Life Path Number from date of birth
export function calculateLifePath(dob: Date): number {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  const year = dob.getFullYear();

  // Reduce each component
  const monthReduced = reduceToSingleDigit(month);
  const dayReduced = reduceToSingleDigit(day);
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((sum, d) => sum + parseInt(d), 0)
  );

  // Sum and reduce
  const total = monthReduced + dayReduced + yearReduced;
  return reduceToSingleDigit(total);
}

// Calculate Expression/Destiny Number from full name
export function calculateExpression(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const total = cleanName.split('').reduce((sum, letter) => {
    return sum + (LETTER_VALUES[letter] || 0);
  }, 0);
  return reduceToSingleDigit(total);
}

// Calculate Soul Urge Number from vowels in name
export function calculateSoulUrge(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const total = cleanName.split('').reduce((sum, letter) => {
    if (VOWELS.includes(letter)) {
      return sum + (LETTER_VALUES[letter] || 0);
    }
    return sum;
  }, 0);
  return reduceToSingleDigit(total);
}

// Calculate Personality Number from consonants in name
export function calculatePersonality(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const total = cleanName.split('').reduce((sum, letter) => {
    if (!VOWELS.includes(letter)) {
      return sum + (LETTER_VALUES[letter] || 0);
    }
    return sum;
  }, 0);
  return reduceToSingleDigit(total);
}

// Calculate Birthday Number (just the day)
export function calculateBirthdayNumber(dob: Date): number {
  const day = dob.getDate();
  return reduceToSingleDigit(day);
}

// Calculate compatibility between two Life Path numbers
export function calculateCompatibility(lifePath1: number, lifePath2: number): {
  score: number;
  level: 'high' | 'moderate' | 'challenging';
  areas: {
    communication: number;
    emotional: number;
    physical: number;
    longTerm: number;
  };
} {
  // Compatibility matrix (simplified)
  const naturalPartners: Record<number, number[]> = {
    1: [3, 5, 6],
    2: [4, 6, 8],
    3: [1, 5, 9],
    4: [2, 6, 8],
    5: [1, 3, 7],
    6: [1, 2, 4, 9],
    7: [5, 7, 9],
    8: [2, 4, 8],
    9: [3, 6, 7, 9],
    11: [2, 4, 6],
    22: [4, 6, 8],
    33: [6, 9, 11],
  };

  const challenging: Record<number, number[]> = {
    1: [1, 8],
    2: [5, 9],
    3: [4, 8],
    4: [3, 5],
    5: [2, 4],
    6: [3, 7],
    7: [6, 8],
    8: [1, 3, 7],
    9: [2, 4],
    11: [1, 5],
    22: [1, 3],
    33: [1, 4],
  };

  // Base score
  let baseScore = 60;

  // Check if natural partners
  if (naturalPartners[lifePath1]?.includes(lifePath2) ||
      naturalPartners[lifePath2]?.includes(lifePath1)) {
    baseScore = 85;
  } else if (challenging[lifePath1]?.includes(lifePath2) ||
             challenging[lifePath2]?.includes(lifePath1)) {
    baseScore = 45;
  }

  // Same number bonus/penalty
  if (lifePath1 === lifePath2) {
    baseScore = lifePath1 === 7 || lifePath1 === 9 ? 75 : 55;
  }

  // Calculate individual areas with some variance
  const variance = () => Math.floor(Math.random() * 20) - 10;

  const areas = {
    communication: Math.min(100, Math.max(20, baseScore + variance())),
    emotional: Math.min(100, Math.max(20, baseScore + variance())),
    physical: Math.min(100, Math.max(20, baseScore + variance() + 5)),
    longTerm: Math.min(100, Math.max(20, baseScore + variance())),
  };

  const score = Math.round(
    (areas.communication + areas.emotional + areas.physical + areas.longTerm) / 4
  );

  const level: 'high' | 'moderate' | 'challenging' =
    score >= 70 ? 'high' : score >= 50 ? 'moderate' : 'challenging';

  return { score, level, areas };
}

// Get all core numbers for a person
export interface NumerologyProfile {
  lifePath: number;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  birthdayNumber: number;
}

export function calculateFullProfile(
  dob: Date,
  fullName?: string
): NumerologyProfile {
  return {
    lifePath: calculateLifePath(dob),
    expression: fullName ? calculateExpression(fullName) : null,
    soulUrge: fullName ? calculateSoulUrge(fullName) : null,
    personality: fullName ? calculatePersonality(fullName) : null,
    birthdayNumber: calculateBirthdayNumber(dob),
  };
}

// Calculate critical dates for the year based on numerology cycles
export function calculateCriticalDates(dob: Date, lifePath: number): {
  dates: { date: Date; type: string; description: string }[];
  personalYear: number;
} {
  const currentYear = new Date().getFullYear();
  const birthMonth = dob.getMonth();
  const birthDay = dob.getDate();

  // Calculate Personal Year Number
  const personalYearSum = reduceToSingleDigit(birthMonth + 1) +
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(String(currentYear).split('').reduce((sum, d) => sum + parseInt(d), 0));
  const personalYear = reduceToSingleDigit(personalYearSum);

  const dates: { date: Date; type: string; description: string }[] = [];

  // Birthday - always significant
  const birthday = new Date(currentYear, birthMonth, birthDay);
  if (birthday > new Date()) {
    dates.push({
      date: birthday,
      type: 'Personal New Year',
      description: `Your numerological new year begins. A powerful reset aligned with your Life Path ${lifePath}.`,
    });
  }

  // Personal Month peaks (when personal month = life path)
  for (let month = 0; month < 12; month++) {
    const personalMonth = reduceToSingleDigit(personalYear + month + 1);
    if (personalMonth === lifePath) {
      const peakDate = new Date(currentYear, month, 15);
      if (peakDate > new Date()) {
        dates.push({
          date: peakDate,
          type: 'Peak Energy Month',
          description: `Your personal month aligns with your Life Path. Heightened intuition and opportunity.`,
        });
      }
    }
  }

  // Universal day matches (day of month = life path)
  const nextMonth = new Date().getMonth();
  for (let m = nextMonth; m < nextMonth + 3 && m < 12; m++) {
    if (lifePath <= 28) {
      const matchDate = new Date(currentYear, m, lifePath);
      if (matchDate > new Date()) {
        dates.push({
          date: matchDate,
          type: 'Power Day',
          description: `The ${lifePath}th day resonates with your core vibration. Take meaningful action.`,
        });
      }
    }
  }

  // Pinnacle transitions (simplified - using quarters)
  const quarterDates = [
    new Date(currentYear, 2, 20), // Spring equinox
    new Date(currentYear, 5, 21), // Summer solstice
    new Date(currentYear, 8, 22), // Fall equinox
    new Date(currentYear, 11, 21), // Winter solstice
  ];

  quarterDates.forEach((qDate, i) => {
    if (qDate > new Date()) {
      const seasonNames = ['Spring', 'Summer', 'Fall', 'Winter'];
      dates.push({
        date: qDate,
        type: `${seasonNames[i]} Turning Point`,
        description: `A seasonal shift amplifies transitions in your ${personalYear} personal year.`,
      });
    }
  });

  // Sort by date and return top 3
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    dates: dates.slice(0, 3),
    personalYear,
  };
}

// Calculate compatibility critical dates for two people
export function calculateCompatibilityCriticalDates(
  dob1: Date,
  lifePath1: number,
  dob2: Date,
  lifePath2: number
): { date: Date; type: string; description: string }[] {
  const currentYear = new Date().getFullYear();
  const dates: { date: Date; type: string; description: string }[] = [];

  // When personal months align
  const py1 = calculateCriticalDates(dob1, lifePath1).personalYear;
  const py2 = calculateCriticalDates(dob2, lifePath2).personalYear;

  for (let month = 0; month < 12; month++) {
    const pm1 = reduceToSingleDigit(py1 + month + 1);
    const pm2 = reduceToSingleDigit(py2 + month + 1);

    if (pm1 === pm2) {
      const alignDate = new Date(currentYear, month, 15);
      if (alignDate > new Date()) {
        dates.push({
          date: alignDate,
          type: 'Energetic Alignment',
          description: `Both of your personal months vibrate at ${pm1}. A window for deep connection.`,
        });
      }
    }
  }

  // Composite number peaks (sum of life paths reduced)
  const composite = reduceToSingleDigit(lifePath1 + lifePath2);
  if (composite <= 28) {
    for (let m = new Date().getMonth(); m < 12; m++) {
      const compDate = new Date(currentYear, m, composite);
      if (compDate > new Date()) {
        dates.push({
          date: compDate,
          type: 'Relationship Power Day',
          description: `The ${composite}th represents your combined energy. Important decisions favor this day.`,
        });
        break; // Just get the next one
      }
    }
  }

  // Anniversary of meeting (placeholder - would need actual date)
  // Using midpoint between birthdays as symbolic
  const midMonth = Math.floor((dob1.getMonth() + dob2.getMonth()) / 2);
  const midDay = Math.floor((dob1.getDate() + dob2.getDate()) / 2);
  const symbolicDate = new Date(currentYear, midMonth, Math.min(midDay, 28));
  if (symbolicDate > new Date()) {
    dates.push({
      date: symbolicDate,
      type: 'Soul Connection Day',
      description: `A numerologically significant date for your unique bond. Ideal for meaningful conversations.`,
    });
  }

  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  return dates.slice(0, 3);
}

// Format the calculation steps for display
export function getLifePathCalculationSteps(dob: Date): {
  month: { original: number; reduced: number };
  day: { original: number; reduced: number };
  year: { original: number; reduced: number };
  sum: number;
  final: number;
} {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  const year = dob.getFullYear();

  const monthReduced = reduceToSingleDigit(month);
  const dayReduced = reduceToSingleDigit(day);
  const yearSum = String(year).split('').reduce((sum, d) => sum + parseInt(d), 0);
  const yearReduced = reduceToSingleDigit(yearSum);

  const sum = monthReduced + dayReduced + yearReduced;
  const final = reduceToSingleDigit(sum);

  return {
    month: { original: month, reduced: monthReduced },
    day: { original: day, reduced: dayReduced },
    year: { original: year, reduced: yearReduced },
    sum,
    final,
  };
}
