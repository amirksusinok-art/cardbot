import React, { useState, useEffect } from 'react';
import { Card, UserProfile, UserStats } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Sparkles, Coins, Zap, Clock, Star, Share2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MintTerminalProps {
  user: UserProfile;
  stats: UserStats;
  latestCard: Card | null;
  onMintClick: () => void;
  onOpenTasks: () => void;
  onOpenCollection: () => void;
  onToggleFavorite: (cardId: string) => void;
  isLoading: boolean;
}

export const MintTerminal: React.FC<MintTerminalProps> = ({
  user,
  stats,
  latestCard,
  onMintClick,
  onOpenTasks,
  onOpenCollection,
  onToggleFavorite,
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

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Top Status & Tasks Banner */}
      <div className="w-full flex items-center justify-between px-2 pt-1">
        {/* Coins pill */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-950/60 to-black/80 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-black text-amber-400 text-sm">
            {user.coins.toLocaleString()}
          </span>
          <span className="text-[10px] text-white/50 font-mono">COINS</span>
        </div>

        {/* Tasks progress widget */}
        <button
          onClick={onOpenTasks}
          className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 px-3.5 py-1.5 rounded-full transition-all text-xs font-mono"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80">
            Задания: <b className="text-white">{stats.completedTasksCount}/{stats.totalTasksCount}</b>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
        </button>
      </div>

      {/* Main Terminal Card Display */}
      <div className="w-full px-2">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase">
            {latestCard ? 'ПОСЛЕДНЯЯ ВЫПУЩЕННАЯ КАРТА' : 'ВИРТУАЛЬНЫЙ ТЕРМИНАЛ'}
          </span>
        </div>

        {latestCard ? (
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <CardPreview
              card={latestCard}
              equippedHolder={user.equippedHolder}
              equippedEffect={user.equippedEffect}
            />

            {/* Quick Actions for Latest Card */}
            <div className="flex items-center justify-between mt-3 px-2">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onToggleFavorite(latestCard.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                  latestCard.is_favorite
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${latestCard.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{latestCard.is_favorite ? 'В избранном' : 'В избранное'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-[1.586/1] w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-10 h-10 text-gold-400/50 mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-white/90">Терминал готов к генерации</h3>
            <p className="text-xs text-white/50 mt-1 max-w-[240px]">
              Нажмите кнопку ниже, чтобы запустить вертикальную прокрутку цифр и выпустить карту.
            </p>
          </div>
        )}
      </div>

      {/* Generation Control Section */}
      <div className="w-full px-2 space-y-3">
        {canMintNormal ? (
          /* Normal Mint: 500 Coins */
          <button
            onClick={() => {
              triggerHaptic('heavy');
              onMintClick();
            }}
            disabled={isLoading}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-[1px] shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98]"
          >
            <div className="relative flex items-center justify-center space-x-3 rounded-2xl bg-black px-6 py-4 transition-all group-hover:bg-black/90">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div className="flex flex-col items-center">
                <span className="font-black text-base sm:text-lg tracking-wider text-amber-300">
                  ВЫПУСТИТЬ КАРТУ
                </span>
                <span className="text-[11px] font-mono text-amber-400/70">
                  СТОИМОСТЬ: 500 COINS
                </span>
              </div>
            </div>
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        ) : (
          /* BOMZH Mode: 0 Coins, 30s timer */
          <div className="space-y-2">
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <b className="text-rose-300">Баланс меньше 500 Coins</b>
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  Активирован бесплатный режим «БОМЖ»! Выпуск доступен каждые 30 секунд (коэффициент удачи ×0,1).
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
              className={`w-full relative overflow-hidden rounded-2xl p-4 flex items-center justify-center space-x-3 font-bold transition-all ${
                cooldown > 0
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)] active:scale-[0.98]'
              }`}
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span className="font-mono tracking-wider">
                    ПЕРЕЗАРЯДКА: {cooldown} СЕК
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  <span className="tracking-wider">
                    БЕСПЛАТНЫЙ РЕЖИМ «БОМЖ» (0 COINS)
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* View Collection Link */}
        <button
          onClick={onOpenCollection}
          className="w-full py-2.5 text-center text-xs font-mono text-white/50 hover:text-white transition-colors"
        >
          У вас в коллекции: <b className="text-white underline">{stats.totalCards} карт</b> →
        </button>
      </div>
    </div>
  );
};
