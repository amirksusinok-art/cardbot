import React, { useState } from 'react';
import { CosmeticItem, Card } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Star, Sparkles, Check, ShieldCheck, Eye } from 'lucide-react';

interface StarsShopViewProps {
  items: CosmeticItem[];
  sampleCard: Card | null;
  onBuy: (itemKey: string) => void;
  onEquip: (itemKey: string) => void;
  isLoading: boolean;
}

export const StarsShopView: React.FC<StarsShopViewProps> = ({
  items,
  sampleCard,
  onBuy,
  onEquip,
  isLoading,
}) => {
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);

  // Mock sample card if user doesn't have one
  const previewCard: Card = sampleCard || {
    id: 'preview_card',
    card_number: '2202 • 7771 • 3951 • 6208',
    collection_code: 'КОД УЗОРА: 737',
    expiry_date: '10/2099',
    bank: 'Рубарис',
    material: 'Black Carbon',
    category: 'Triple',
    score: 1400,
    is_favorite: 1,
    created_at: Date.now(),
  };

  const activeHolder = previewItem?.type === 'holder' || previewItem?.type === 'bundle'
    ? 'holder_vip'
    : undefined;

  const activeEffect = previewItem?.type === 'effect' || previewItem?.type === 'bundle'
    ? 'effect_matrix'
    : undefined;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-2 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span>МАГАЗИН TELEGRAM STARS</span>
        </h2>
        <p className="text-xs text-white/50 font-mono">
          Эксклюзивная цифровая косметика и оформление без случайных призов
        </p>
      </div>

      {/* Interactive Live Preview Box */}
      <div className="bg-[#12141f] border border-white/10 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-white/60 px-1">
          <span className="flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Интерактивный предпросмотр:</span>
          </span>
          <span className="text-gold-400 font-bold">
            {previewItem ? previewItem.name : 'По умолчанию'}
          </span>
        </div>

        <CardPreview
          card={previewCard}
          equippedHolder={activeHolder}
          equippedEffect={activeEffect}
        />

        {previewItem && (
          <button
            onClick={() => setPreviewItem(null)}
            className="w-full py-1 text-center text-[11px] font-mono text-white/40 hover:text-white"
          >
            Сбросить предпросмотр
          </button>
        )}
      </div>

      {/* Cosmetics List */}
      <div className="space-y-3">
        {items.map(item => {
          const isSelectedForPreview = previewItem?.key === item.key;

          return (
            <div
              key={item.key}
              className={`p-4 rounded-2xl border transition-all ${
                item.isEquipped
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#10121b] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      {item.name}
                    </h3>
                    {item.isOwned && (
                      <span className="text-[10px] bg-white/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Куплено</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Stars price tag */}
                <div className="flex items-center space-x-1 shrink-0 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1.5 rounded-full">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-mono font-bold text-yellow-400 text-xs sm:text-sm">
                    {item.priceStars} ⭐
                  </span>
                </div>
              </div>

              {/* Actions row: Preview / Buy / Equip */}
              <div className="mt-4 flex items-center space-x-2">
                {/* Preview Button */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setPreviewItem(item);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                    isSelectedForPreview
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  {isSelectedForPreview ? 'Просмотр...' : 'Примерить'}
                </button>

                {/* Buy or Equip */}
                {item.isOwned ? (
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      onEquip(item.key);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      item.isEquipped
                        ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {item.isEquipped ? 'Надето (снять)' : 'Надеть'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      onBuy(item.key);
                    }}
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-black font-black text-xs font-mono tracking-wider shadow-md active:scale-98 flex items-center justify-center space-x-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>КУПИТЬ ЗА {item.priceStars} STARS</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
