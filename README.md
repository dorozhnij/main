## dmtrgrad-masterplan

Лендинг с интерактивной картой.

### Структура

- `frontend/`: Next.js 15 + TypeScript + Tailwind CSS + MapLibre GL JS
- `backend/`: Node.js API (Express)
- `docker-compose.yml`: запуск фронтенда и бэкенда вместе

### Быстрый старт (Docker)

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend healthcheck: `http://localhost:4000/health`
- Postgres/PostGIS: `localhost:5432` (контейнерный хост: `postgres:5432`)

### Продакшен-запуск (Docker)

1. Скопируйте переменные окружения:

```bash
cp .env.prod.example .env
```

2. Убедитесь, что DNS домена указывает на ваш сервер (A-запись), и откройте порты `80` и `443` в фаерволе.

3. Заполните значения в `.env` (минимум: `SITE_DOMAIN`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`).

4. Запустите production-стек:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

5. Проверка:

- Frontend: `https://<ваш-домен>`
- Backend healthcheck: `https://<ваш-домен>/health`
- Export CSV: `https://<ваш-домен>/api/export?format=csv`

> В production используется reverse proxy на Caddy (`Caddyfile`): фронтенд и бэкенд доступны только через HTTPS-домен, а API проксируется по пути `/api/*`.

`backend-seed` используется только в dev-стеке (`docker-compose.yml`) и не входит в production-compose.

### Локальный старт (без Docker)

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

### Миграции и seed-данные

#### Пошагово: что ввести в терминал (обновить тестовые точки на карте)

**Если проект на компьютере без Docker** (у вас уже запущен PostgreSQL и backend хотя бы раз подключался к базе):

1. Откройте приложение «Терминал» (macOS) или аналог.
2. Перейдите в папку backend (подставьте свой путь к проекту):

   ```bash
   cd ~/Desktop/dmtrgrad-masterplan/backend
   ```

3. Нажмите **Enter** — команда выполнится.
4. Запустите seed (одной строкой, затем снова **Enter**):

   ```bash
   npm run seed
   ```

5. Дождитесь строки вроде `Seeded 3 test ideas` без ошибок.
6. В браузере обновите страницу с картой (**Cmd+R** или **F5**).

**Если используете Docker** (уже хотя бы раз делали `docker compose up`, Postgres работает):

1. Откройте терминал.
2. Перейдите в **корень** репозитория (где лежит `docker-compose.yml`):

   ```bash
   cd ~/Desktop/dmtrgrad-masterplan
   ```

3. Нажмите **Enter**.
4. Выполните (скопируйте целиком, **Enter**):

   ```bash
   docker compose run --rm backend-seed
   ```

5. Дождитесь окончания без ошибок.
6. Обновите страницу с картой в браузере.

Если команда `docker compose` не найдена, попробуйте `docker-compose` (с дефисом) — зависит от версии Docker.

---

Миграции (создание расширений PostGIS/pgcrypto и таблицы `user_ideas`) запускаются автоматически при старте backend.

Также можно запустить вручную:

```bash
cd backend
npm run migrate
```

#### Что делает seed

Скрипт [`backend/src/db/seed.ts`](backend/src/db/seed.ts):

1. Вызывает миграции (если таблицы еще не готовы).
2. **Удаляет все строки** из `user_ideas` (включая идеи жителей).
3. Вставляет **три** одобренные (`approved`) демо-идеи с фиксированными координатами; в БД у них `is_seed_demo = true` (служебный флаг, в API не отдается). Заголовки на карте без префикса «TEST:».

После изменения текстов или координат в `seed.ts` базу нужно обновить повторным запуском seed (см. ниже).

#### Обновить БД локально (без Docker)

1. Убедитесь, что PostgreSQL запущен и в `backend/.env` (или в окружении) задан корректный `DATABASE_URL`, например:  
   `postgresql://app:app@localhost:5432/app`
2. Из каталога backend:

```bash
cd backend
npm install   # при первом клоне
npm run seed
```

В консоли должно появиться сообщение вида `Seeded 3 test ideas`. Перезапускать сам API не обязательно: карта при следующем запросе к `/api/ideas` получит новые данные.

#### Обновить БД в Docker

При первом `docker compose up` сервис **`backend-seed`** один раз выполняет `npm run migrate && npm run seed` и завершается.

Чтобы **еще раз** прогнать seed после правок в `seed.ts` (или чтобы обновить тестовые точки):

1. Остановите стек не обязательно; достаточно, чтобы контейнер `postgres` был запущен и здоров.
2. В корне репозитория выполните одно из:

```bash
# вариант A: разовый контейнер с тем же образом и томом node_modules, что у backend
docker compose run --rm backend-seed
```

Если сервис называется иначе в вашем `docker-compose.yml`, используйте имя сервиса, у которого в `command` есть `npm run seed` (в этом проекте — **`backend-seed`**).

**Важно:** `docker compose run backend-seed` заново выполнит и миграции, и seed. Seed **очистит всю таблицу** `user_ideas` и вставит три демо-точки.

3. Обновите страницу с картой во фронтенде (при необходимости сбросьте кэш браузера).

Если `docker compose run` недоступен, можно временно поднять только postgres и выполнить seed с хоста, указав `DATABASE_URL` на порт проброшенного Postgres (например `localhost:5432`), как в разделе «локально» выше.

### Проверка сборки

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

### Переменные окружения

- `backend`:
  - `PORT` (по умолчанию `4000`)
  - `DATABASE_URL` (например: `postgresql://app:app@localhost:5432/app`)
- `frontend`:
  - `NEXT_PUBLIC_API_BASE_URL` (по умолчанию `http://localhost:4000`)

### Примеры API-запросов

Файл с примерами запросов: `examples/api-examples.http`.

### Выгрузка точек для заказчика

Одобренные идеи хранятся в PostgreSQL в таблице `user_ideas` (поле `location` — PostGIS `geometry`). Для выгрузки без SQL у backend уже есть эндпоинт **`GET /api/export`**: параметр `format=csv` или `format=geojson` (по умолчанию GeoJSON). На хостинге откройте в браузере или через `curl`, подставив ваш домен, например `https://xn--80addcduaf0adsfzdz.xn--p1ai/api/export?format=csv`.

