import React, { useState } from 'react';
import { Menu, X, Zap, Layers, BookOpen, Target, Star, User, History, Settings, HelpCircle, Coins } from 'lucide-react';
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
  coins: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenSupport,
  coins,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { key: 'mint', label: '1. Выпуск карт', icon: Zap, color: 'text-amber-400' },
    { key: 'collection', label: '2. Коллекция', icon: Layers, color: 'text-cyan-400' },
    { key: 'albums', label: '3. Альбомы', icon: BookOpen, color: 'text-emerald-400' },
    { key: 'tasks', label: '4. Задания', icon: Target, color: 'text-rose-400' },
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
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#090a0f]/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        {/* Menu Toggle Button (in top-left as required) */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsMenuOpen(true);
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white border border-white/10 transition-all flex items-center space-x-2"
        >
          <Menu className="w-5 h-5 text-gold-400" />
          <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">МЕНЮ</span>
        </button>

        {/* Brand Center */}
        <div className="flex flex-col items-center cursor-pointer" onClick={() => handleSelect('mint')}>
          <span className="font-black text-sm tracking-widest text-white">BLACK CARDS</span>
          <span className="text-[9px] font-mono text-gold-400/80 tracking-widest">VIP PLASTIC</span>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center space-x-1.5 bg-black/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-amber-400 text-xs">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0c0e17] border-r border-white/10 p-5 flex flex-col justify-between z-10 shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-black text-sm tracking-wider text-white">ГЛАВНОЕ МЕНЮ</h3>
                  <p className="text-[10px] font-mono text-gold-400">VIP Private Banking</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation items list */}
              <nav className="space-y-1.5">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelect(item.key as TabKey)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                        isActive
                          ? 'bg-white/15 text-white font-bold border border-white/20'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions: Settings & Support */}
            <div className="pt-4 border-t border-white/10 space-y-1.5">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>8. Настройки</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsMenuOpen(false);
                  onOpenSupport();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>9. Поддержка</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Mobile Ergonomics */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around max-w-lg mx-auto">
        <button
          onClick={() => handleSelect('mint')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'mint' ? 'text-amber-400 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-mono">Выпуск</span>
        </button>

        <button
          onClick={() => handleSelect('collection')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'collection' ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-mono">Карты</span>
        </button>

        <button
          onClick={() => handleSelect('albums')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'albums' ? 'text-emerald-400 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-mono">Альбомы</span>
        </button>

        <button
          onClick={() => handleSelect('shop')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'shop' ? 'text-yellow-400 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-mono">Stars</span>
        </button>

        <button
          onClick={() => handleSelect('profile')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'profile' ? 'text-purple-400 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-mono">Профиль</span>
        </button>
      </nav>
    </>
  );
};
