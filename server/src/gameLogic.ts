// Game logic and random generation rules for Black Cards & VIP Plastic

export type BankName = 'Рубарис' | 'Вельтари' | 'Озевия' | 'Верданор' | 'Норвиан';

export type MaterialName =
  | 'Classic Plastic'
  | 'Matte Plastic'
  | 'Gold'
  | 'Black Carbon'
  | 'Titanium'
  | 'Holographic';

export type CategoryName =
  | 'Standard'
  | 'Pair'
  | 'Triple'
  | 'Quad'
  | 'Repeater'
  | 'Straight'
  | 'Mirror';

export interface BankConfig {
  name: BankName;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  slogan: string;
  tagline: string;
}

export const BANKS: Record<BankName, BankConfig> = {
  'Рубарис': {
    name: 'Рубарис',
    colors: {
      primary: '#8a0014',
      secondary: '#1f1a1c',
      accent: '#ff2d55',
      text: '#ffffff',
    },
    slogan: 'Красный, графитовый, металлические акценты',
    tagline: 'Стальной стандарт престижа'
  },
  'Вельтари': {
    name: 'Вельтари',
    colors: {
      primary: '#11101d',
      secondary: '#231e3d',
      accent: '#9d4edd',
      text: '#ffffff',
    },
    slogan: 'Тёмные поверхности, яркая геометрия',
    tagline: 'Геометрия цифровой элиты'
  },
  'Озевия': {
    name: 'Озевия',
    colors: {
      primary: '#0a2540',
      secondary: '#0052cc',
      accent: '#00d4ff',
      text: '#ffffff',
    },
    slogan: 'Синий, белый, прозрачные градиенты',
    tagline: 'Чистый цифровой горизонт'
  },
  'Верданор': {
    name: 'Верданор',
    colors: {
      primary: '#0b3d2e',
      secondary: '#1b5e3f',
      accent: '#2ec4b6',
      text: '#ffffff',
    },
    slogan: 'Изумрудный, серебристый, плавные линии',
    tagline: 'Природная роскошь и серебро'
  },
  'Норвиан': {
    name: 'Норвиан',
    colors: {
      primary: '#0b192c',
      secondary: '#1e3e62',
      accent: '#e0e1dd',
      text: '#ffffff',
    },
    slogan: 'Тёмно-синий, серебро, симметричные узоры',
    tagline: 'Северная крепость надёжности'
  }
};

export const BANK_LIST: BankName[] = ['Рубарис', 'Вельтари', 'Озевия', 'Верданор', 'Норвиан'];

export const MATERIAL_SCORES: Record<MaterialName, number> = {
  'Classic Plastic': 100,
  'Matte Plastic': 250,
  'Gold': 600,
  'Black Carbon': 1000,
  'Titanium': 2000,
  'Holographic': 5000,
};

export const CATEGORY_SCORES: Record<CategoryName, number> = {
  'Standard': 50,
  'Pair': 150,
  'Triple': 400,
  'Repeater': 800,
  'Quad': 1500,
  'Straight': 2500,
  'Mirror': 5000,
};

export interface Probabilities {
  categories: Record<CategoryName, number>;
  materials: Record<MaterialName, number>;
}

// Probabilities for Normal Mint (500 Coins)
export const NORMAL_PROBS: Probabilities = {
  categories: {
    'Standard': 0.70,
    'Pair': 0.16,
    'Triple': 0.06,
    'Repeater': 0.03,
    'Quad': 0.02,
    'Straight': 0.02,
    'Mirror': 0.01,
  },
  materials: {
    'Classic Plastic': 0.45,
    'Matte Plastic': 0.25,
    'Gold': 0.12,
    'Black Carbon': 0.10,
    'Titanium': 0.06,
    'Holographic': 0.02,
  }
};

