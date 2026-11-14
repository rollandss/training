"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth";
import { registerBot, telegramConfigured } from "@/lib/telegram/api";

export type TelegramSetupState = { error?: string; ok?: string } | undefined;

async function productionBaseUrl() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function setupTelegramWebhookAction(): Promise<TelegramSetupState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Лише для адміністратора." };
  if (!telegramConfigured() || !process.env.TELEGRAM_WEBHOOK_SECRET) {
    return { error: "Не задані змінні TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME або TELEGRAM_WEBHOOK_SECRET." };
  }
  const base = await productionBaseUrl();
  if (base.startsWith("http://")) return { error: "Telegram приймає лише https-адресу. Запусти це на продакшені." };
  try {
    const url = await registerBot(base);
    revalidatePath("/admin");
    return { ok: `Вебхук підключено: ${url}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося підключити бота." };
  }
}
