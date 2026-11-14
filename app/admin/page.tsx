import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { botUsername, getWebhookInfo, telegramConfigured } from "@/lib/telegram/api";
import { cn } from "@/lib/utils";

import { TelegramSetupCard } from "./telegram-setup-card";

async function loadWebhook() {
  if (!telegramConfigured()) return { url: null, error: null };
  try {
    const info = await getWebhookInfo();
    return { url: info.url || null, error: info.last_error_message ?? null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : "не вдалося отримати статус" };
  }
}

export default async function AdminHomePage() {
  const [users, posts, webhook] = await Promise.all([prisma.user.count(), prisma.dailyPost.count(), loadWebhook()]);

  return (
    <div className="space-y-8">
      <PageHeader title="Адмінка" description="Учасники, їхній прогрес і контент програми." />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Учасники</CardTitle>
            <CardDescription>Прогрес, ролі та відкритий день. Зараз зареєстровано: {users}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/users" className={cn(buttonVariants())}>
              Користувачі
            </Link>
            <Link href="/admin/stats" className={cn(buttonVariants({ variant: "outline" }))}>
              Статистика
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Контент</CardTitle>
            <CardDescription>Щоденні пости і підготовчий блок. Усього постів: {posts}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/posts" className={cn(buttonVariants())}>
              Усі пости
            </Link>
            <Link href="/admin/posts/new" className={cn(buttonVariants({ variant: "outline" }))}>
              Новий пост
            </Link>
          </CardContent>
        </Card>
        <TelegramSetupCard
          configured={telegramConfigured()}
          username={botUsername()}
          webhookUrl={webhook.url}
          lastError={webhook.error}
        />
      </div>
    </div>
  );
}