// Probabilities for "БОМЖ" Free Mint (0 Coins, 30s timer, x0.1 luck)
export const BOMZH_PROBS: Probabilities = {
  categories: {
    'Standard': 0.970,
    'Pair': 0.016,
    'Triple': 0.006,
    'Repeater': 0.003,
    'Quad': 0.002,
    'Straight': 0.002,
    'Mirror': 0.001,
  },
  materials: {
    'Classic Plastic': 0.945,
    'Matte Plastic': 0.025,
    'Gold': 0.012,
    'Black Carbon': 0.010,
    'Titanium': 0.006,
    'Holographic': 0.002,
  }
};

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const r = Math.random();
  let accumulated = 0;
  for (const [key, weight] of Object.entries(weights) as [T, number][]) {
    accumulated += weight;
    if (r <= accumulated) {
      return key;
    }
  }
  return Object.keys(weights)[0] as T;
}

function randomDigits(length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += Math.floor(Math.random() * 10).toString();
  }
  return str;
}

function randomDigitExcept(notAllowed: number[]): number {
  let d: number;
  do {
    d = Math.floor(Math.random() * 10);
  } while (notAllowed.includes(d));
  return d;
}

/**
 * Generate 12 digits (3 blocks of 4) that specifically match the selected category
 */
export function generatePatternNumber(category: CategoryName): {
  cardNumber: string;
  blocks: [string, string, string];
  fullRawNumber: string;
} {
  let b1 = '';
  let b2 = '';
  let b3 = '';

  switch (category) {
    case 'Mirror': {
      // 1221 • 3443 • 5665 OR 1234 • 5665 • 4321
      const style = Math.random() > 0.5 ? 1 : 2;
      if (style === 1) {
        // Each 4-digit block is an abba palindrome
        const d1 = Math.floor(Math.random() * 10);
        const d2 = randomDigitExcept([d1]);
        b1 = `${d1}${d2}${d2}${d1}`;

        const d3 = Math.floor(Math.random() * 10);
        const d4 = randomDigitExcept([d3]);
        b2 = `${d3}${d4}${d4}${d3}`;

        const d5 = Math.floor(Math.random() * 10);
        const d6 = randomDigitExcept([d5]);
        b3 = `${d5}${d6}${d6}${d5}`;
      } else {
        // Overall 12-digit mirror: ABC DEF FED CBA
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 10);
        const d = Math.floor(Math.random() * 10);
        const e = Math.floor(Math.random() * 10);
        const f = Math.floor(Math.random() * 10);
        b1 = `${a}${b}${c}${d}`;
        b2 = `${e}${f}${f}${e}`;
        b3 = `${d}${c}${b}${a}`;
      }
      break;
    }

    case 'Straight': {
      // 1234 • 5678 • 9012 or descending or 3456 • 4567 • 5678
      const start = Math.floor(Math.random() * 10);
      const isAsc = Math.random() > 0.3;
      let digits: number[] = [];
      for (let i = 0; i < 12; i++) {
        const val = isAsc ? (start + i) % 10 : (start - i + 20) % 10;
        digits.push(val);
      }
      b1 = digits.slice(0, 4).join('');
      b2 = digits.slice(4, 8).join('');
      b3 = digits.slice(8, 12).join('');
      break;
    }

    case 'Quad': {
      // At least one block of 4 identical digits: e.g. 8888 3951 6208
      const quadDigit = Math.floor(Math.random() * 10);
      const quadBlock = `${quadDigit}${quadDigit}${quadDigit}${quadDigit}`;
      const blockPos = Math.floor(Math.random() * 3); // 0, 1, or 2

      if (blockPos === 0) {
        b1 = quadBlock;
        b2 = randomDigits(4);
        b3 = randomDigits(4);
      } else if (blockPos === 1) {
        b1 = randomDigits(4);
        b2 = quadBlock;
        b3 = randomDigits(4);
      } else {
        b1 = randomDigits(4);
        b2 = randomDigits(4);
        b3 = quadBlock;
      }
      break;
    }

    case 'Repeater': {
      // e.g. 1212 3434 5656 or 1234 1234 1234
      const style = Math.random() > 0.4 ? 1 : 2;
      if (style === 1) {
        // ABAB CDCD EFEF
        const d1 = Math.floor(Math.random() * 10);
        const d2 = randomDigitExcept([d1]);
        b1 = `${d1}${d2}${d1}${d2}`;

        const d3 = Math.floor(Math.random() * 10);
        const d4 = randomDigitExcept([d3]);
        b2 = `${d3}${d4}${d3}${d4}`;

        const d5 = Math.floor(Math.random() * 10);
        const d6 = randomDigitExcept([d5]);
        b3 = `${d5}${d6}${d5}${d6}`;
      } else {
        // ABCD ABCD ABCD
        const base = randomDigits(4);
        b1 = base;
        b2 = base;
        b3 = base;
      }
      break;
    }

    case 'Triple': {
      // e.g. 7771 3951 6208
      const tripDigit = Math.floor(Math.random() * 10);
      const otherDigit = randomDigitExcept([tripDigit]);
      const tripBlock = Math.random() > 0.5 ? `${tripDigit}${tripDigit}${tripDigit}${otherDigit}` : `${otherDigit}${tripDigit}${tripDigit}${tripDigit}`;
      const blockPos = Math.floor(Math.random() * 3);

      if (blockPos === 0) {
        b1 = tripBlock;
        b2 = randomDigits(4);
        b3 = randomDigits(4);
      } else if (blockPos === 1) {
        b1 = randomDigits(4);
        b2 = tripBlock;
        b3 = randomDigits(4);
      } else {
        b1 = randomDigits(4);
        b2 = randomDigits(4);
        b3 = tripBlock;
      }
      break;
    }

    case 'Pair': {
      // e.g. 1147 3951 6208
      const pairDigit = Math.floor(Math.random() * 10);
      const d1 = randomDigitExcept([pairDigit]);
      const d2 = randomDigitExcept([pairDigit, d1]);
      const pairBlock = `${pairDigit}${pairDigit}${d1}${d2}`;
      b1 = pairBlock;
      b2 = randomDigits(4);
      b3 = randomDigits(4);
      break;
    }

    case 'Standard':
    default: {
      b1 = randomDigits(4);
      b2 = randomDigits(4);
      b3 = randomDigits(4);
      break;
    }
  }

  const cardNumber = `2202 • ${b1} • ${b2} • ${b3}`;
  const fullRawNumber = `2202${b1}${b2}${b3}`;
  return { cardNumber, blocks: [b1, b2, b3], fullRawNumber };
}

