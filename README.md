# Стоденка — 100 днів (веб)

Next.js + Prisma (SQLite) + shadcn/ui. Веб-версія — календар + лог тренувань (кола/повтори), плюс адмінка для інфо-постів.

## Локальний запуск (Postgres)

1. Скопіюйте змінні середовища:

```bash
cp .env.example .env
```

2. Запустіть Postgres (Docker):

```bash
docker compose up -d
```

3. Міграції та seed (програма `100-dniv`, щоденні пости, акаунт адміна):

```bash
npx prisma migrate dev
npx prisma db seed
```

4. Дев-сервер:

```bash
npm run dev
```

- Користувач: реєстрація на `/auth/register`.
- Кабінет користувача: `/app` і `/app/posts`.
- Адмінка постів: `/admin/posts`.
- Адмін після seed: `admin@local` / пароль з `.env` (`ADMIN_SEED_PASSWORD`) або `admin-admin-CHANGE`.

## Корисні команди

- `npm run db:studio` — Prisma Studio.
- `npm run build` — продакшн-збірка.

Документація продукту: каталог `docs/`.
