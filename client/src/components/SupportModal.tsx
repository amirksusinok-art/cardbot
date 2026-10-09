import React from 'react';
import { X, HelpCircle, ShieldAlert, Star, ExternalLink } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#12141f] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-black text-white">ПОДДЕРЖКА И ПРАВИЛА</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-white/80 leading-relaxed font-mono">
          <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
            <b className="text-gold-400 block text-xs">⭐ Оплата Telegram Stars:</b>
            <p className="text-[11px] text-white/60">
              Косметика (холдеры, рамки, эффекты) оплачивается в Stars (XTR) без скрытых комиссий. В случае задержки доставки напишите в поддержку.
            </p>
          </div>

          <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
            <b className="text-cyan-400 block text-xs">💳 Статус карт и Coins:</b>
            <p className="text-[11px] text-white/60">
              Все карты имеют статус DEMO и являются исключительно коллекционными предметами. Coins и карты не имеют денежной стоимости и не передаются.
            </p>
          </div>

          <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
            <b className="text-emerald-400 block text-xs">💬 Контакт разработчика:</b>
            <p className="text-[11px] text-white/60">
              Telegram: <span className="text-white font-bold">@amirksusinok</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold"
        >
          ЗАКРЫТЬ
        </button>
      </div>
    </div>
  );
};
