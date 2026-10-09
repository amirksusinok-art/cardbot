import { Telegraf, Markup } from 'telegraf';
import { CONFIG, COSMETICS_CATALOG } from './config.js';
import { getDb } from './db.js';
import crypto from 'crypto';

export let bot: Telegraf | null = null;

export function initBot() {
  if (!CONFIG.BOT_TOKEN) {
    console.log('[BOT] BOT_TOKEN is not set. Bot will run in disabled/mock mode.');
    return null;
  }

  bot = new Telegraf(CONFIG.BOT_TOKEN);

  bot.start(async (ctx) => {
    const webAppUrl = CONFIG.RENDER_EXTERNAL_URL || 'https://t.me';
    const welcomeText = 
      `💳 *BLACK CARDS & VIP PLASTIC*\n\n` +
      `Добро пожаловать в элитный клуб коллекционеров виртуальных банковских карт!\n\n` +
      `✨ *Вас ждёт премиальный геймплей:*\n` +
      `• 🎰 *Эффектная анимация:* 12 барабанов цифр вращаются и останавливаются по очереди\n` +
      `• 🏛️ *5 вымышленных банков:* Рубарис, Вельтари, Озевия, Верданор, Норвиан\n` +
      `• 💎 *6 материалов:* пластик, матовый финиш, 24K золото, карбон, титан и голография\n` +
      `• 🔢 *7 категорий красивых номеров:* Pair, Triple, Quad, Straight, Mirror и др.\n` +
      `• 🛡️ *Бесплатный режим «БОМЖ»:* каждые 30 секунд при балансе < 500 Coins\n` +
      `• 🏆 *Коллекция и Альбомы:* собирайте сеты и получайте до +2000 Coins\n` +
      `• ⭐ *Telegram Stars:* покупка эксклюзивных холдеров и неоновых эффектов\n\n` +
      `🎁 *Ваш стартовый бонус:* 1 500 Coins + 1 стартовая VIP карта уже на балансе!\n\n` +
      `👇 *Нажмите кнопку ниже для запуска:*`;

    try {
      await ctx.replyWithMarkdown(welcomeText, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Играть в Black Cards',
                web_app: { url: webAppUrl }
              }
            ],
            [
              { text: '📜 Политика и правила', callback_data: 'cmd_policy' },
              { text: '⭐ Поддержка Stars', callback_data: 'cmd_paysupport' }
            ]
          ]
        }
      });
    } catch (err) {
      console.error('[BOT] Error sending /start reply:', err);
    }
  });

  bot.command('policy', async (ctx) => {
    const policy =
      `📜 *ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ И УСЛОВИЯ*\n\n` +
      `1. *Статус карт:* Все карты являются демонстрационными виртуальными предметами (DEMO) и не привязаны к настоящим финансовым счетам.\n` +
      `2. *Игровая валюта:* Coins — виртуальная непередаваемая валюта для игры. Coins не выводятся в реальные деньги.\n` +
      `3. *Telegram Stars (XTR):* Используются для приобретения фиксированной цифровой косметики (холдеры, рамки, эффекты). Случайных платных наборов (лутбоксов) нет.\n` +
      `4. *Защита данных:* Сервер сохраняет только открытый Telegram ID пользователя для ведения игрового инвентаря. Никакие персональные платёжные данные приложением не собираются.\n` +
      `5. *Контакты поддержки:* @amirksusinok`;
    await ctx.replyWithMarkdown(policy);
  });

  bot.command('terms', async (ctx) => {
    const terms =
      `📜 *Условия обслуживания (Terms of Service)*\n\n` +
      `1. *Игровая валюта:* Coins являются непередаваемой виртуальной валютой без денежного эквивалента.\n` +
      `2. *Коллекционные карты:* Виртуальные карты не предназначены для финансовых операций.\n` +
      `3. *Telegram Stars:* Оплата косметики осуществляется через официальный механизм Telegram Stars (XTR).\n` +
      `4. *Отсутствие передачи:* Карты и косметика навсегда привязаны к вашему аккаунту.`;
    await ctx.replyWithMarkdown(terms);
  });

  bot.action('cmd_policy', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(
      `📜 *Политика конфиденциальности и правила*\n\n` +
      `• Все карты имеют статус DEMO и созданы для коллекционирования.\n` +
      `• Coins не имеют денежной стоимости и начисляются бесплатно за активность.\n` +
      `• Оплата косметики в Telegram Stars регулируется правилами платформы Telegram.\n` +
      `• Поддержка: @amirksusinok`
    );
  });

  bot.action('cmd_terms', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(
      `📜 *Условия использования*\nВсе карты являются коллекционными виртуальными демонстрационными предметами (DEMO).`
    );
  });

  bot.command('paysupport', async (ctx) => {
    const support =
      `⭐ *Поддержка по платежам Telegram Stars*\n\n` +
      `Если у вас возникли вопросы по оплате косметических товаров в магазине Stars:\n` +
      `• Напишите администратору: @amirksusinok\n` +
      `• Укажите ваш Telegram ID и примерное время платежа.\n` +
      `• Все транзакции Stars фиксируются сервером. В случае сбоя предмет выдаётся повторно.`;
    await ctx.replyWithMarkdown(support);
  });

  bot.action('cmd_paysupport', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(
      `⭐ *Поддержка Stars*\nПри любых вопросах обратитесь в службу поддержки: @amirksusinok`
    );
  });

  // Handle Stars PreCheckout
  bot.on('pre_checkout_query', async (ctx) => {
    try {
      await ctx.answerPreCheckoutQuery(true);
    } catch (e) {
      console.error('[BOT] pre_checkout_query error:', e);
      await ctx.answerPreCheckoutQuery(false, 'Ошибка обработки платежа Stars');
    }
  });

  // Handle Successful Payment
  bot.on('successful_payment', async (ctx) => {
    try {
      const payment = ctx.message.successful_payment;
      const payload = payment.invoice_payload; // e.g. itemKey:userId
      const [itemKey, userIdStr] = payload.split(':');
      const userId = Number(userIdStr || ctx.from.id);

      const db = await getDb();
      const item = COSMETICS_CATALOG[itemKey];

      if (item) {
        // Add cosmetic to user
        const cosmeticId = crypto.randomUUID();
        await db.run(
          `INSERT INTO user_cosmetics (id, user_id, item_key, acquired_at) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`,
          [cosmeticId, userId, itemKey, Date.now()]
        );

        // Record transaction
        const txId = crypto.randomUUID();
        await db.run(
          `INSERT INTO transactions (id, user_id, type, amount_coins, amount_stars, telegram_payment_id, description, created_at)
           VALUES (?, ?, 'stars_purchase', 0, ?, ?, ?, ?)`,
          [txId, userId, payment.total_amount, payment.telegram_payment_charge_id, `Покупка Stars: ${item.name}`, Date.now()]
        );

        await ctx.reply(`🎉 Спасибо за покупку! Предмет «${item.name}» успешно добавлен в ваш профиль.`);
      }
    } catch (e) {
      console.error('[BOT] Error processing successful payment:', e);
    }
  });

  bot.launch().then(() => {
    console.log('[BOT] Telegram Bot polling started successfully.');
  }).catch((err) => {
    console.error('[BOT] Failed to launch bot:', err);
  });

  return bot;
}

/**
 * Validate Telegram Mini App initData via HMAC-SHA256
 */
export function validateTelegramInitData(initData: string, botToken: string): { valid: boolean; user?: any } {
  if (!initData || !botToken) {
    return { valid: false };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return { valid: false };

    urlParams.delete('hash');
    const params: string[] = [];
    urlParams.forEach((val, key) => {
      params.push(`${key}=${val}`);
    });
    params.sort();

    const dataCheckString = params.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash === hash) {
      const userStr = urlParams.get('user');
      const user = userStr ? JSON.parse(userStr) : undefined;
      return { valid: true, user };
    }
    return { valid: false };
  } catch (err) {
    return { valid: false };
  }
}
