import React from 'react';
import { X, Zap, Layers, BookOpen, Target, Star, User, History, Settings, HelpCircle, ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram.js';

export type TabKey =
  | 'mint'
  | 'collection'
  | 'albums'
  | 'tasks'
  | 'shop'
  | 'profile'
  | 'history';

interface TopNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onOpenPolicy: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenSupport,
  onOpenPolicy,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const menuItems = [
    { key: 'mint', label: '1. Выпуск карт', icon: Zap, color: 'text-amber-400' },
    { key: 'collection', label: '2. Коллекция', icon: Layers, color: 'text-cyan-400' },
    { key: 'albums', label: '3. Альбомы', icon: BookOpen, color: 'text-emerald-400' },
    { key: 'tasks', label: '4. Задания дня', icon: Target, color: 'text-rose-400' },
    { key: 'shop', label: '5. Магазин Stars', icon: Star, color: 'text-yellow-400' },
    { key: 'profile', label: '6. Профиль', icon: User, color: 'text-purple-400' },
    { key: 'history', label: '7. История операций', icon: History, color: 'text-blue-400' },
  ];

  const handleSelect = (key: TabKey) => {
    triggerHaptic('light');
    onSelectTab(key);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Side Menu Drawer (Optional auxiliary menu) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0B0C0E] border-r border-white/[0.06] p-5 flex flex-col justify-between z-10 shadow-2xl">
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="font-black text-sm tracking-wider text-white">BLACK CARDS</h3>
                  <p className="text-[10px] font-mono text-amber-400">VIP Private Banking</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full bg-white/[0.05] text-[#8E929B] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelect(item.key as TabKey)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                        isActive
                          ? 'bg-white/[0.08] text-white font-bold'
                          : 'text-[#8E929B] hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/[0.06] space-y-1">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMenuOpen(false);
                  onOpenPolicy();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 hover:text-white hover:bg-white/[0.04] transition-all text-left"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Политика и правила</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono text-[#8E929B] hover:text-white hover:bg-white/[0.04] transition-all text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Настройки</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMenuOpen(false);
                  onOpenSupport();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono text-[#8E929B] hover:text-white hover:bg-white/[0.04] transition-all text-left"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Поддержка</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. НИЖНИЙ ТАББАР (BOTTOM NAVIGATION) — Полупрозрачный блюр, стандарт Telegram Mini Apps */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0C0E]/90 backdrop-blur-2xl border-t border-white/[0.06] px-3 py-2 flex items-center justify-around max-w-[440px] mx-auto shadow-2xl">
        <button
          onClick={() => handleSelect('mint')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'mint' ? 'text-amber-400 font-bold' : 'text-[#8E929B] hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-mono">Выпуск</span>
        </button>

        <button
          onClick={() => handleSelect('collection')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'collection' ? 'text-white font-bold' : 'text-[#8E929B] hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-mono">Карты</span>
        </button>

        <button
          onClick={() => handleSelect('tasks')}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-[#8E929B] hover:text-white'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-mono">Задания</span>
        </button>

        <button
          onClick={() => handleSelect('albums')}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'albums' ? 'text-emerald-400 font-bold' : 'text-[#8E929B] hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-mono">Альбомы</span>
        </button>

        <button
          onClick={() => handleSelect('profile')}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'profile' ? 'text-purple-400 font-bold' : 'text-[#8E929B] hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-mono">Профиль</span>
        </button>
      </nav>
    </>
  );
};
