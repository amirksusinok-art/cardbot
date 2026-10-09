import React from 'react';
import { AlbumItem } from '../types.js';
import { triggerHaptic } from '../utils/telegram.js';
import { BookOpen, CheckCircle, Coins, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AlbumsViewProps {
  albums: AlbumItem[];
  onClaim: (key: string) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ albums, onClaim }) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-2 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-gold-400" />
          <span>АЛЬБОМЫ КОЛЛЕКЦИЙ</span>
        </h2>
        <p className="text-xs text-white/50 font-mono">
          Собирайте уникальные сочетания и получайте крупные награды Coins
        </p>
      </div>

      {/* Albums List */}
      <div className="space-y-3.5">
        {albums.map(album => {
          const progressPercent = Math.min(100, (album.current / album.total) * 100);

          return (
            <div
              key={album.key}
              className={`p-4 rounded-2xl border transition-all ${
                album.isClaimed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : album.isCompleted
                  ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-[#10121b] border-white/10'
              }`}
            >
              {/* Top Row: Name & Reward */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    {album.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    {album.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    +{album.rewardCoins}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Counter */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/60">Прогресс альбома:</span>
                  <span className={album.isCompleted ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {album.current} / {album.total}
                  </span>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      album.isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3.5">
                {album.isClaimed ? (
                  <div className="flex items-center justify-center space-x-1.5 py-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" />
                    <span>НАГРАДА ПОЛУЧЕНА</span>
                  </div>
                ) : album.isCompleted ? (
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                      onClaim(album.key);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-98 text-black font-black text-xs font-mono tracking-wider shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ЗАБРАТЬ +{album.rewardCoins} COINS</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center space-x-1.5 py-2 text-xs font-mono text-white/40 bg-white/[0.02] rounded-xl border border-white/5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>В ПРОЦЕССЕ СБОРА</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
