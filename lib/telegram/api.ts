import "server-only";

import { createHash } from "node:crypto";

import type { InlineKeyboard } from "./messages";

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME);
}

export function botUsername() {
  return (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "");
}

async function call<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { ok: boolean; result?: T; description?: string } | null;
  if (!json?.ok) {
    const err = new Error(`Telegram ${method} failed: ${json?.description ?? res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return json.result as T;
}

export function sendMessage(chatId: string, text: string, keyboard?: InlineKeyboard) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

export function editMessageText(chatId: string, messageId: number, text: string, keyboard?: InlineKeyboard) {
  return call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

export function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return call("answerCallbackQuery", { callback_query_id: callbackQueryId, ...(text ? { text } : {}) });
}

/** 403 means the user blocked the bot — we should unlink them. */
export function isBlockedError(e: unknown) {
  return (e as { status?: number })?.status === 403;
}

export type WebhookInfo = { url: string; pending_update_count: number; last_error_message?: string; last_error_date?: number };

export function getWebhookInfo() {
  return call<WebhookInfo>("getWebhookInfo", {});
}

export const BOT_COMMANDS = [
  { command: "today", description: "Пост дня" },
  { command: "mark", description: "Відмітити сьогоднішній день" },
  { command: "settings", description: "Нагадування" },
  { command: "stop", description: "Відʼєднати Telegram" },
];

/**
 * Telegram only accepts [A-Za-z0-9_-] in secret_token, so we send a hash of the
 * configured secret instead of the raw value. Any secret string works this way.
 */
export function webhookSecretToken() {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) return null;
  return createHash("sha256").update(secret).digest("hex");
}

/** Points Telegram at our webhook and publishes the command menu. Token never leaves the server. */
export async function registerBot(baseUrl: string) {
  const secret = webhookSecretToken();
  if (!secret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not set or shorter than 16 characters");
  const url = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;
  await call("setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  await call("setMyCommands", { commands: BOT_COMMANDS });
  return url;
}
