import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../types.js';
import { triggerHaptic } from '../utils/telegram.js';
import { FastForward, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReelAnimationProps {
  card: Card;
  isRare: boolean;
  equippedEffect?: string | null;
  onFinish: () => void;
}

export const ReelAnimation: React.FC<ReelAnimationProps> = ({
  card,
  isRare,
  equippedEffect,
  onFinish,
}) => {
  // Extract the 12 digits after 2202
  const rawDigits = card.card_number.replace(/[^0-9]/g, '').slice(4); // 12 digits
  const targetDigits = rawDigits.split('').map(d => parseInt(d, 10));

  // Current displayed digit for each of the 12 reels
  const [currentDigits, setCurrentDigits] = useState<number[]>(() =>
    Array(12).fill(0).map(() => Math.floor(Math.random() * 10))
  );

  // Status for each reel: whether it has locked onto its target
  const [stoppedReels, setStoppedReels] = useState<boolean[]>(Array(12).fill(false));
  const [allFinished, setAllFinished] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Tuning timing: rare cards spin longer and slow down dramatically
  const baseSpinDuration = isRare ? 2800 : 1600;
  const reelDelay = isRare ? 180 : 110;

  useEffect(() => {
    let active = true;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      setCurrentDigits(prev =>
        prev.map((digit, i) => {
          if (stoppedReels[i]) return targetDigits[i];
          return (digit + 1) % 10;
        })
      );

      // Check which reels should stop
      setStoppedReels(prev => {
        const next = [...prev];
        let changed = false;

        for (let i = 0; i < 12; i++) {
          if (!next[i]) {
            const stopTime = baseSpinDuration + i * reelDelay;
            if (elapsed >= stopTime) {
              next[i] = true;
              changed = true;
              triggerHaptic('light');
            }
          }
        }
        return changed ? next : prev;
      });

      // If all 12 are stopped
      if (stoppedReels.every(Boolean) && !allFinished) {
        clearInterval(interval);
        setAllFinished(true);
        triggerHaptic('success');

        if (isRare) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ff2d55', '#9d4edd', '#00d4ff'],
          });
        }

        setTimeout(() => {
          if (active) onFinish();
        }, 600);
      }
    }, 45);

    return () => {
      active = false;
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stoppedReels, allFinished, baseSpinDuration, reelDelay]);

  // Skip animation handler
  const handleSkip = () => {
    setStoppedReels(Array(12).fill(true));
    setCurrentDigits(targetDigits);
    setAllFinished(true);
    triggerHaptic('medium');
    if (isRare) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  const isEffectActive = equippedEffect === 'effect_matrix' || equippedEffect === 'bundle_deluxe';

  // Group digits into 3 blocks of 4 digits: [0..3], [4..7], [8..11]
  const block1 = currentDigits.slice(0, 4);
  const block2 = currentDigits.slice(4, 8);
  const block3 = currentDigits.slice(8, 12);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      {/* Rare atmospheric backlight */}
      {isRare && (
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-purple-600/10 to-transparent pointer-events-none animate-pulse-slow" />
      )}

      {/* Terminal Title */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono tracking-widest text-gold-400 mb-1">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>ТЕРМИНАЛ ГЕНЕРАЦИИ VIP НОМЕРА</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
          {isRare ? '🔥 РЕДКАЯ КОМБИНАЦИЯ ФОРМИРУЕТСЯ...' : 'ВЫПУСК КАРТЫ...'}
        </h2>
      </div>

      {/* Reels Box Container */}
      <div className="relative z-10 w-full max-w-md bg-[#0f111a] p-6 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
        {/* Top laser scanline */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mb-6 opacity-75" />

        {/* Rolling Digits Display */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-3 py-4 px-2 w-full bg-black/60 rounded-2xl border border-white/10 shadow-inner">
          {/* Static Prefix 2202 */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 font-mono font-black text-lg sm:text-2xl text-gold-400 px-1 py-1 rounded bg-white/5 border border-gold-400/30">
            <span>2</span><span>2</span><span>0</span><span>2</span>
          </div>

          <span className="text-white/40 font-bold">•</span>

          {/* Block 1: Digits 0..3 */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {block1.map((digit, idx) => {
              const reelIndex = idx;
              const isLocked = stoppedReels[reelIndex];
              return (
                <div
                  key={`b1-${idx}`}
                  className={`w-6 sm:w-8 h-9 sm:h-12 flex items-center justify-center font-mono font-black text-lg sm:text-2xl rounded-lg transition-all ${
                    isLocked
                      ? isEffectActive
                        ? 'effect-cyber-neon bg-cyan-950/40 border border-cyan-400/60'
                        : 'bg-white/10 text-white border border-white/20'
                      : 'bg-black/80 text-white/50 border border-white/5 scale-95'
                  }`}
                >
                  {digit}
                </div>
              );
            })}
          </div>

          <span className="text-white/40 font-bold">•</span>

          {/* Block 2: Digits 4..7 */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {block2.map((digit, idx) => {
              const reelIndex = 4 + idx;
              const isLocked = stoppedReels[reelIndex];
              return (
                <div
                  key={`b2-${idx}`}
                  className={`w-6 sm:w-8 h-9 sm:h-12 flex items-center justify-center font-mono font-black text-lg sm:text-2xl rounded-lg transition-all ${
                    isLocked
                      ? isEffectActive
                        ? 'effect-cyber-neon bg-cyan-950/40 border border-cyan-400/60'
                        : 'bg-white/10 text-white border border-white/20'
                      : 'bg-black/80 text-white/50 border border-white/5 scale-95'
                  }`}
                >
                  {digit}
                </div>
              );
            })}
          </div>

          <span className="text-white/40 font-bold">•</span>

          {/* Block 3: Digits 8..11 */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {block3.map((digit, idx) => {
              const reelIndex = 8 + idx;
              const isLocked = stoppedReels[reelIndex];
              return (
                <div
                  key={`b3-${idx}`}
                  className={`w-6 sm:w-8 h-9 sm:h-12 flex items-center justify-center font-mono font-black text-lg sm:text-2xl rounded-lg transition-all ${
                    isLocked
                      ? isEffectActive
                        ? 'effect-cyber-neon bg-cyan-950/40 border border-cyan-400/60'
                        : 'bg-white/10 text-white border border-white/20'
                      : 'bg-black/80 text-white/50 border border-white/5 scale-95'
                  }`}
                >
                  {digit}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rarity & Status hint */}
        <div className="mt-6 flex items-center justify-between w-full text-xs font-mono text-white/60">
          <span>Синхронизация ячеек:</span>
          <span className="text-gold-400 font-bold">
            {stoppedReels.filter(Boolean).length} / 12
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-150"
            style={{ width: `${(stoppedReels.filter(Boolean).length / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* Skip Button */}
      <div className="mt-8 relative z-10">
        <button
          onClick={handleSkip}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white text-xs font-mono tracking-wider transition-all border border-white/10 backdrop-blur"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>ПРОПУСТИТЬ АНИМАЦИЮ</span>
        </button>
      </div>
    </div>
  );
};
