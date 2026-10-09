import React from 'react';
import { Card, BankName, MaterialName, CategoryName } from '../types.js';
import { Shield, Sparkles, Wifi, Cpu, Star, Flame, Award } from 'lucide-react';

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
    bgGradient: 'from-[#42040c] via-[#200508] to-[#0c0405]',
    accentColor: '#ff2d55',
    borderClass: 'border-red-900/60 shadow-[0_0_20px_rgba(255,45,85,0.2)]',
    icon: Flame,
  },
  'Вельтари': {
    bgGradient: 'from-[#1e1035] via-[#110722] to-[#07020f]',
    accentColor: '#b5179e',
    borderClass: 'border-purple-800/60 shadow-[0_0_20px_rgba(181,23,158,0.2)]',
    icon: Sparkles,
  },
  'Озевия': {
    bgGradient: 'from-[#032b57] via-[#021833] to-[#010b17]',
    accentColor: '#00b4d8',
    borderClass: 'border-cyan-800/60 shadow-[0_0_20px_rgba(0,180,216,0.2)]',
    icon: Shield,
  },
  'Верданор': {
    bgGradient: 'from-[#0b3829] via-[#052118] to-[#02120d]',
    accentColor: '#2ec4b6',
    borderClass: 'border-emerald-800/60 shadow-[0_0_20px_rgba(46,196,182,0.2)]',
    icon: Award,
  },
  'Норвиан': {
    bgGradient: 'from-[#12233b] via-[#0a1626] to-[#050b14]',
    accentColor: '#90e0ef',
    borderClass: 'border-blue-900/60 shadow-[0_0_20px_rgba(144,224,239,0.2)]',
    icon: Shield,
  },
};

export const MATERIAL_STYLES: Record<MaterialName, {
  class: string;
  badgeBg: string;
  badgeText: string;
}> = {
  'Classic Plastic': {
    class: 'bg-gradient-to-tr from-gray-900 to-gray-800',
    badgeBg: 'bg-gray-800/80',
    badgeText: 'text-gray-300',
  },
  'Matte Plastic': {
    class: 'bg-[#12141a] backdrop-blur-md',
    badgeBg: 'bg-zinc-800/90',
    badgeText: 'text-zinc-200',
  },
  'Gold': {
    class: 'texture-gold',
    badgeBg: 'bg-yellow-950/80 border border-yellow-500/40',
    badgeText: 'text-yellow-400 font-bold',
  },
  'Black Carbon': {
    class: 'texture-carbon',
    badgeBg: 'bg-neutral-900/90 border border-neutral-700',
    badgeText: 'text-neutral-200',
  },
  'Titanium': {
    class: 'texture-titanium border border-slate-500/50',
    badgeBg: 'bg-slate-900/90 border border-slate-400/50',
    badgeText: 'text-slate-100 font-bold',
  },
  'Holographic': {
    class: 'texture-holographic',
    badgeBg: 'bg-black/70 border border-pink-400/60',
    badgeText: 'text-pink-300 font-extrabold',
  },
};

export const CATEGORY_COLORS: Record<CategoryName, { bg: string; text: string; border: string }> = {
  'Standard': { bg: 'bg-gray-800/80', text: 'text-gray-400', border: 'border-gray-700' },
  'Pair': { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-500/40' },
  'Triple': { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  'Repeater': { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-500/40' },
  'Quad': { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-500/40' },
  'Straight': { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-500/50' },
  'Mirror': { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-500/60' },
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

  return (
    <div
      onClick={onClick}
      className={`relative transition-all duration-300 select-none ${
        isHolderActive ? 'p-2.5 holder-vip-acrylic bg-black/40' : ''
      } ${className}`}
    >
      {/* Physical Card Container */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-2xl p-5 overflow-hidden border ${
          bankTheme.borderClass
        } ${matStyle.class} flex flex-col justify-between shadow-2xl transition-transform active:scale-[0.99]`}
      >
        {/* Bank Theme Background Blend Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${bankTheme.bgGradient} opacity-75 mix-blend-multiply pointer-events-none`}
        />

        {/* Specular glare line */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />

        {/* Header: Bank Brand, EMV Chip & NFC */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/50 border border-white/20 shadow-inner"
              style={{ color: bankTheme.accentColor }}
            >
              <BankIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm sm:text-base text-white drop-shadow">
                {card.bank}
              </span>
              <span className="block text-[9px] tracking-widest text-white/50 uppercase font-mono">
                VIP PRIVATE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Contactless Waves */}
            <Wifi className="w-4 h-4 text-white/60 rotate-90" />
            {/* Gold EMV Chip */}
            <div className="w-8 h-6 rounded-md bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 border border-yellow-300/60 flex items-center justify-center shadow-md relative overflow-hidden">
              <div className="w-full h-[1px] bg-amber-800/40 absolute top-2" />
              <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2" />
              <div className="h-full w-[1px] bg-amber-800/40 absolute left-3" />
              <Cpu className="w-3.5 h-3.5 text-amber-950/60" />
            </div>
          </div>
        </div>

        {/* Center: Card Number */}
        <div className="relative z-10 my-auto py-1">
          <div
            className={`font-mono font-bold tracking-widest text-base sm:text-xl lg:text-2xl text-center text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              isEffectActive ? 'effect-cyber-neon font-black' : ''
            }`}
          >
            {card.card_number}
          </div>
        </div>

        {/* Footer: Expiry, Collection Code, Category, DEMO watermark */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          {/* Left Column: Expiry & Code */}
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-[9px] text-white/60 font-mono">
              <span>VALID THRU:</span>
              <span className="text-white font-bold">{card.expiry_date}</span>
            </div>
            <div className="text-[10px] text-white/80 font-mono tracking-wider font-semibold">
              {card.collection_code}
            </div>
          </div>

          {/* Right Column: Badges & DEMO */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1.5">
              {/* Category Badge */}
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${catColor.bg} ${catColor.text} ${catColor.border}`}
              >
                {card.category}
              </span>

              {/* Material Badge */}
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono border ${matStyle.badgeBg} ${matStyle.badgeText}`}
              >
                {card.material}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono text-amber-400/90 font-bold">
                {card.score.toLocaleString()} PTS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/30 border border-white/20 px-1 rounded">
                DEMO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
