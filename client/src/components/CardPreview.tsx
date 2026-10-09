import React from 'react';
import { Card, BankName, MaterialName, CategoryName } from '../types.js';
import { Shield, Sparkles, Wifi, Cpu, Award, Flame } from 'lucide-react';

interface CardPreviewProps {
  card: Card;
  equippedHolder?: string | null;
  equippedEffect?: string | null;
  showRarityTag?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BANK_THEMES: Record<BankName, {
  bgGradient: string;
  accentColor: string;
  borderClass: string;
  icon: any;
}> = {
  'Рубарис': {
    bgGradient: 'from-[#3d0309] via-[#1c0407] to-[#0a0203]',
    accentColor: '#ff2d55',
    borderClass: 'border-red-900/40',
    icon: Flame,
  },
  'Вельтари': {
    bgGradient: 'from-[#1a0f2e] via-[#0f071e] to-[#07030e]',
    accentColor: '#b5179e',
    borderClass: 'border-purple-800/40',
    icon: Sparkles,
  },
  'Озевия': {
    bgGradient: 'from-[#03274f] via-[#02152e] to-[#010914]',
    accentColor: '#00b4d8',
    borderClass: 'border-cyan-800/40',
    icon: Shield,
  },
  'Верданор': {
    bgGradient: 'from-[#083023] via-[#041c14] to-[#020e0a]',
    accentColor: '#2ec4b6',
    borderClass: 'border-emerald-800/40',
    icon: Award,
  },
  'Норвиан': {
    bgGradient: 'from-[#0e1d32] via-[#081220] to-[#040910]',
    accentColor: '#90e0ef',
    borderClass: 'border-blue-900/40',
    icon: Shield,
  },
};

export const MATERIAL_STYLES: Record<MaterialName, {
  class: string;
  isLight: boolean;
  badgeBg: string;
  badgeText: string;
}> = {
  'Classic Plastic': {
    class: 'bg-gradient-to-tr from-[#15171e] to-[#252834]',
    isLight: false,
    badgeBg: 'bg-zinc-800/90',
    badgeText: 'text-zinc-200',
  },
  'Matte Plastic': {
    class: 'bg-[#101217]',
    isLight: false,
    badgeBg: 'bg-zinc-800/90',
    badgeText: 'text-zinc-200',
  },
  'Gold': {
    class: 'texture-gold',
    isLight: true, // Gold has light background, so text MUST be dark!
    badgeBg: 'bg-black/80',
    badgeText: 'text-yellow-400 font-bold',
  },
  'Black Carbon': {
    class: 'texture-carbon',
    isLight: false,
    badgeBg: 'bg-neutral-900/95 border border-neutral-700',
    badgeText: 'text-neutral-100',
  },
  'Titanium': {
    class: 'texture-titanium border border-slate-400/40',
    isLight: false,
    badgeBg: 'bg-slate-900/95 border border-slate-400/50',
    badgeText: 'text-slate-100 font-bold',
  },
  'Holographic': {
    class: 'texture-holographic',
    isLight: false,
    badgeBg: 'bg-black/80 border border-pink-400/60',
    badgeText: 'text-pink-300 font-extrabold',
  },
};

export const CATEGORY_COLORS: Record<CategoryName, { bg: string; text: string; label: string }> = {
  'Standard': { bg: 'bg-zinc-800/90', text: 'text-zinc-300', label: 'Обычный' },
  'Pair': { bg: 'bg-blue-950/90', text: 'text-blue-300', label: 'Пара' },
  'Triple': { bg: 'bg-emerald-950/90', text: 'text-emerald-300', label: 'Тройка' },
  'Repeater': { bg: 'bg-amber-950/90', text: 'text-amber-300', label: 'Повтор' },
  'Quad': { bg: 'bg-purple-950/90', text: 'text-purple-300', label: 'Каре' },
  'Straight': { bg: 'bg-cyan-950/90', text: 'text-cyan-300', label: 'Стрит' },
  'Mirror': { bg: 'bg-rose-950/90', text: 'text-rose-300', label: 'Зеркало' },
};

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  equippedHolder,
  equippedEffect,
  showRarityTag = true,
  className = '',
  onClick,
}) => {
  const bankTheme = BANK_THEMES[card.bank] || BANK_THEMES['Рубарис'];
  const matStyle = MATERIAL_STYLES[card.material] || MATERIAL_STYLES['Classic Plastic'];
  const catColor = CATEGORY_COLORS[card.category] || CATEGORY_COLORS['Standard'];
  const BankIcon = bankTheme.icon;

  const isHolderActive = equippedHolder === 'holder_vip' || equippedHolder === 'bundle_deluxe';
  const isEffectActive = equippedEffect === 'effect_matrix' || equippedEffect === 'bundle_deluxe';

  // If gold material (light surface), ensure 100% dark text contrast
  const textColor = matStyle.isLight ? 'text-zinc-950 font-black' : 'text-white';
  const subTextColor = matStyle.isLight ? 'text-zinc-800 font-bold' : 'text-white/60';
  const chipBorder = matStyle.isLight ? 'border-amber-800/60' : 'border-amber-300/60';

  return (
    <div
      onClick={onClick}
      className={`relative transition-all duration-300 select-none ${
        isHolderActive ? 'p-2.5 holder-vip-acrylic bg-black/40' : ''
      } ${className}`}
    >
      {/* Physical Bank Card Object */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-[22px] p-5 sm:p-6 overflow-hidden border border-white/10 ${
          bankTheme.borderClass
        } ${matStyle.class} flex flex-col justify-between shadow-[0_20px_45px_rgba(0,0,0,0.7)] transition-transform active:scale-[0.99]`}
      >
        {/* Subtle Bank Blend Layer (only for non-gold/non-carbon to preserve texture) */}
        {card.material !== 'Gold' && card.material !== 'Black Carbon' && card.material !== 'Holographic' && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${bankTheme.bgGradient} opacity-85 pointer-events-none`}
          />
        )}

        {/* Specular Glare Arc */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />

        {/* TOP ROW: Bank Brand & SIM/EMV Smart Chip */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Bank Brand & Country Pill */}
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                matStyle.isLight ? 'bg-black text-amber-400' : 'bg-black/60 border border-white/20'
              }`}
              style={{ color: matStyle.isLight ? undefined : bankTheme.accentColor }}
            >
              <BankIcon className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`font-black text-base sm:text-lg tracking-wide ${textColor}`}>
                  {card.bank}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-mono tracking-wider">
                <span className={subTextColor}>🇷🇺 VIP PRIVATE</span>
              </div>
            </div>
          </div>

          {/* Right: Contactless Icon & Gold EMV Smart Chip */}
          <div className="flex items-center space-x-3">
            <Wifi className={`w-4 h-4 rotate-90 ${subTextColor}`} />

            {/* Realistic Gold EMV Chip with Cutout Lines */}
            <div className={`w-10 h-7 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border ${chipBorder} flex items-center justify-center shadow-md relative overflow-hidden`}>
              <div className="w-full h-[1px] bg-amber-900/40 absolute top-2.5" />
              <div className="w-full h-[1px] bg-amber-900/40 absolute bottom-2.5" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute left-3.5" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute right-3.5" />
              <Cpu className="w-3.5 h-3.5 text-amber-950/70 relative z-10" />
            </div>
          </div>
        </div>

        {/* CENTER: Prominent Bold Card Number */}
        <div className="relative z-10 my-auto py-2">
          <div
            className={`font-mono font-black tracking-[0.14em] text-lg sm:text-2xl text-center transition-all ${
              isEffectActive
                ? 'effect-cyber-neon font-black drop-shadow-[0_0_12px_#00d4ff]'
                : matStyle.isLight
                ? 'text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                : 'text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]'
            }`}
          >
            {card.card_number}
          </div>
        </div>

        {/* BOTTOM ROW: Expiry, Code & Rarity Tag */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          {/* Left Details */}
          <div className="space-y-0.5">
            <div className={`flex items-center space-x-1.5 text-[10px] font-mono ${subTextColor}`}>
              <span>VALID THRU:</span>
              <span className={`font-bold ${matStyle.isLight ? 'text-zinc-900' : 'text-white'}`}>
                {card.expiry_date}
              </span>
            </div>

            <div className={`text-[10px] font-mono tracking-wider font-semibold ${subTextColor}`}>
              {card.collection_code}
            </div>
          </div>

          {/* Right: Rarity Tag & DEMO badge */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1.5">
              {/* Category pill */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shadow-sm ${catColor.bg} ${catColor.text}`}
              >
                {catColor.label}
              </span>

              {/* Material pill */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shadow-sm ${matStyle.badgeBg} ${matStyle.badgeText}`}
              >
                {card.material}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-extrabold ${matStyle.isLight ? 'text-zinc-900' : 'text-amber-400'}`}>
                {card.score.toLocaleString()} PTS
              </span>
              <span className={`text-[9px] font-mono tracking-widest px-1 rounded border ${
                matStyle.isLight ? 'border-zinc-900/40 text-zinc-800' : 'border-white/30 text-white/50'
              }`}>
                DEMO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
