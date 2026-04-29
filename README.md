# Сотка — 100 днів (веб)

Next.js + Prisma (SQLite) + shadcn/ui. Веб-версія наразі сфокусована тільки на інфо-постах: щодня відкривається один пост, плюс є адмінка для створення та редагування постів.

## Локальний запуск

1. Скопіюйте змінні середовища:

```bash
cp .env.example .env
```

2. Міграції та seed (програма `100-dniv`, щоденні пости, акаунт адміна):

```bash
npx prisma migrate dev
npx prisma db seed
```

3. Дев-сервер:

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
