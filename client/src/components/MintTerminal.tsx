import React, { useState, useEffect } from 'react';
import { Card, UserProfile, UserStats, CategoryName } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Sparkles, Coins, Zap, Clock, Star, Share2, Crown, ChevronRight, Gift, Layers, ShieldCheck } from 'lucide-react';

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
  onOpenTasks,
  onOpenCollection,
  onToggleFavorite,
  onSetCardOfDay,
  onOpenProfile,
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
      alert('Данные карты скопированы!');
    }
  };

  const isCardOfDay = latestCard && latestCard.id === (user as any).card_of_day_id;
  const catMeta = latestCard ? CATEGORY_META[latestCard.category] : null;

  return (
    <div className="flex flex-col w-full max-w-[440px] mx-auto space-y-4 pb-20 animate-fadeIn">
      {/* 1. ШАПКА (HEADER) — По канонам Revolut / Apple Wallet */}
      <div className="flex items-center justify-between px-1 py-1">
        {/* Слева: Аккуратная аватарка и ник */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 group active:scale-95 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white shadow-sm">
            {user.firstName ? user.firstName[0].toUpperCase() : 'V'}
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block leading-tight group-hover:text-amber-400 transition-colors">
              {user.firstName || user.username}
            </span>
            <span className="text-[10px] font-mono text-[#8E929B] block">
              VIP Collector
            </span>
          </div>
        </button>

        {/* Справа: Плашка баланса — иконка монетки + Coins */}
        <div className="flex items-center space-x-1.5 bg-[#16181D] border border-white/[0.06] px-3.5 py-1.5 rounded-full shadow-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-black text-sm text-white">
            {user.coins.toLocaleString('ru-RU')}
          </span>
          <span className="text-[10px] text-[#8E929B] font-mono">Coins</span>
        </div>
      </div>

      {/* 2. САМА КАРТА (ГЛАВНЫЙ ВИЗУАЛЬНЫЙ ЦЕНТР) */}
      <div className="w-full">
        {latestCard ? (
          <div className="space-y-3">
            <CardPreview
              card={latestCard}
              equippedHolder={user.equippedHolder}
              equippedEffect={user.equippedEffect}
            />

            {/* 3. ИНФОРМАЦИОННЫЙ БЛОК ПОД КАРТОЙ (Легкие виджеты без рамочной таблицы) */}
            
            {/* Статус редкости: Компактный бейдж по центру прямо под картой */}
            <div className="flex justify-center pt-0.5">
              <div className={`px-4 py-1 rounded-full bg-white/[0.04] border text-xs font-mono font-bold flex items-center space-x-2 ${
                catMeta ? catMeta.glow : 'border-white/[0.08] text-white'
              }`}>
                <span>{catMeta ? catMeta.icon : '💳'}</span>
                <span>{catMeta ? catMeta.label : latestCard.category}</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-400 font-extrabold">{latestCard.score.toLocaleString()} PTS</span>
              </div>
            </div>

            {/* Характеристики: 2 аккуратные карточки с прозрачным фоном rgba(255,255,255,0.05) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Карточка 1: Материал */}
              <div className="bg-[#16181D]/80 border border-white/[0.06] rounded-2xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-sm shrink-0">
                  💎
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-[#8E929B] block font-mono">Материал</span>
                  <span className="text-xs font-bold text-white truncate block">{latestCard.material}</span>
                </div>
              </div>

              {/* Карточка 2: Серия/Узор */}
              <div className="bg-[#16181D]/80 border border-white/[0.06] rounded-2xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-sm shrink-0">
                  🔢
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-[#8E929B] block font-mono">Серия узора</span>
                  <span className="text-xs font-bold text-white truncate block">{latestCard.collection_code}</span>
                </div>
              </div>
            </div>

            {/* Кнопки быстрых действий под картой */}
            <div className="flex items-center space-x-2 pt-0.5">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  onSetCardOfDay(latestCard.id);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                  isCardOfDay
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#16181D]/70 border-white/[0.06] text-[#8E929B] hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isCardOfDay ? '✓ Основная' : 'Основная'}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onToggleFavorite(latestCard.id);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                  latestCard.is_favorite
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-[#16181D]/70 border-white/[0.06] text-[#8E929B] hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${latestCard.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{latestCard.is_favorite ? 'В избранном' : 'В избранное'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-10 h-8.5 rounded-xl bg-[#16181D]/70 border border-white/[0.06] flex items-center justify-center text-[#8E929B] hover:text-white active:scale-95 transition-all"
                title="Поделиться"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-[1.586/1] w-full rounded-[18px] border border-dashed border-white/[0.1] bg-[#16181D]/40 flex flex-col items-center justify-center p-6 text-center shadow-xl">
            <Sparkles className="w-10 h-10 text-amber-400/60 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Терминал готов к выпуску</h3>
            <p className="text-xs text-[#8E929B] mt-1 max-w-[240px]">
              Нажмите кнопку ниже, чтобы выпустить свою первую карту!
            </p>
          </div>
        )}
      </div>

      {/* 4. БЛОК ДЕЙЛИКОВ (Мини-баннер вместо широкой полосы) */}
      <button
        onClick={onOpenTasks}
        className="w-full bg-[#16181D] hover:bg-[#1c1f26] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between text-xs font-mono transition-all group active:scale-[0.99]"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
            <Gift className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold">
            Задания дня: <b className="text-amber-400">{stats.completedTasksCount}/{stats.totalTasksCount}</b>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Тонкий прогресс-бар */}
          <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(stats.completedTasksCount / Math.max(1, stats.totalTasksCount)) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-amber-400">
            +500 Coins
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8E929B] group-hover:text-white" />
        </div>
      </button>

      {/* 5. ГЛАВНАЯ КНОПКА ДЕЙСТВИЯ (CTA) — Сочная, насыщенная */}
      <div className="pt-1 space-y-2">
        {canMintNormal ? (
          <button
            onClick={() => {
              triggerHaptic('heavy');
              onMintClick();
            }}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 text-zinc-950 font-black text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          >
            <Zap className="w-5 h-5 fill-zinc-950" />
            <span>ВЫПУСТИТЬ КАРТУ • 500 COINS</span>
          </button>
        ) : (
          /* Бесплатный режим «БОМЖ» */
          <div className="space-y-1.5">
            <button
              onClick={() => {
                if (canMintBomzh) {
                  triggerHaptic('heavy');
                  onMintClick();
                }
              }}
              disabled={isLoading || cooldown > 0}
              className={`w-full h-14 rounded-2xl flex items-center justify-center space-x-2.5 font-black text-sm tracking-wide transition-all ${
                cooldown > 0
                  ? 'bg-[#16181D] border border-white/[0.06] text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] active:scale-[0.98]'
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
          </div>
        )}

        {/* Кликабельная ссылка со склонением */}
        <button
          onClick={onOpenCollection}
          className="w-full py-1 text-center text-xs font-mono text-[#8E929B] hover:text-white transition-colors"
        >
          В коллекции: <b className="text-white underline">{getCardPlural(stats.totalCards)}</b> →
        </button>
      </div>
    </div>
  );
};
