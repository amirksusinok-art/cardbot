import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'support' | 'policy';
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, initialTab = 'support' }) => {
  const [activeTab, setActiveTab] = useState<'support' | 'policy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#10121a] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('support')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === 'support'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Поддержка
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === 'policy'
                    ? 'bg-amber-400 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Политика и правила
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="mt-4 space-y-3 text-xs leading-relaxed overflow-y-auto max-h-[60vh] pr-1">
            {activeTab === 'support' ? (
              <>
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1">
                  <b className="text-amber-400 block font-mono">⭐ Платежи Telegram Stars</b>
                  <p className="text-zinc-300 text-[11px]">
                    Цифровая косметика (холдеры, рамки, эффекты) оплачивается в Stars (валюта XTR) без скрытых комиссий. Все предметы выдаются мгновенно и навсегда привязываются к аккаунту.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1">
                  <b className="text-cyan-400 block font-mono">💳 Статус карт</b>
                  <p className="text-zinc-300 text-[11px]">
                    Карты имеют статус DEMO и являются исключительно коллекционными игровыми объектами. Они не связаны с реальными банками и не используются для финансовых операций.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-white/5 rounded-2xl space-y-1">
                  <b className="text-emerald-400 block font-mono">💬 Связь с поддержкой</b>
                  <p className="text-zinc-300 text-[11px]">
                    По любым вопросам и возвратам Stars пишите администратору:  
                    <span className="text-white font-bold block mt-0.5">@stena10</span>
                  </p>
                </div>
              </>
            ) : (
              /* Privacy Policy & Terms */
              <div className="space-y-3 font-mono text-[11px] text-zinc-300">
                <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5 space-y-2">
                  <b className="text-white block text-xs">📜 ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ И УСЛОВИЯ</b>
                  <p>
                    1. <b>Игровой статус:</b> Игра «Black Cards & VIP Plastic» представляет собой виртуальный симулятор коллекционирования. Карты не являются платежными средствами, не имеют реальной денежной стоимости и не могут быть обменяны на фиатные деньги или криптовалюту.
                  </p>
                  <p>
                    2. <b>Валюта Coins:</b> Внутриигровые Coins начисляются бесплатно за активность и задания. Coins не продаются за реальные деньги, не передаются между игроками и не подлежат выводу.
                  </p>
                  <p>
                    3. <b>Telegram Stars (XTR):</b> Используются исключительно для приобретения фиксированных косметических товаров (холдеры, рамки, фоны). В игре отсутствуют платные случайные наборы (лутбоксы) и элементы азартных игр.
                  </p>
                  <p>
                    4. <b>Хранение данных:</b> Приложение сохраняет только открытый Telegram ID пользователя для ведения коллекции и игрового прогресса. Персональные платёжные данные приложением не собираются и не обрабатываются (все платежи проходят напрямую через Telegram Payments API).
                  </p>
                  <p>
                    5. <b>Товарные знаки:</b> Бренды банков (Рубарис, Вельтари, Озевия, Верданор, Норвиан) являются вымышленными игровыми названиями.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-mono text-xs font-black tracking-wider transition-all"
        >
          ЗАКРЫТЬ
        </button>
      </div>
    </div>
  );
};
