import React from 'react';
import { Card, BankName, MaterialName } from '../types.js';
import { Shield, Sparkles, Wifi, Cpu, Award, Flame } from 'lucide-react';

interface CardPreviewProps {
  card: Card;
  equippedHolder?: string | null;
  equippedEffect?: string | null;
  className?: string;
  onClick?: () => void;
}

export const BANK_CONFIGS: Record<BankName, {
  accentColor: string;
  icon: any;
  subText: string;
}> = {
  'Рубарис': {
    accentColor: '#ff2d55',
    icon: Flame,
    subText: 'RUBARIS PRIVATE',
  },
  'Вельтари': {
    accentColor: '#a855f7',
    icon: Sparkles,
    subText: 'VELTARI BLACK',
  },
  'Озевия': {
    accentColor: '#00d4ff',
    icon: Shield,
    subText: 'OZEVIA WORLD',
  },
  'Верданор': {
    accentColor: '#2ec4b6',
    icon: Award,
    subText: 'VERDANOR RESERVE',
  },
  'Норвиан': {
    accentColor: '#94a3b8',
    icon: Shield,
    subText: 'NORVIAN INFINITE',
  },
};

export const MATERIAL_STYLES: Record<MaterialName, {
  textureClass: string;
  isLight: boolean;
  textColor: string;
  numberColor: string;
  chipTone: string;
}> = {
  'Classic Plastic': {
    textureClass: 'texture-classic-plastic',
    isLight: false,
    textColor: 'text-zinc-400',
    numberColor: 'text-[#E2E8F0]',
    chipTone: 'from-amber-200 to-amber-500',
  },
  'Matte Plastic': {
    textureClass: 'texture-matte-plastic',
    isLight: false,
    textColor: 'text-[#8E929B]',
    numberColor: 'text-[#E2E8F0]',
    chipTone: 'from-zinc-300 to-zinc-500', // Brushed silver chip for matte
  },
  'Gold': {
    textureClass: 'texture-gold',
    isLight: true,
    textColor: 'text-amber-950 font-bold',
    numberColor: 'text-zinc-950 font-black',
    chipTone: 'from-amber-100 to-amber-600',
  },
  'Black Carbon': {
    textureClass: 'texture-carbon',
    isLight: false,
    textColor: 'text-zinc-400',
    numberColor: 'text-[#F1F5F9]',
    chipTone: 'from-zinc-300 to-zinc-500',
  },
  'Titanium': {
    textureClass: 'texture-titanium',
    isLight: false,
    textColor: 'text-slate-300',
    numberColor: 'text-white',
    chipTone: 'from-slate-200 to-slate-400',
  },
  'Holographic': {
    textureClass: 'texture-holographic',
    isLight: false,
    textColor: 'text-pink-100',
    numberColor: 'text-white',
    chipTone: 'from-amber-200 to-yellow-500',
  },
};

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  equippedHolder,
  equippedEffect,
  className = '',
  onClick,
}) => {
  const bankConfig = BANK_CONFIGS[card.bank] || BANK_CONFIGS['Рубарис'];
  const matStyle = MATERIAL_STYLES[card.material] || MATERIAL_STYLES['Matte Plastic'];
  const BankIcon = bankConfig.icon;

  const isHolderActive = equippedHolder === 'holder_vip' || equippedHolder === 'bundle_deluxe';
  const isEffectActive = equippedEffect === 'effect_matrix' || equippedEffect === 'bundle_deluxe';

  // Format expiry to MM/YY (clean Apple Wallet style)
  const expiryParts = (card.expiry_date || '10/2099').split('/');
  const shortExpiry = expiryParts.length === 2 ? `${expiryParts[0]}/${expiryParts[1].slice(-2)}` : card.expiry_date;

  return (
    <div
      onClick={onClick}
      className={`relative transition-all duration-300 select-none ${
        isHolderActive ? 'p-2 holder-vip-acrylic bg-black/40' : ''
      } ${className}`}
    >
      {/* Physical Realistic Bank Card Container (Apple Wallet / Revolut style) */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-[18px] p-5 sm:p-6 overflow-hidden border border-white/[0.08] ${
          matStyle.textureClass
        } flex flex-col justify-between shadow-[0_20px_45px_rgba(0,0,0,0.65)] transition-transform active:scale-[0.99]`}
      >
        {/* Subtle diagonal micro-glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

        {/* 1. TOP OF CARD: Bank Logo & Clean Chip/NFC */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Bank Branding */}
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-inner ${
                matStyle.isLight ? 'bg-black text-amber-400' : 'bg-white/[0.06] border border-white/[0.1]'
              }`}
              style={{ color: matStyle.isLight ? undefined : bankConfig.accentColor }}
            >
              <BankIcon className="w-3.5 h-3.5" />
            </div>

            <div>
              <span className={`font-black text-sm tracking-wider uppercase block leading-none ${
                matStyle.isLight ? 'text-zinc-950' : 'text-white'
              }`}>
                {card.bank}
              </span>
              <span className={`text-[9px] font-mono tracking-widest block mt-0.5 ${matStyle.textColor}`}>
                {bankConfig.subText}
              </span>
            </div>
          </div>

          {/* Right: Contactless Icon & EMV Smart Chip */}
          <div className="flex items-center space-x-2.5">
            <Wifi className={`w-3.5 h-3.5 rotate-90 opacity-60 ${matStyle.isLight ? 'text-zinc-900' : 'text-white'}`} />

            {/* Smart EMV Chip */}
            <div className={`w-9 h-6 rounded-md bg-gradient-to-br ${matStyle.chipTone} border border-white/20 flex items-center justify-center shadow-sm relative overflow-hidden`}>
              <div className="w-full h-[0.5px] bg-black/30 absolute top-2" />
              <div className="w-full h-[0.5px] bg-black/30 absolute bottom-2" />
              <div className="h-full w-[0.5px] bg-black/30 absolute left-3" />
              <div className="h-full w-[0.5px] bg-black/30 absolute right-3" />
              <Cpu className="w-3 h-3 text-black/50 relative z-10" />
            </div>
          </div>
        </div>

        {/* 2. CENTER: Bold Embossed Monospace Card Number */}
        <div className="relative z-10 my-auto py-1 text-center">
          <div
            className={`font-mono font-black tracking-[0.14em] text-lg sm:text-2xl transition-all ${
              isEffectActive
                ? 'effect-cyber-neon drop-shadow-[0_0_12px_#00e5ff]'
                : matStyle.isLight
                ? 'text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                : 'text-[#E2E8F0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
            }`}
          >
            {card.card_number}
          </div>
        </div>

        {/* 3. BOTTOM OF CARD: Cardholder Name, Expiry & Hologram (NO metadata clutter!) */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          {/* Left: Cardholder Name & Expiry */}
          <div className="space-y-0.5">
            <div className={`text-[10px] font-mono tracking-wider font-extrabold uppercase ${
              matStyle.isLight ? 'text-zinc-900' : 'text-white/90'
            }`}>
              VIP CARDHOLDER
            </div>
            <div className={`flex items-center space-x-1.5 text-[9px] font-mono ${matStyle.textColor}`}>
              <span>VALID THRU:</span>
              <span className={`font-bold ${matStyle.isLight ? 'text-zinc-900' : 'text-white'}`}>
                {shortExpiry}
              </span>
            </div>
          </div>

          {/* Right: Security Hologram Sticker (Metallic circles) */}
          <div className="flex items-center">
            <div className="relative w-8 h-5 flex items-center justify-end">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 opacity-80 shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-500 to-amber-400 opacity-75 -ml-2.5 shadow-sm mix-blend-screen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