/**
 * Generate collection code (e.g. "КОД УЗОРА: 737")
 */
export function generateCollectionCode(): string {
  const code = Math.floor(100 + Math.random() * 900);
  return `КОД УЗОРА: ${code}`;
}

/**
 * Generate expiry date (MM/YYYY) between now and 12/2100
 */
export function generateExpiryDate(): string {
  const currentYear = new Date().getFullYear();
  const maxYear = 2100;
  const year = Math.floor(currentYear + Math.random() * (maxYear - currentYear + 1));
  const month = Math.floor(1 + Math.random() * 12);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  return `${monthStr}/${year}`;
}

/**
 * Mint a complete card given mint mode
 */
export function generateCard(isBomzh: boolean = false) {
  const probs = isBomzh ? BOMZH_PROBS : NORMAL_PROBS;

  // 1. Pick category
  const category = pickWeighted<CategoryName>(probs.categories);

  // 2. Pick material
  const material = pickWeighted<MaterialName>(probs.materials);

  // 3. Pick bank (20% each)
  const bank = BANK_LIST[Math.floor(Math.random() * BANK_LIST.length)];

  // 4. Generate patterned number
  const { cardNumber, blocks, fullRawNumber } = generatePatternNumber(category);

  // 5. Generate code and expiry
  const collectionCode = generateCollectionCode();
  const expiryDate = generateExpiryDate();

  // 6. Calculate collector score
  const score = (MATERIAL_SCORES[material] || 100) + (CATEGORY_SCORES[category] || 50);

  // 7. Determine animation rarity (slow stop & metallic glow for rare)
  const isRare = ['Triple', 'Quad', 'Repeater', 'Straight', 'Mirror'].includes(category) ||
                 ['Gold', 'Black Carbon', 'Titanium', 'Holographic'].includes(material);

  return {
    bank,
    material,
    category,
    cardNumber,
    blocks,
    fullRawNumber,
    collectionCode,
    expiryDate,
    score,
    isRare,
    isBomzh,
  };
}
