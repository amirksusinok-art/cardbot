import React, { useState } from 'react';
import { UserProfile, Card, LeaderboardUser } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Award, Crown, Star, Trophy, Users, Shield, Sparkles } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  cardOfDay: Card | null;
  favorites: Card[];
  leaderboard: LeaderboardUser[];
  onOpenCard: (card: Card) => void;
}

export function getRankTitle(score: number): string {
  if (score >= 15000) return 'Легендарный Магнат';
  if (score >= 8000) return 'Титановый VIP';
  if (score >= 4000) return 'Золотой Коллекционер';
  if (score >= 1500) return 'Опытный Ценитель';
  return 'Начинающий Коллекционер';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  cardOfDay,
  favorites,
  leaderboard,
  onOpenCard,
}) => {
  const [tab, setTab] = useState<'profile' | 'leaderboard'>('profile');

  const totalScore = favorites.reduce((sum, c) => sum + c.score, 0) + (cardOfDay?.score || 0);
  const rank = getRankTitle(totalScore);

  const isFrameEquipped = user.equippedFrame === 'frame_gold' || user.equippedFrame === 'bundle_deluxe';

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-2 animate-fadeIn">
      {/* Switcher Tab */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => {
            triggerHaptic('light');
            setTab('profile');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            tab === 'profile'
              ? 'bg-white text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          МОЙ ПРОФИЛЬ
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setTab('leaderboard');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 ${
            tab === 'leaderboard'
              ? 'bg-gold-400 text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>РЕЙТИНГ ДРУЗЕЙ</span>
        </button>
      </div>

      {tab === 'profile' ? (
        <div className="space-y-4">
          {/* User Card Header */}
          <div className="bg-[#10121b] border border-white/10 rounded-3xl p-5 flex items-center space-x-4 shadow-xl">
            {/* Avatar with optional frame */}
            <div
              className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black font-black text-2xl shadow-lg shrink-0 ${
                isFrameEquipped ? 'frame-gold-glow' : 'border-2 border-white/20'
              }`}
            >
              {user.firstName ? user.firstName[0].toUpperCase() : 'V'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <Crown className="w-4 h-4 text-gold-400" />
                <h2 className="text-lg font-black text-white">{user.firstName}</h2>
              </div>
              <p className="text-xs font-mono text-white/50">@{user.username}</p>
              <div className="inline-block bg-gold-400/10 border border-gold-400/30 px-2 py-0.5 rounded-full text-[10px] font-mono text-gold-300 font-bold">
                {rank}
              </div>
            </div>
          </div>

          {/* Card of the Day («КАРТА ДНЯ») */}
          {cardOfDay && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gold-400 font-bold px-1">
                <Star className="w-3.5 h-3.5 fill-gold-400" />
                <span>КАРТА ДНЯ (ЗАКРЕПЛЕНО)</span>
              </div>
              <CardPreview
                card={cardOfDay}
                equippedHolder={user.equippedHolder}
                equippedEffect={user.equippedEffect}
                onClick={() => onOpenCard(cardOfDay)}
              />
            </div>
          )}

          {/* Favorites Showcase */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1">
              <span>ВИТРИНА ИЗБРАННЫХ КАРТ ({favorites.length}/5):</span>
            </div>

            {favorites.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                <p className="text-xs font-mono text-white/40">
                  Вы ещё не добавили карты в избранное. Нажмите ⭐ в коллекции!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map(c => (
                  <CardPreview
                    key={c.id}
                    card={c}
                    equippedHolder={user.equippedHolder}
                    equippedEffect={user.equippedEffect}
                    onClick={() => onOpenCard(c)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Leaderboard Tab */
        <div className="space-y-2">
          <div className="text-xs font-mono text-white/50 px-1 mb-2">
            Топ коллекционеров формируется по суммарному рейтингу карт:
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-white/40 bg-white/[0.02] rounded-2xl border border-white/10">
              Список лидеров обновляется...
            </div>
          ) : (
            leaderboard.map((item, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={item.telegram_id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isFirst
                      ? 'bg-amber-950/40 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : isSecond
                      ? 'bg-slate-900/60 border-slate-400/40'
                      : isThird
                      ? 'bg-yellow-950/30 border-yellow-700/40'
                      : 'bg-[#10121b] border-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 text-center font-mono font-black text-sm ${
                        isFirst
                          ? 'text-yellow-400'
                          : isSecond
                          ? 'text-slate-300'
                          : isThird
                          ? 'text-amber-500'
                          : 'text-white/40'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {item.first_name || item.username}
                      </h4>
                      <span className="text-[10px] font-mono text-white/50">
                        Карт: {item.card_count} шт.
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs sm:text-sm text-gold-400">
                      {item.total_score.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
