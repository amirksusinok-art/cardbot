import React, { useState } from 'react';
import { Card, BankName, MaterialName, CategoryName } from '../types.js';
import { CardPreview } from './CardPreview.js';
import { triggerHaptic } from '../utils/telegram.js';
import { Star, Share2, Crown, Filter, Check, X } from 'lucide-react';

interface CollectionViewProps {
  cards: Card[];
  equippedHolder?: string | null;
  equippedEffect?: string | null;
  onToggleFavorite: (cardId: string) => void;
  onSetCardOfDay: (cardId: string) => void;
  cardOfDayId?: string | null;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  cards,
  equippedHolder,
  equippedEffect,
  onToggleFavorite,
  onSetCardOfDay,
  cardOfDayId,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const filteredCards = cards.filter(c => {
    if (favoritesOnly && !c.is_favorite) return false;
    if (selectedBank !== 'all' && c.bank !== selectedBank) return false;
    if (selectedMaterial !== 'all' && c.material !== selectedMaterial) return false;
    return true;
  });

  const banks: BankName[] = ['Рубарис', 'Вельтари', 'Озевия', 'Верданор', 'Норвиан'];
  const materials: MaterialName[] = ['Classic Plastic', 'Matte Plastic', 'Gold', 'Black Carbon', 'Titanium', 'Holographic'];

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 animate-fadeIn">
      {/* Title & Stats */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-white">КОЛЛЕКЦИЯ</h2>
          <p className="text-xs text-white/50 font-mono">
            Всего в хранилище: {cards.length} шт. (отобрано: {filteredCards.length})
          </p>
        </div>

        {/* Favorite toggle */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setFavoritesOnly(!favoritesOnly);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
            favoritesOnly
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-white/5 border-white/10 text-white/60'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400' : ''}`} />
          <span>Избранное</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="space-y-2 px-2">
        {/* Bank filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedBank('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 border transition-all ${
              selectedBank === 'all'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            Все банки
          </button>
          {banks.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBank(b)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 border transition-all ${
                selectedBank === b
                  ? 'bg-gold-400 text-black font-bold border-gold-400'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Material filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedMaterial('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 border transition-all ${
              selectedMaterial === 'all'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            Все материалы
          </button>
          {materials.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMaterial(m)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono shrink-0 border transition-all ${
                selectedMaterial === m
                  ? 'bg-cyan-400 text-black font-bold border-cyan-400'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid / List */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/[0.02] rounded-2xl border border-white/10 mx-2">
          <p className="text-sm text-white/50 font-mono">Карты по выбранным фильтрам не найдены</p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {filteredCards.map(card => {
            const isCardOfDay = cardOfDayId === card.id;

            return (
              <div
                key={card.id}
                className="bg-[#10121b] border border-white/10 rounded-2xl p-3 space-y-2.5 transition-all hover:border-white/20"
              >
                <CardPreview
                  card={card}
                  equippedHolder={equippedHolder}
                  equippedEffect={equippedEffect}
                  onClick={() => setActiveCard(card)}
                />

                {/* Card toolbar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    {/* Favorite toggle button */}
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        onToggleFavorite(card.id);
                      }}
                      className={`p-2 rounded-xl border transition-all ${
                        card.is_favorite
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                      title="В избранное"
                    >
                      <Star className={`w-4 h-4 ${card.is_favorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Set card of day */}
                    <button
                      onClick={() => {
                        triggerHaptic('success');
                        onSetCardOfDay(card.id);
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                        isCardOfDay
                          ? 'bg-gold-400/20 border-gold-400 text-gold-300 font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <Crown className={`w-3.5 h-3.5 ${isCardOfDay ? 'text-gold-400' : ''}`} />
                      <span>{isCardOfDay ? 'Карта дня' : 'Сделать картой дня'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-white/40">
                    {new Date(card.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
