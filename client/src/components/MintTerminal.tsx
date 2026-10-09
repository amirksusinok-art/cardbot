import React, { useState, useEffect } from 'react';
import { Card, UserProfile, UserStats } from '../types.js';
import { CardPreview, CATEGORY_COLORS } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Sparkles, Coins, Zap, Clock, Star, Share2, Crown, ChevronRight, Menu, AlertCircle } from 'lucide-react';

interface MintTerminalProps {
  user: UserProfile;
  stats: UserStats;
  latestCard: Card | null;
  onMintClick: () => void;
  onOpenTasks: () => void;
  onOpenCollection: () => void;
  onToggleFavorite: (cardId: string) => void;
  onSetCardOfDay: (cardId: string) => void;
  onOpenMenu: () => void;
  isLoading: boolean;
}

function getCardPlural(count: number): string {
  const c = Math.abs(count) % 100;
  const n = c % 10;
  if (c > 10 && c < 20) return `${count} карт`;
  if (n > 1 && n < 5) return `${count} карты`;
  if (n === 1) return `${count} карта`;
  return `${count} карт`;
}

export const MintTerminal: React.FC<MintTerminalProps> = ({
  user,
  stats,
  latestCard,
  onMintClick,
  onOpenTasks,
  onOpenCollection,
  onToggleFavorite,
  onSetCardOfDay,
  onOpenMenu,
  isLoading,
}) => {
  const [cooldown, setCooldown] = useState(stats.bomzhCooldownRemaining);

  useEffect(() => {
    setCooldown(stats.bomzhCooldownRemaining);
  }, [stats.bomzhCooldownRemaining]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const canMintNormal = user.coins >= 500;
  const canMintBomzh = user.coins < 500 && cooldown === 0;

  const handleShare = () => {
    if (!latestCard) return;
    triggerHaptic('light');
    const shareText = `💳 Смотри какую карту я выбил в Black Cards!\nБанк: ${latestCard.bank}\nМатериал: ${latestCard.material}\nКатегория: ${latestCard.category}\nНомер: ${latestCard.card_number}\nРейтинг: ${latestCard.score} PTS!`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=https://t.me&text=${encodeURIComponent(shareText)}`
      );
    } else if (navigator.share) {
      navigator.share({ title: 'Black Cards & VIP Plastic', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Данные карты скопированы в буфер обмена!');
    }
  };

  const isCardOfDay = latestCard && latestCard.id === (user as any).card_of_day_id;
  const catColor = latestCard ? CATEGORY_COLORS[latestCard.category] : null;

  return (
    <div className="flex flex-col w-full max-w-[430px] mx-auto space-y-4 pb-24 animate-fadeIn">
      {/* 1. TOP HEADER (Like in reference photo) */}
      <div className="flex items-center justify-between px-1 pt-1">
        {/* Left: Menu Burger + Avatar + Level Badge */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenMenu();
            }}
            className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5 text-zinc-300" />
          </button>

          {/* Level Pill Widget */}
          <div className="flex items-center space-x-2 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-2xl shadow-sm">
            <span className="font-bold text-xs text-white">Ур. 1</span>
            <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-3/5 h-full bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right: Big Crisp Balance (Like "158 045 ₽" on photo) */}
        <div className="flex items-center space-x-2 text-right">
          <span className="font-mono font-black text-xl sm:text-2xl text-white tracking-tight">
            {user.coins.toLocaleString('ru-RU')}
          </span>
          <Coins className="w-5 h-5 text-amber-400 shrink-0" />
        </div>
      </div>

      {/* 2. PHYSICAL CARD OBJECT (Like in reference photo) */}
      <div className="w-full pt-1">
        {latestCard ? (
          <div className="space-y-3">
            <CardPreview
              card={latestCard}
              equippedHolder={user.equippedHolder}
              equippedEffect={user.equippedEffect}
            />

            {/* Spec Row below Card (Like in reference photo) */}
            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-zinc-400 text-center py-0.5">
              <span className={`font-bold ${catColor ? catColor.text : 'text-emerald-400'}`}>
                {catColor ? catColor.label : latestCard.category}
              </span>
              <span>•</span>
              <span>оценка <b>{latestCard.score.toLocaleString()} PTS</b></span>
              <span>•</span>
              <span className="text-zinc-500">тираж ∞</span>
            </div>

            {/* Row of Pill Action Buttons (Like in reference photo) */}
            <div className="flex items-center justify-center space-x-2 pt-0.5">
              {/* Primary / Card of Day button */}
              <button
                onClick={() => {
                  triggerHaptic('success');
                  onSetCardOfDay(latestCard.id);
                }}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold border transition-all text-center ${
                  isCardOfDay
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {isCardOfDay ? '✓ Основная' : 'Основная'}
              </button>

              {/* Favorite button */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onToggleFavorite(latestCard.id);
                }}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold border transition-all text-center ${
                  latestCard.is_favorite
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {latestCard.is_favorite ? '★ Избранная' : 'В избранное'}
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-all"
                title="Поделиться"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-[1.586/1] w-full rounded-[22px] border border-dashed border-white/20 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center shadow-xl">
            <Sparkles className="w-10 h-10 text-gold-400 mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-white">Терминал готов к генерации</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
              Нажмите кнопку внизу, чтобы выпустить свою первую карту!
            </p>
          </div>
        )}
      </div>

      {/* 3. BENTO INFO CARDS (2 Columns, like in reference photo) */}
      {latestCard && (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Bento Box 1: Bank */}
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Банк</span>
            <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
              <span>🏛️</span>
              <span className="truncate">{latestCard.bank}</span>
            </div>
          </div>

          {/* Bento Box 2: Material */}
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block">Материал</span>
            <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
              <span>💎</span>
              <span className="truncate">{latestCard.material}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TASKS MINI INDICATOR */}
      <button
        onClick={onOpenTasks}
        className="w-full bg-zinc-900/70 hover:bg-zinc-900 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono transition-all"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300">
            Задания дня: <b className="text-white">{stats.completedTasksCount}/{stats.totalTasksCount}</b>
          </span>
        </div>
        <span className="text-amber-400 font-bold flex items-center space-x-1">
          <span>Награда до +500 Coins</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </button>

      {/* 5. BOTTOM PRIMARY CTA BUTTON (The exact style from reference photo!) */}
      <div className="pt-2 space-y-2">
        {canMintNormal ? (
          /* Normal Mint: White/Gold High-Contrast Rounded Pill Button */
          <button
            onClick={() => {
              triggerHaptic('heavy');
              onMintClick();
            }}
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-white hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center justify-between px-6 shadow-[0_10px_25px_rgba(255,255,255,0.15)] group"
          >
            <div className="flex items-center space-x-2 text-zinc-950 font-black text-base sm:text-lg">
              <Zap className="w-5 h-5 text-zinc-950 fill-zinc-950" />
              <span>{latestCard ? 'Выпустить ещё' : 'Выпустить карту'}</span>
            </div>

            <div className="flex items-center space-x-1.5 font-mono font-black text-sm sm:text-base text-zinc-900">
              <span>500 Coins</span>
            </div>
          </button>
        ) : (
          /* BOMZH Mode Button: When Coins < 500 */
          <div className="space-y-2">
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <b className="text-rose-300">Баланс меньше 500 Coins</b>
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  Активирован бесплатный режим «БОМЖ» (0 Coins каждые 30 секунд).
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (canMintBomzh) {
                  triggerHaptic('heavy');
                  onMintClick();
                }
              }}
              disabled={isLoading || cooldown > 0}
              className={`w-full h-14 rounded-full flex items-center justify-between px-6 font-bold transition-all ${
                cooldown > 0
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_10px_25px_rgba(225,29,72,0.3)] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center space-x-2 font-black text-sm sm:text-base">
                {cooldown > 0 ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Перезарядка...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Выпустить бесплатно</span>
                  </>
                )}
              </div>

              <div className="font-mono font-black text-sm">
                {cooldown > 0 ? `${cooldown} сек.` : '0 Coins'}
              </div>
            </button>
          </div>
        )}

        {/* Collection Counter Link with correct Russian pluralization */}
        <button
          onClick={onOpenCollection}
          className="w-full py-1 text-center text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          У вас в коллекции: <b className="text-white underline">{getCardPlural(stats.totalCards)}</b> →
        </button>
      </div>
    </div>
  );
};
