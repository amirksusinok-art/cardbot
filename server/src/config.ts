import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  INITIAL_COINS: 1500,
  MINT_COST: 500,
  BOMZH_COOLDOWN_SECONDS: 30,
};

export interface CosmeticItem {
  key: string;
  type: 'holder' | 'frame' | 'effect' | 'bg' | 'bundle';
  name: string;
  description: string;
  priceStars: number;
  previewUrl?: string;
  styleClass: string;
}

export const COSMETICS_CATALOG: Record<string, CosmeticItem> = {
  holder_vip: {
    key: 'holder_vip',
    type: 'holder',
    name: 'VIP Холдер',
    description: 'Глянцевый защитный акриловый холдер с золотым тиснением и скошенными гранями',
    priceStars: 5,
    styleClass: 'holder-vip-acrylic',
  },
  frame_gold: {
    key: 'frame_gold',
    type: 'frame',
    name: 'Золотая рамка профиля',
    description: 'Сияющая анимированная рамка для аватара и витрины коллекционера',
    priceStars: 10,
    styleClass: 'frame-gold-glow',
  },
  effect_matrix: {
    key: 'effect_matrix',
    type: 'effect',
    name: 'Неоновый эффект цифр',
    description: 'Ультрафиолетовое неоновое свечение и кибер-следы при вращении цифр',
    priceStars: 10,
    styleClass: 'effect-cyber-neon',
  },
  bg_cyber: {
    key: 'bg_cyber',
    type: 'bg',
    name: 'Фон «Cyber Vault»',
    description: 'Роскошный тёмный интерьер закрытого хранилища с плавающими частицами',
    priceStars: 15,
    styleClass: 'bg-cyber-vault',
  },
  bundle_deluxe: {
    key: 'bundle_deluxe',
    type: 'bundle',
    name: 'Комплект «Black VIP»',
    description: 'Полный косметический набор: VIP Холдер + Золотая рамка + Неоновый эффект + Cyber Vault со скидкой!',
    priceStars: 25,
    styleClass: 'bundle-deluxe-pack',
  },
};

export interface AlbumConfig {
  key: string;
  name: string;
  description: string;
  rewardCoins: number;
  check: (cards: any[]) => { current: number; total: number; isCompleted: boolean };
}

export const ALBUMS_CONFIG: AlbumConfig[] = [
  {
    key: 'all_banks',
    name: 'Конгломерат 5 банков',
    description: 'Соберите хотя бы по одной карте каждого из пяти банков: Рубарис, Вельтари, Озевия, Верданор, Норвиан.',
    rewardCoins: 300,
    check: (cards) => {
      const banks = new Set(cards.map(c => c.bank));
      const required = ['Рубарис', 'Вельтари', 'Озевия', 'Верданор', 'Норвиан'];
      let count = 0;
      for (const b of required) {
        if (banks.has(b)) count++;
      }
      return { current: count, total: 5, isCompleted: count >= 5 };
    }
  },
  {
    key: 'all_materials',
    name: 'Мастер материалов',
    description: 'Соберите все 6 видов материалов: Classic, Matte, Gold, Carbon, Titanium, Holographic.',
    rewardCoins: 800,
    check: (cards) => {
      const mats = new Set(cards.map(c => c.material));
      const required = ['Classic Plastic', 'Matte Plastic', 'Gold', 'Black Carbon', 'Titanium', 'Holographic'];
      let count = 0;
      for (const m of required) {
        if (mats.has(m)) count++;
      }
      return { current: count, total: 6, isCompleted: count >= 6 };
    }
  },
  {
    key: 'rare_numbers',
    name: 'Клуб красивых номеров',
    description: 'Соберите 5 нестандартных категорий номеров: Pair, Triple, Repeater, Quad, Straight или Mirror.',
    rewardCoins: 1200,
    check: (cards) => {
      const cats = new Set(cards.map(c => c.category));
      const required = ['Pair', 'Triple', 'Repeater', 'Quad', 'Straight', 'Mirror'];
      let count = 0;
      for (const c of required) {
        if (cats.has(c)) count++;
      }
      return { current: count, total: 6, isCompleted: count >= 5 };
    }
  },
  {
    key: 'titan_club',
    name: 'Высшая лига',
    description: 'Соберите обе легендарные карты: Titanium и мифический Holographic.',
    rewardCoins: 2000,
    check: (cards) => {
      const mats = new Set(cards.map(c => c.material));
      let count = 0;
      if (mats.has('Titanium')) count++;
      if (mats.has('Holographic')) count++;
      return { current: count, total: 2, isCompleted: count >= 2 };
    }
  }
];
