# 🎨 Руководство по оформлению бота в Telegram (@BotFather) и деплою на Render

Это полное пошаговое руководство по созданию, визуальному оформлению бота в Telegram и его публикации на Render.

---

## Часть 1. Создание и оформление бота через @BotFather

Откройте диалог с официальным ботом [@BotFather](https://t.me/BotFather) в Telegram.

### 1. Создание бота
Отправьте команду:
```text
/newbot
```
1. **Имя бота (Name):**  
   Введите: `Black Cards | VIP Plastic`
2. **Юзернейм (Username):**  
   Введите уникальный юзернейм, заканчивающийся на `bot`, например:  
   `BlackCardsVipBot` или `VipCardsCollectorBot`
3. Скопируйте полученный **HTTP API Token** (вида `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`). Он понадобится в переменной `BOT_TOKEN`.

---

### 2. Оформление текста описания (Description)
Этот текст показывается новым пользователям на экране до нажатия кнопки «Запустить»:
Отправьте в @BotFather:
```text
/setdescription
```
Выберите вашего бота и отправьте следующий текст:

```text
💳 Black Cards & VIP Plastic — элитный клуб коллекционеров виртуальных банковских карт!

✨ В игре вас ждут:
• Эффектная анимация вращения и последовательной остановки цифр
• 5 уникальных игровых банков: Рубарис, Вельтари, Озевия, Верданор, Норвиан
• 6 премиальных материалов: пластик, матовый финиш, 24K золото, карбон, титан и голография
• 7 категорий красивых номеров: Pair, Triple, Straight, Mirror и другие
• Бесплатный режим «БОМЖ» при нулевом балансе
• Тематические альбомы, задания и витрина профиля

Жми «Запустить», чтобы открыть терминал и выпустить свою первую карту!
```

---

### 3. Оформление раздела «О боте» (About text)
Этот краткий текст отображается в профиле бота под аватаром:
Отправьте в @BotFather:
```text
/setabouttext
```
Выберите бота и отправьте:
```text
💳 Коллекционная игра о виртуальных VIP картах, редких материалах и красивых номерах.
```

---

### 4. Аватар бота (Botpic)
Отправьте в @BotFather:
```text
/setuserpic
```
Отправьте квадратное изображение высокого качества (1024x1024 px).

💡 **Промпт для генерации аватара в Midjourney / DALL-E / Nano Banana:**
> *Square icon, ultra luxurious black matte bank card with 24K gold foil embossed chip and sleek metallic edges, glowing neon accents, dark graphite carbon background, high-end 3D product render, octane render, 8k, minimalistic premium aesthetic.*

---

### 5. Настройка кнопки меню (Menu Button / Web App)
Чтобы пользователи могли запускать Mini App в один клик прямо из левого нижнего угла чата:
1. В @BotFather отправьте:
   ```text
   /setmenubutton
   ```
2. Выберите вашего бота.
3. Отправьте URL вашего веб-приложения на Render:
   `https://ВАШ-СЕРВИС.onrender.com`
4. Введите текст для кнопки:
   `💳 Играть`

---

### 6. Настройка команд бота (Commands)
Отправьте в @BotFather:
```text
/setcommands
```
Выберите вашего бота и отправьте список:
```text
start - Запустить терминал Black Cards
policy - Политика конфиденциальности и правила
terms - Условия использования (Terms of Service)
paysupport - Поддержка по платежам Telegram Stars (@stena10)
```

---

## Часть 2. Деплой на Render

Репозиторий готов к развёртыванию на Render как единый сервис со встроенной поддержкой Render PostgreSQL.

### Способ А: Через Render Blueprint (1 клик)
1. Зайдите на [render.com](https://render.com) и войдите через GitHub.
2. Нажмите **New +** → **Blueprint**.
3. Выберите репозиторий `amirksusinok-art/cardbot`.
4. Render автоматически прочитает файл [render.yaml](file:///c:/Users/%D0%9F%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C/Desktop/cardbot/render.yaml) и создаст:
   - **Web Service** (`black-cards-vip`)
   - **PostgreSQL Database** (`cardbot-db`)
5. В поле переменной `BOT_TOKEN` вставьте токен от BotFather.
6. Нажмите **Apply**.

### Способ Б: Ручное создание Web Service
1. Нажмите **New +** → **Web Service**.
2. Подключите репозиторий `amirksusinok-art/cardbot`.
3. Настройки сервиса:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `BOT_TOKEN`: ваш токен от BotFather
   - `RENDER_EXTERNAL_URL`: URL созданного сервиса (например, `https://cardbot.onrender.com`)
   - `DATABASE_URL`: (если подключили Render Postgres — ссылка подключения, если нет — приложение будет использовать локальную базу).
5. Нажмите **Deploy Web Service**.
