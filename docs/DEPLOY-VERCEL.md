# Деплой на Vercel

## 1) Підключення репозиторію

- Імпортуй проект у Vercel.
- Framework: Next.js (автовизначиться).

## 2) Build command

Рекомендовано виставити **Build Command**:

- `npm run vercel-build`

Це зробить:

- `prisma generate`
- `prisma migrate deploy`
- `next build`

Після першого деплою (або якщо в БД немає контенту) один раз виконай seed:

```bash
npx prisma db seed
```

`vercel-build` seed не запускає, тому без цього кроку таблиці можуть бути порожніми, навіть якщо міграції вже застосовані.

## 3) Environment Variables (обовʼязково)

Мінімум:

- `DATABASE_URL`
- `DIRECT_URL` (рекомендовано/часто потрібно для міграцій)
- `SESSION_SECRET`
- `PUBLIC_BASE_URL`

Для email-сповіщень (опц.):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `CRON_TOKEN` (опц., якщо запускати cron НЕ через Vercel Cron)

## 4) Vercel Cron (опц.)

У репозиторії є `vercel.json`, який створює cron виклик:

- `GET /api/cron/daily-email` щодня о 07:00 UTC

Endpoint дозволяє виклики від Vercel Cron через заголовок `x-vercel-cron: 1`, тому **секрет не потрібно вшивати в URL**.

## 5) База даних (Postgres)

Для Vercel потрібна керована БД. Проект налаштований під **Postgres**.

Рекомендовано:

- `DATABASE_URL` — pooled/основне підключення (провайдер БД може дати “pooled” URL)
- `DIRECT_URL` — direct/non-pooled підключення (для міграцій)

## 6) Prisma 7 (важливо)

У Prisma 7:

- URL підключення для CLI береться з `prisma.config.ts`
- Runtime-клієнт використовує драйвер-адаптер (`@prisma/adapter-pg`)

Приклади формату:

- `postgresql://user:pass@host:5432/db?schema=public`

