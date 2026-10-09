import express from 'express';
import crypto from 'crypto';
import { getDb } from './db.js';
import { CONFIG, COSMETICS_CATALOG, ALBUMS_CONFIG } from './config.js';
import { generateCard } from './gameLogic.js';
import { bot, validateTelegramInitData } from './bot.js';

export const router = express.Router();

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Middleware or helper to get user from telegram initData or fallback mock user for browser dev
 */
async function getOrCreateUser(req: express.Request): Promise<any> {
  const initData = (req.headers['x-telegram-init-data'] as string) || '';
  const db = await getDb();
  let tgId: number = 777000;
  let username = 'Collector_VIP';
  let firstName = 'VIP Player';
  let photoUrl = '';

  if (initData && CONFIG.BOT_TOKEN) {
    const verified = validateTelegramInitData(initData, CONFIG.BOT_TOKEN);
    if (verified.valid && verified.user) {
      tgId = verified.user.id;
      username = verified.user.username || `user_${tgId}`;
      firstName = verified.user.first_name || 'Collector';
      photoUrl = verified.user.photo_url || '';
    }
  } else if (req.query.dev_id) {
    tgId = Number(req.query.dev_id) || 777000;
    username = (req.query.dev_user as string) || `dev_${tgId}`;
  }

  // Look up user in DB
  let user = await db.get(`SELECT * FROM users WHERE telegram_id = ?`, [tgId]);

  if (!user) {
    const now = Date.now();
    await db.run(
      `INSERT INTO users (telegram_id, username, first_name, photo_url, coins, free_mint_available_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [tgId, username, firstName, photoUrl, CONFIG.INITIAL_COINS, now, now]
    );

    // Give 1 starter card
    const starterCard = generateCard(false);
    const starterCardId = crypto.randomUUID();
    await db.run(
      `INSERT INTO cards (id, user_id, card_number, collection_code, expiry_date, bank, material, category, score, is_favorite, is_bomzh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
      [
        starterCardId,
        tgId,
        starterCard.cardNumber,
        starterCard.collectionCode,
        starterCard.expiryDate,
        starterCard.bank,
        starterCard.material,
        starterCard.category,
        starterCard.score,
        now
      ]
    );

    // Set starter card as card of day
    await db.run(`UPDATE users SET card_of_day_id = ? WHERE telegram_id = ?`, [starterCardId, tgId]);

    // Initial tasks
    await ensureDailyTasks(tgId);

    user = await db.get(`SELECT * FROM users WHERE telegram_id = ?`, [tgId]);
  } else {
    // Ensure daily tasks exist for today
    await ensureDailyTasks(tgId);
  }

  return user;
}

async function ensureDailyTasks(userId: number) {
  const db = await getDb();
  const today = getTodayString();
  const existing = await db.query(`SELECT * FROM tasks WHERE user_id = ? AND task_date = ?`, [userId, today]);

  if (existing.length === 0) {
    // 1. Daily Login (+50 coins)
    await db.run(
      `INSERT INTO tasks (id, user_id, task_key, title, reward_coins, progress, target, is_claimed, task_date)
       VALUES (?, ?, 'daily_login', 'Войти в игру', 50, 1, 1, 0, ?)`,
      [crypto.randomUUID(), userId, today]
    );

    // 2. Mint 3 cards (+150 coins)
    await db.run(
      `INSERT INTO tasks (id, user_id, task_key, title, reward_coins, progress, target, is_claimed, task_date)
       VALUES (?, ?, 'mint_three', 'Выпустить три карты любым способом', 150, 0, 3, 0, ?)`,
      [crypto.randomUUID(), userId, today]
    );

    // 3. Daily quest (+300 coins)
    await db.run(
      `INSERT INTO tasks (id, user_id, task_key, title, reward_coins, progress, target, is_claimed, task_date)
       VALUES (?, ?, 'daily_quest', 'Задание дня: Добавить карту в избранное', 300, 0, 1, 0, ?)`,
      [crypto.randomUUID(), userId, today]
    );
  }
}

// GET /api/me
router.get('/me', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();

    // Count user cards
    const cardCountRow = await db.get(`SELECT COUNT(*) as count FROM cards WHERE user_id = ?`, [user.telegram_id]);
    const totalCards = cardCountRow ? Number(cardCountRow.count) : 0;

    // Card of the day
    let cardOfDay = null;
    if (user.card_of_day_id) {
      cardOfDay = await db.get(`SELECT * FROM cards WHERE id = ?`, [user.card_of_day_id]);
    }
    if (!cardOfDay) {
      cardOfDay = await db.get(`SELECT * FROM cards WHERE user_id = ? ORDER BY score DESC LIMIT 1`, [user.telegram_id]);
    }

    // Favorite cards
    const favorites = await db.query(
      `SELECT * FROM cards WHERE user_id = ? AND is_favorite = 1 LIMIT 5`,
      [user.telegram_id]
    );

    // Tasks summary
    const today = getTodayString();
    const tasks = await db.query(
      `SELECT * FROM tasks WHERE user_id = ? AND task_date = ?`,
      [user.telegram_id, today]
    );
    const completedTasksCount = tasks.filter((t: any) => t.progress >= t.target).length;

    // Owned cosmetics
    const ownedCosmetics = await db.query(
      `SELECT item_key FROM user_cosmetics WHERE user_id = ?`,
      [user.telegram_id]
    );
    const ownedKeys = ownedCosmetics.map((c: any) => c.item_key);

    const now = Date.now();
    const freeMintAvailableAt = Number(user.free_mint_available_at || 0);
    const bomzhCooldownRemaining = Math.max(0, Math.ceil((freeMintAvailableAt - now) / 1000));

    res.json({
      user: {
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        coins: user.coins,
        equippedHolder: user.equipped_holder,
        equippedFrame: user.equipped_frame,
        equippedEffect: user.equipped_effect,
        equippedBg: user.equipped_bg,
      },
      stats: {
        totalCards,
        completedTasksCount,
        totalTasksCount: tasks.length,
        bomzhCooldownRemaining,
        canBomzhMint: user.coins < CONFIG.MINT_COST && bomzhCooldownRemaining === 0,
      },
      cardOfDay,
      favorites,
      ownedCosmetics: ownedKeys,
    });
  } catch (err: any) {
    console.error('Error in /api/me:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cards/mint
router.post('/cards/mint', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const now = Date.now();
    const cost = CONFIG.MINT_COST;

    let isBomzh = false;

    if (user.coins >= cost) {
      // Normal Mint: deduct 500 Coins
      await db.run(
        `UPDATE users SET coins = coins - ?, updated_at = ? WHERE telegram_id = ?`,
        [cost, now, user.telegram_id]
      );

      // Record transaction
      await db.run(
        `INSERT INTO transactions (id, user_id, type, amount_coins, amount_stars, description, created_at)
         VALUES (?, ?, 'mint_card', ?, 0, 'Выпуск карты (500 Coins)', ?)`,
        [crypto.randomUUID(), user.telegram_id, -cost, now]
      );
    } else {
      // Free BOMZH mode
      const freeMintAvailableAt = Number(user.free_mint_available_at || 0);
      if (now < freeMintAvailableAt) {
        const remaining = Math.ceil((freeMintAvailableAt - now) / 1000);
        return res.status(400).json({
          error: `Режим «БОМЖ» на перезарядке. Попробуйте через ${remaining} сек.`
        });
      }

      isBomzh = true;
      const nextAvailableAt = now + CONFIG.BOMZH_COOLDOWN_SECONDS * 1000;
      await db.run(
        `UPDATE users SET free_mint_available_at = ?, updated_at = ? WHERE telegram_id = ?`,
        [nextAvailableAt, now, user.telegram_id]
      );

      await db.run(
        `INSERT INTO transactions (id, user_id, type, amount_coins, amount_stars, description, created_at)
         VALUES (?, ?, 'bomzh_mint', 0, 0, 'Бесплатный выпуск карты (режим БОМЖ)', ?)`,
        [crypto.randomUUID(), user.telegram_id, now]
      );
    }

    // Generate Card
    const cardData = generateCard(isBomzh);
    const cardId = crypto.randomUUID();

    await db.run(
      `INSERT INTO cards (id, user_id, card_number, collection_code, expiry_date, bank, material, category, score, is_favorite, is_bomzh, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        cardId,
        user.telegram_id,
        cardData.cardNumber,
        cardData.collectionCode,
        cardData.expiryDate,
        cardData.bank,
        cardData.material,
        cardData.category,
        cardData.score,
        isBomzh ? 1 : 0,
        now
      ]
    );

    // Update tasks progress (e.g. mint_three)
    const today = getTodayString();
    await db.run(
      `UPDATE tasks SET progress = MIN(target, progress + 1)
       WHERE user_id = ? AND task_date = ? AND task_key = 'mint_three'`,
      [user.telegram_id, today]
    );

    // Get fresh user balance
    const updatedUser = await db.get(`SELECT coins, free_mint_available_at FROM users WHERE telegram_id = ?`, [user.telegram_id]);
    const cooldownRemaining = isBomzh ? CONFIG.BOMZH_COOLDOWN_SECONDS : 0;

    res.json({
      card: {
        id: cardId,
        ...cardData,
        createdAt: now,
      },
      updatedCoins: updatedUser.coins,
      isBomzh,
      cooldownRemaining,
    });
  } catch (err: any) {
    console.error('Error in /api/cards/mint:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cards
router.get('/cards', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const bankFilter = req.query.bank as string;
    const materialFilter = req.query.material as string;
    const categoryFilter = req.query.category as string;
    const favoritesOnly = req.query.favorites === 'true';

    let query = `SELECT * FROM cards WHERE user_id = ?`;
    const params: any[] = [user.telegram_id];

    if (bankFilter) {
      query += ` AND bank = ?`;
      params.push(bankFilter);
    }
    if (materialFilter) {
      query += ` AND material = ?`;
      params.push(materialFilter);
    }
    if (categoryFilter) {
      query += ` AND category = ?`;
      params.push(categoryFilter);
    }
    if (favoritesOnly) {
      query += ` AND is_favorite = 1`;
    }

    query += ` ORDER BY created_at DESC`;

    const cards = await db.query(query, params);
    res.json({ cards });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cards/:id/favorite
router.post('/cards/:id/favorite', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const cardId = req.params.id;

    const card = await db.get(`SELECT * FROM cards WHERE id = ? AND user_id = ?`, [cardId, user.telegram_id]);
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });

    const newFav = card.is_favorite ? 0 : 1;

    if (newFav === 1) {
      const favCountRow = await db.get(
        `SELECT COUNT(*) as count FROM cards WHERE user_id = ? AND is_favorite = 1`,
        [user.telegram_id]
      );
      if (favCountRow && favCountRow.count >= 5) {
        return res.status(400).json({ error: 'Можно закрепить максимум 5 избранных карт' });
      }

      // Mark daily quest progress if active
      const today = getTodayString();
      await db.run(
        `UPDATE tasks SET progress = 1 WHERE user_id = ? AND task_date = ? AND task_key = 'daily_quest'`,
        [user.telegram_id, today]
      );
    }

    await db.run(`UPDATE cards SET is_favorite = ? WHERE id = ?`, [newFav, cardId]);
    res.json({ success: true, isFavorite: newFav === 1 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cards/:id/card-of-day
router.post('/cards/:id/card-of-day', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const cardId = req.params.id;

    const card = await db.get(`SELECT * FROM cards WHERE id = ? AND user_id = ?`, [cardId, user.telegram_id]);
    if (!card) return res.status(404).json({ error: 'Карта не найдена' });

    await db.run(`UPDATE users SET card_of_day_id = ? WHERE telegram_id = ?`, [cardId, user.telegram_id]);
    res.json({ success: true, cardOfDayId: cardId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/albums
router.get('/albums', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();

    const userCards = await db.query(`SELECT bank, material, category FROM cards WHERE user_id = ?`, [user.telegram_id]);
    const claimedAlbums = await db.query(`SELECT album_key FROM albums WHERE user_id = ? AND is_claimed = 1`, [user.telegram_id]);
    const claimedKeys = new Set(claimedAlbums.map((a: any) => a.album_key));

    const albums = ALBUMS_CONFIG.map((album) => {
      const { current, total, isCompleted } = album.check(userCards);
      const isClaimed = claimedKeys.has(album.key);
      return {
        key: album.key,
        name: album.name,
        description: album.description,
        rewardCoins: album.rewardCoins,
        current,
        total,
        isCompleted,
        isClaimed,
      };
    });

    res.json({ albums });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/albums/:key/claim
router.post('/albums/:key/claim', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const albumKey = req.params.key;

    const albumConf = ALBUMS_CONFIG.find(a => a.key === albumKey);
    if (!albumConf) return res.status(404).json({ error: 'Альбом не найден' });

    const alreadyClaimed = await db.get(
      `SELECT * FROM albums WHERE user_id = ? AND album_key = ? AND is_claimed = 1`,
      [user.telegram_id, albumKey]
    );
    if (alreadyClaimed) {
      return res.status(400).json({ error: 'Награда за этот альбом уже получена' });
    }

    const userCards = await db.query(`SELECT bank, material, category FROM cards WHERE user_id = ?`, [user.telegram_id]);
    const { isCompleted } = albumConf.check(userCards);

    if (!isCompleted) {
      return res.status(400).json({ error: 'Условия альбома ещё не выполнены' });
    }

    const now = Date.now();
    await db.run(
      `INSERT INTO albums (id, user_id, album_key, is_claimed, claimed_at) VALUES (?, ?, ?, 1, ?)`,
      [crypto.randomUUID(), user.telegram_id, albumKey, now]
    );

    await db.run(
      `UPDATE users SET coins = coins + ?, updated_at = ? WHERE telegram_id = ?`,
      [albumConf.rewardCoins, now, user.telegram_id]
    );

    await db.run(
      `INSERT INTO transactions (id, user_id, type, amount_coins, amount_stars, description, created_at)
       VALUES (?, ?, 'album_reward', ?, 0, ?, ?)`,
      [crypto.randomUUID(), user.telegram_id, albumConf.rewardCoins, `Награда за альбом: ${albumConf.name}`, now]
    );

    const updatedUser = await db.get(`SELECT coins FROM users WHERE telegram_id = ?`, [user.telegram_id]);
    res.json({ success: true, rewardCoins: albumConf.rewardCoins, updatedCoins: updatedUser.coins });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks
router.get('/tasks', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const today = getTodayString();
    await ensureDailyTasks(user.telegram_id);

    const tasks = await db.query(`SELECT * FROM tasks WHERE user_id = ? AND task_date = ?`, [user.telegram_id, today]);
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:id/claim
router.post('/tasks/:id/claim', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const taskId = req.params.id;

    const task = await db.get(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`, [taskId, user.telegram_id]);
    if (!task) return res.status(404).json({ error: 'Задание не найдено' });

    if (task.is_claimed) {
      return res.status(400).json({ error: 'Награда уже получена' });
    }
    if (task.progress < task.target) {
      return res.status(400).json({ error: 'Задание ещё не завершено' });
    }

    const now = Date.now();
    await db.run(`UPDATE tasks SET is_claimed = 1 WHERE id = ?`, [taskId]);
    await db.run(`UPDATE users SET coins = coins + ?, updated_at = ? WHERE telegram_id = ?`, [task.reward_coins, now, user.telegram_id]);

    await db.run(
      `INSERT INTO transactions (id, user_id, type, amount_coins, amount_stars, description, created_at)
       VALUES (?, ?, 'task_reward', ?, 0, ?, ?)`,
      [crypto.randomUUID(), user.telegram_id, task.reward_coins, `Награда за задание: ${task.title}`, now]
    );

    const updatedUser = await db.get(`SELECT coins FROM users WHERE telegram_id = ?`, [user.telegram_id]);
    res.json({ success: true, rewardCoins: task.reward_coins, updatedCoins: updatedUser.coins });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/items
router.get('/shop/items', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();

    const owned = await db.query(`SELECT item_key FROM user_cosmetics WHERE user_id = ?`, [user.telegram_id]);
    const ownedSet = new Set(owned.map((o: any) => o.item_key));

    const items = Object.values(COSMETICS_CATALOG).map(item => ({
      ...item,
      isOwned: ownedSet.has(item.key),
      isEquipped:
        (item.type === 'holder' && user.equipped_holder === item.key) ||
        (item.type === 'frame' && user.equipped_frame === item.key) ||
        (item.type === 'effect' && user.equipped_effect === item.key) ||
        (item.type === 'bg' && user.equipped_bg === item.key),
    }));

    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/equip
router.post('/shop/equip', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();
    const { itemKey } = req.body;

    const item = COSMETICS_CATALOG[itemKey];
    if (!item) return res.status(404).json({ error: 'Товар не найден' });

    // Check ownership
    const owned = await db.get(
      `SELECT * FROM user_cosmetics WHERE user_id = ? AND item_key = ?`,
      [user.telegram_id, itemKey]
    );
    if (!owned && item.key !== 'bundle_deluxe') {
      return res.status(403).json({ error: 'Предмет не приобретён' });
    }

    let field = '';
    if (item.type === 'holder') field = 'equipped_holder';
    if (item.type === 'frame') field = 'equipped_frame';
    if (item.type === 'effect') field = 'equipped_effect';
    if (item.type === 'bg') field = 'equipped_bg';

    if (item.type === 'bundle') {
      // Equip all bundled items
      await db.run(
        `UPDATE users SET equipped_holder = 'holder_vip', equipped_frame = 'frame_gold', equipped_effect = 'effect_matrix', equipped_bg = 'bg_cyber' WHERE telegram_id = ?`,
        [user.telegram_id]
      );
    } else if (field) {
      // Toggle or equip
      const currentVal = user[field];
      const newVal = currentVal === itemKey ? null : itemKey;
      await db.run(`UPDATE users SET ${field} = ? WHERE telegram_id = ?`, [newVal, user.telegram_id]);
    }

    const updatedUser = await db.get(`SELECT * FROM users WHERE telegram_id = ?`, [user.telegram_id]);
    res.json({
      success: true,
      equipped: {
        holder: updatedUser.equipped_holder,
        frame: updatedUser.equipped_frame,
        effect: updatedUser.equipped_effect,
        bg: updatedUser.equipped_bg,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/invoice (Telegram Stars Invoice)
router.post('/shop/invoice', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const { itemKey } = req.body;
    const item = COSMETICS_CATALOG[itemKey];

    if (!item) return res.status(404).json({ error: 'Товар не найден' });

    if (bot && CONFIG.BOT_TOKEN) {
      // Generate official Telegram Stars invoice link
      try {
        const link = await bot.telegram.createInvoiceLink({
          title: item.name,
          description: item.description,
          payload: `${item.key}:${user.telegram_id}`,
          currency: 'XTR',
          prices: [{ label: item.name, amount: item.priceStars }],
          provider_token: '', // empty for Telegram Stars (XTR)
        });
        return res.json({ invoiceUrl: link });
      } catch (invoiceErr: any) {
        console.error('[STARS] createInvoiceLink error:', invoiceErr);
      }
    }

    // In local dev / demo without bot credentials, simulate instant purchase for seamless testing
    const db = await getDb();
    const cosmeticId = crypto.randomUUID();
    await db.run(
      `INSERT OR IGNORE INTO user_cosmetics (id, user_id, item_key, acquired_at) VALUES (?, ?, ?, ?)`,
      [cosmeticId, user.telegram_id, itemKey, Date.now()]
    );
    res.json({ simulated: true, message: `[DEMO] Предмет «${item.name}» успешно разблокирован!` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = await getDb();
    const topUsers = await db.query(`
      SELECT 
        u.telegram_id,
        u.username,
        u.first_name,
        u.equipped_frame,
        COUNT(c.id) as card_count,
        COALESCE(SUM(c.score), 0) as total_score
      FROM users u
      LEFT JOIN cards c ON c.user_id = u.telegram_id
      GROUP BY u.telegram_id
      ORDER BY total_score DESC
      LIMIT 20
    `);

    res.json({ leaderboard: topUsers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history
router.get('/history', async (req, res) => {
  try {
    const user = await getOrCreateUser(req);
    const db = await getDb();

    const transactions = await db.query(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [user.telegram_id]
    );

    res.json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
