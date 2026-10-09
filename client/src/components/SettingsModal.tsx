import React from 'react';
import { X, Volume2, Sparkles, Smartphone, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  hapticsEnabled,
  setHapticsEnabled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#12141f] border border-white/10 rounded-3xl p-5 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white">НАСТРОЙКИ</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-gold-400" />
              <div>
                <span className="text-sm font-bold text-white block">Звуковые эффекты</span>
                <span className="text-[11px] text-white/40 block">Аудио сопровождение генерации</span>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setSoundEnabled(!soundEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-gold-400' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-sm font-bold text-white block">Тактильный отклик</span>
                <span className="text-[11px] text-white/40 block">Вибрация Telegram при остановке цифр</span>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setHapticsEnabled(!hapticsEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                hapticsEnabled ? 'bg-cyan-400' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
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
