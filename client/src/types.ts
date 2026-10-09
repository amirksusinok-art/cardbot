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

export interface Card {
  id: string;
  user_id?: number;
  card_number: string;
  collection_code: string;
  expiry_date: string;
  bank: BankName;
  material: MaterialName;
  category: CategoryName;
  score: number;
  is_favorite: number | boolean;
  is_bomzh?: number | boolean;
  created_at: number;
  // Animation helper
  blocks?: [string, string, string];
  isRare?: boolean;
}

export interface UserProfile {
  telegramId: number;
  username: string;
  firstName: string;
  coins: number;
  equippedHolder?: string | null;
  equippedFrame?: string | null;
  equippedEffect?: string | null;
  equippedBg?: string | null;
}

export interface UserStats {
  totalCards: number;
  completedTasksCount: number;
  totalTasksCount: number;
  bomzhCooldownRemaining: number;
  canBomzhMint: boolean;
}

export interface TaskItem {
  id: string;
  task_key: string;
  title: string;
  reward_coins: number;
  progress: number;
  target: number;
  is_claimed: number;
}

export interface AlbumItem {
  key: string;
  name: string;
  description: string;
  rewardCoins: number;
  current: number;
  total: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface CosmeticItem {
  key: string;
  type: 'holder' | 'frame' | 'effect' | 'bg' | 'bundle';
  name: string;
  description: string;
  priceStars: number;
  styleClass: string;
  isOwned?: boolean;
  isEquipped?: boolean;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount_coins: number;
  amount_stars: number;
  description: string;
  created_at: number;
}

export interface LeaderboardUser {
  telegram_id: number;
  username: string;
  first_name: string;
  equipped_frame?: string | null;
  card_count: number;
  total_score: number;
}
