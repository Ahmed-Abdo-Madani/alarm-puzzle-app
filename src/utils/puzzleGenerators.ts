import { DifficultyLevel } from '../types/alarm';

export interface MathProblem {
  question: string;
  answer: number;
}

export const generateMathProblem = (difficulty: DifficultyLevel): MathProblem => {
  let num1, num2, num3;
  
  switch (difficulty) {
    case DifficultyLevel.EASY:
      // Single-digit addition/subtraction
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
      if (Math.random() > 0.5) {
        return { question: `${num1} + ${num2}`, answer: num1 + num2 };
      } else {
        // Ensure positive result for subtraction
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        return { question: `${max} - ${min}`, answer: max - min };
      }
      
    case DifficultyLevel.MEDIUM:
      // Two-digit addition/subtraction/multiplication
      if (Math.random() < 0.33) {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;
        return { question: `${num1} + ${num2}`, answer: num1 + num2 };
      } else if (Math.random() < 0.66) {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        return { question: `${max} - ${min}`, answer: max - min };
      } else {
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        return { question: `${num1} × ${num2}`, answer: num1 * num2 };
      }
      
    case DifficultyLevel.HARD:
      // Multi-step operations
      num1 = Math.floor(Math.random() * 20) + 5;
      num2 = Math.floor(Math.random() * 10) + 2;
      num3 = Math.floor(Math.random() * 5) + 2;
      
      if (Math.random() > 0.5) {
        return { 
          question: `(${num1} + ${num2}) × ${num3}`, 
          answer: (num1 + num2) * num3 
        };
      } else {
        return { 
          question: `${num1} + ${num2} × ${num3}`, 
          answer: num1 + (num2 * num3) 
        };
      }
      
    default:
      return { question: "1 + 1", answer: 2 };
  }
};

const ENGLISH_PHRASES = {
  [DifficultyLevel.EASY]: [
    "The sun is shining",
    "Hello world today",
    "Keep moving forward",
    "Time to wake up",
    "Good morning friend"
  ],
  [DifficultyLevel.MEDIUM]: [
    "The quick brown fox jumps over the lazy dog",
    "Success is not final, failure is not fatal",
    "Believe you can and you are halfway there",
    "Every moment is a fresh beginning"
  ],
  [DifficultyLevel.HARD]: [
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
    "In the end, it's not the years in your life that count. It's the life in your years."
  ]
};

const ARABIC_PHRASES = {
  [DifficultyLevel.EASY]: [
    "الشمس مشرقة اليوم",
    "صباح الخير يا صديقي",
    "وقت الاستيقاظ الآن",
    "استمر في التقدم",
    "مرحبا بك اليوم"
  ],
  [DifficultyLevel.MEDIUM]: [
    "الوقت كالسيف إن لم تقطعه قطعك",
    "من جد وجد ومن زرع حصد",
    "العلم نور والجهل ظلام دامس",
    "الصبر مفتاح الفرج والنجاح"
  ],
  [DifficultyLevel.HARD]: [
    "لا تؤجل عمل اليوم إلى الغد، فربما يأتي الغد وأنت غير قادر على العمل.",
    "اطلب العلم من المهد إلى اللحد، فالعلم لا ينتهي عند حد معين.",
    "القناعة كنز لا يفنى، والعزلة عن الناس راحة من شرورهم."
  ]
};

export const generateTypingPhrase = (language: 'en' | 'ar', difficulty: DifficultyLevel): string => {
  const phrases = language === 'ar' ? ARABIC_PHRASES : ENGLISH_PHRASES;
  const list = phrases[difficulty];
  return list[Math.floor(Math.random() * list.length)];
};

export const calculateTypingAccuracy = (input: string, target: string): number => {
  if (!input || !target) return 0;
  
  // Simple Levenshtein distance implementation
  const a = input.trim();
  const b = target.trim();
  
  if (a.length === 0) return 0;
  if (b.length === 0) return 0;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
};

export interface MemoryCard {
  id: string;
  value: string;
  matched: boolean;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];

export const generateMemoryCards = (difficulty: DifficultyLevel): MemoryCard[] => {
  let pairCount;
  switch (difficulty) {
    case DifficultyLevel.EASY:
      pairCount = 3;
      break;
    case DifficultyLevel.MEDIUM:
      pairCount = 6;
      break;
    case DifficultyLevel.HARD:
      pairCount = 8;
      break;
    default:
      pairCount = 3;
  }
  
  const selectedEmojis = EMOJIS.slice(0, pairCount);
  const cards: MemoryCard[] = [];
  
  selectedEmojis.forEach((emoji, index) => {
    // Add pair
    cards.push({
      id: `card-${index}-a`,
      value: emoji,
      matched: false
    });
    cards.push({
      id: `card-${index}-b`,
      value: emoji,
      matched: false
    });
  });
  
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
};
