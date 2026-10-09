import React, { useState, useEffect } from 'react';
import { Card, UserProfile, UserStats, AlbumItem, TaskItem, CosmeticItem, LeaderboardUser, TransactionItem } from './types.js';
import { api } from './utils/api.js';
import { initTelegramApp, triggerHaptic } from './utils/telegram.js';
import { TopNav, TabKey } from './components/TopNav.js';
import { MintTerminal } from './components/MintTerminal.js';
import { CollectionView } from './components/CollectionView.js';
import { AlbumsView } from './components/AlbumsView.js';
import { TasksView } from './components/TasksView.js';
import { StarsShopView } from './components/StarsShopView.js';
import { ProfileView } from './components/ProfileView.js';
import { HistoryView } from './components/HistoryView.js';
import { ReelAnimation } from './components/ReelAnimation.js';
import { SettingsModal } from './components/SettingsModal.js';
import { SupportModal } from './components/SupportModal.js';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('mint');
  const [isLoading, setIsLoading] = useState(true);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cardOfDay, setCardOfDay] = useState<Card | null>(null);
  const [favorites, setFavorites] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [shopItems, setShopItems] = useState<CosmeticItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Mint & Reel animation state
  const [isMinting, setIsMinting] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showReel, setShowReel] = useState(false);
  const [latestCard, setLatestCard] = useState<Card | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Initialize Telegram Mini App
  useEffect(() => {
    initTelegramApp();
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const meData = await api.getMe();
      setUser(meData.user);
      setStats(meData.stats);
      setCardOfDay(meData.cardOfDay);
      setFavorites(meData.favorites);
      setLatestCard(meData.cardOfDay);

      // Load other endpoints in parallel
      const [cardsData, albumsData, tasksData, shopData] = await Promise.all([
        api.getCards(),
        api.getAlbums(),
        api.getTasks(),
        api.getShopItems(),
      ]);

      setCards(cardsData.cards || []);
      setAlbums(albumsData.albums || []);
      setTasks(tasksData.tasks || []);
      setShopItems(shopData.items || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Leaderboard when entering profile
  useEffect(() => {
    if (currentTab === 'profile') {
      api.getLeaderboard().then(d => setLeaderboard(d.leaderboard || [])).catch(() => {});
    }
    if (currentTab === 'history') {
      api.getHistory().then(d => setTransactions(d.transactions || [])).catch(() => {});
    }
  }, [currentTab]);

  // Handle Mint Card action
  const handleMint = async () => {
    if (isMinting) return;
    setIsMinting(true);

    try {
      const res = await api.mintCard();
      setPendingCard(res.card);
      setShowReel(true);

      // Update user coins
      if (user) {
        setUser({ ...user, coins: res.updatedCoins });
      }
      if (stats) {
        setStats({
          ...stats,
          bomzhCooldownRemaining: res.cooldownRemaining,
          canBomzhMint: res.updatedCoins < 500 && res.cooldownRemaining === 0,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка выпуска карты');
    } finally {
      setIsMinting(false);
    }
  };

  // Animation finish
  const handleReelFinish = () => {
    setShowReel(false);
    if (pendingCard) {
      setLatestCard(pendingCard);
      setCards(prev => [pendingCard, ...prev]);
      setPendingCard(null);
    }
    // Refresh user & tasks data in background
    api.getMe().then(d => {
      setUser(d.user);
      setStats(d.stats);
    });
    api.getTasks().then(d => setTasks(d.tasks || []));
  };

  // Handle Favorite toggle
  const handleToggleFavorite = async (cardId: string) => {
    try {
      const res = await api.toggleFavorite(cardId);
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, is_favorite: res.isFavorite ? 1 : 0 } : c))
      );
      if (latestCard && latestCard.id === cardId) {
        setLatestCard({ ...latestCard, is_favorite: res.isFavorite ? 1 : 0 });
      }
      // Reload favorites
      const meData = await api.getMe();
      setFavorites(meData.favorites);
      setTasks((await api.getTasks()).tasks || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Set Card of Day
  const handleSetCardOfDay = async (cardId: string) => {
    try {
      await api.setCardOfDay(cardId);
      const found = cards.find(c => c.id === cardId);
      if (found) {
        setCardOfDay(found);
      }
      triggerHaptic('success');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Album claim
  const handleClaimAlbum = async (key: string) => {
    try {
      const res = await api.claimAlbum(key);
      if (user) {
        setUser({ ...user, coins: res.updatedCoins });
      }
      setAlbums(prev =>
        prev.map(a => (a.key === key ? { ...a, isClaimed: true } : a))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Task claim
  const handleClaimTask = async (taskId: string) => {
    try {
      const res = await api.claimTask(taskId);
      if (user) {
        setUser({ ...user, coins: res.updatedCoins });
      }
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, is_claimed: 1 } : t))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Buy Stars cosmetic
  const handleBuyCosmetic = async (itemKey: string) => {
    try {
      const res = await api.createInvoice(itemKey);
      if (res.invoiceUrl && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(res.invoiceUrl, (status: string) => {
          if (status === 'paid') {
            triggerHaptic('success');
            loadAllData();
          }
        });
      } else {
        // Simulated / test purchase
        alert(res.message || 'Предмет успешно приобретён!');
        loadAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка покупки');
    }
  };

  // Handle Equip cosmetic
  const handleEquipCosmetic = async (itemKey: string) => {
    try {
      const res = await api.equipCosmetic(itemKey);
      if (user) {
        setUser({
          ...user,
          equippedHolder: res.equipped.holder,
          equippedFrame: res.equipped.frame,
          equippedEffect: res.equipped.effect,
          equippedBg: res.equipped.bg,
        });
      }
      // Update shop items equipped states
      setShopItems(prev =>
        prev.map(item => ({
          ...item,
          isEquipped:
            (item.type === 'holder' && res.equipped.holder === item.key) ||
            (item.type === 'frame' && res.equipped.frame === item.key) ||
            (item.type === 'effect' && res.equipped.effect === item.key) ||
            (item.type === 'bg' && res.equipped.bg === item.key),
        }))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading || !user || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#08090d] text-white space-y-4">
        <Loader2 className="w-10 h-10 text-gold-400 animate-spin" />
        <div className="text-center font-mono space-y-1">
          <p className="font-bold text-sm text-gold-400">BLACK CARDS & VIP PLASTIC</p>
          <p className="text-xs text-white/40">Инициализация защищённого соединения...</p>
        </div>
      </div>
    );
  }

  const isCyberBg = user.equippedBg === 'bg_cyber' || user.equippedBg === 'bundle_deluxe';

  return (
    <div className={`min-h-screen flex flex-col ${isCyberBg ? 'bg-cyber-vault' : ''}`}>
      {/* Top Header & Side Drawer */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        coins={user.coins}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-4 px-3">
        {currentTab === 'mint' && (
          <MintTerminal
            user={user}
            stats={stats}
            latestCard={latestCard}
            onMintClick={handleMint}
            onOpenTasks={() => setCurrentTab('tasks')}
            onOpenCollection={() => setCurrentTab('collection')}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isMinting}
          />
        )}

        {currentTab === 'collection' && (
          <CollectionView
            cards={cards}
            equippedHolder={user.equippedHolder}
            equippedEffect={user.equippedEffect}
            onToggleFavorite={handleToggleFavorite}
            onSetCardOfDay={handleSetCardOfDay}
            cardOfDayId={cardOfDay?.id}
          />
        )}

        {currentTab === 'albums' && (
          <AlbumsView albums={albums} onClaim={handleClaimAlbum} />
        )}

        {currentTab === 'tasks' && (
          <TasksView tasks={tasks} onClaim={handleClaimTask} />
        )}

        {currentTab === 'shop' && (
          <StarsShopView
            items={shopItems}
            sampleCard={latestCard}
            onBuy={handleBuyCosmetic}
            onEquip={handleEquipCosmetic}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            cardOfDay={cardOfDay}
            favorites={favorites}
            leaderboard={leaderboard}
            onOpenCard={card => {
              setLatestCard(card);
              setCurrentTab('mint');
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView transactions={transactions} />
        )}
      </main>

      {/* Reel Digit Spinning Animation Overlay */}
      {showReel && pendingCard && (
        <ReelAnimation
          card={pendingCard}
          isRare={Boolean(pendingCard.isRare)}
          equippedEffect={user.equippedEffect}
          onFinish={handleReelFinish}
        />
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        hapticsEnabled={hapticsEnabled}
        setHapticsEnabled={setHapticsEnabled}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};
