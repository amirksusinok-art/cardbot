import React, { useState, useEffect } from 'react';
import { Card, UserProfile, UserStats, CategoryName } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Coins, Zap, Clock, Star, Share2, Crown, Menu, Sparkles } from 'lucide-react';

interface MintTerminalProps {
  user: UserProfile;
  stats: UserStats;
  latestCard: Card | null;
  onMintClick: () => void;
  onOpenTasks: () => void;
  onOpenCollection: () => void;
  onToggleFavorite: (cardId: string) => void;
  onSetCardOfDay: (cardId: string) => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  isLoading: boolean;
}

export const CATEGORY_META: Record<CategoryName, { icon: string; label: string; glow: string }> = {
  'Standard': { icon: '💳', label: 'Стандарт', glow: 'text-zinc-300 border-white/[0.08]' },
  'Pair': { icon: '✨', label: 'Пара', glow: 'text-blue-300 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]' },
  'Triple': { icon: '⚡', label: 'Тройка', glow: 'text-emerald-300 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' },
  'Repeater': { icon: '🔁', label: 'Повтор', glow: 'text-amber-300 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' },
  'Quad': { icon: '🔥', label: 'Каре', glow: 'text-purple-300 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  'Straight': { icon: '📈', label: 'Стрит', glow: 'text-cyan-300 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  'Mirror': { icon: '🪞', label: 'Зеркало', glow: 'text-rose-300 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.25)]' },
};

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
  onOpenCollection,
  onToggleFavorite,
  onSetCardOfDay,
  onOpenProfile,
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
      alert('Данные карты скопированы в буфер!');
    }
  };

  const isCardOfDay = latestCard && latestCard.id === (user as any).card_of_day_id;
  const catMeta = latestCard ? CATEGORY_META[latestCard.category] : null;

  return (
    <div className="flex flex-col w-full max-w-[420px] mx-auto min-h-[calc(100vh-96px)] justify-between pb-20 pt-1 animate-fadeIn">
      {/* 1. ВЕРХНЯЯ ШАПКА: Меню, Профиль и Баланс Coins */}
      <div className="flex items-center justify-between py-2 px-1">
        {/* Слева: Кнопка Меню и Профиль */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenMenu();
            }}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white active:scale-95 transition-all"
            title="Меню"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenProfile();
            }}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] active:scale-95 transition-all text-left"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-[11px] text-zinc-950 shadow-sm">
              {user.firstName ? user.firstName[0].toUpperCase() : 'V'}
            </div>
            <span className="font-bold text-xs text-white max-w-[110px] truncate">
              {user.firstName || user.username}
            </span>
          </button>
        </div>

        {/* Справа: Баланс игровых Coins */}
        <div className="flex items-center space-x-1.5 bg-[#16181D] border border-white/[0.08] px-3.5 py-1.5 rounded-full shadow-sm">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-mono font-black text-sm text-white">
            {user.coins.toLocaleString('ru-RU')}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Coins</span>
        </div>
      </div>

      {/* 2. ЦЕНТР: САМА КАРТА И ЛЕГКАЯ СТРОКА ДЕЙСТВИЙ */}
      <div className="my-auto py-2 space-y-3">
        {latestCard ? (
          <>
            <CardPreview
              card={latestCard}
              equippedHolder={user.equippedHolder}
              equippedEffect={user.equippedEffect}
            />

            {/* Компактная панель прямо под картой: Категория/Очки слева + Кнопки справа */}
            <div className="flex items-center justify-between px-1 pt-1">
              {/* Бейдж категории и рейтинга */}
              <div
                className={`px-3 py-1.5 rounded-xl bg-white/[0.04] border text-xs font-mono font-bold flex items-center space-x-1.5 ${
                  catMeta ? catMeta.glow : 'border-white/[0.08] text-white'
                }`}
              >
                <span>{catMeta ? catMeta.icon : '💳'}</span>
                <span>{catMeta ? catMeta.label : latestCard.category}</span>
                <span className="text-white/30">•</span>
                <span className="text-amber-400 font-extrabold">{latestCard.score.toLocaleString()} PTS</span>
              </div>

              {/* Быстрые действия: Основная, Избранное, Поделиться */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    triggerHaptic('success');
                    onSetCardOfDay(latestCard.id);
                  }}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    isCardOfDay
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                  title={isCardOfDay ? 'Основная карта' : 'Сделать основной'}
                >
                  <Crown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    onToggleFavorite(latestCard.id);
                  }}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    latestCard.is_favorite
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                  title="В избранное"
                >
                  <Star className={`w-4 h-4 ${latestCard.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white active:scale-95 transition-all"
                  title="Поделиться"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-[1.586/1] w-full rounded-[18px] border border-dashed border-white/[0.12] bg-[#12141A] flex flex-col items-center justify-center p-6 text-center shadow-xl">
            <Sparkles className="w-10 h-10 text-amber-400/70 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">Терминал готов к выпуску</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
              Нажмите кнопку ниже, чтобы сгенерировать новую виртуальную карту!
            </p>
          </div>
        )}
      </div>

      {/* 3. НИЗ: ГЛАВНАЯ КНОПКА ВЫПУСКА И ССЫЛКА НА КОЛЛЕКЦИЮ */}
      <div className="pt-2 space-y-2.5 px-1">
        {canMintNormal ? (
          <button
            onClick={() => {
              triggerHaptic('heavy');
              onMintClick();
            }}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-zinc-950 font-black text-sm tracking-wide shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
          >
            <Zap className="w-5 h-5 fill-zinc-950" />
            <span>ВЫПУСТИТЬ КАРТУ • 500 COINS</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (canMintBomzh) {
                triggerHaptic('heavy');
                onMintClick();
              }
            }}
            disabled={isLoading || cooldown > 0}
            className={`w-full h-14 rounded-2xl flex items-center justify-center space-x-2 font-black text-sm tracking-wide transition-all ${
              cooldown > 0
                ? 'bg-[#16181D] border border-white/[0.06] text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_4px_20px_rgba(225,29,72,0.3)] active:scale-[0.98]'
            }`}
          >
            {cooldown > 0 ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-zinc-500" />
                <span>ПЕРЕЗАРЯДКА: {cooldown} СЕК.</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>РЕЖИМ «БОМЖ» • 0 COINS</span>
              </>
            )}
          </button>
        )}

        {/* Ссылка на коллекцию со склонением */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenCollection();
          }}
          className="w-full py-1 text-center text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          В коллекции: <span className="text-white font-bold underline underline-offset-2">{getCardPlural(stats.totalCards)}</span> →
        </button>
      </div>
    </div>
  );
};
