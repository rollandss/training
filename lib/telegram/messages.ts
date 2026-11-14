// Pure helpers for the Telegram bot: no I/O, so they are easy to test.

import type { CalendarStatus } from "@/app/app/calendar/actions";

export const MARK_STATUSES: CalendarStatus[] = ["TRAINING", "STRETCHING", "REST", "SICK"];

const MARK_LABELS: Record<CalendarStatus, string> = {
  TRAINING: "💪 Тренування",
  STRETCHING: "🧘 Розтяжка",
  REST: "😴 Відпочинок",
  SICK: "🤒 Хвороба",
};

export type InlineButton = { text: string; callback_data?: string; url?: string };
export type InlineKeyboard = { inline_keyboard: InlineButton[][] };

/** callback_data format: "mark:<STATUS>:<YYYY-MM-DD>" (max 64 bytes in Telegram, we use ~25). */
export function markCallbackData(status: CalendarStatus, dayKey: string) {
  return `mark:${status}:${dayKey}`;
}

export function parseMarkCallback(data: string): { status: CalendarStatus; dayKey: string } | null {
  const m = /^mark:(TRAINING|STRETCHING|REST|SICK):(\d{4}-\d{2}-\d{2})$/.exec(data);
  if (!m) return null;
  return { status: m[1] as CalendarStatus, dayKey: m[2] };
}

export function markKeyboard(dayKey: string): InlineKeyboard {
  const b = (s: CalendarStatus) => ({ text: MARK_LABELS[s], callback_data: markCallbackData(s, dayKey) });
  return { inline_keyboard: [[b("TRAINING"), b("STRETCHING")], [b("REST"), b("SICK")]] };
}

export function markLabel(status: CalendarStatus) {
  return MARK_LABELS[status];
}

/** Extracts the payload of "/start <code>" (also handles "/start@bot <code>"). */
export function parseStartPayload(text: string): string | null {
  const m = /^\/start(?:@\w+)?(?:\s+(\S+))?\s*$/.exec(text.trim());
  if (!m) return null;
  return m[1] ?? "";
}

export function parseCommand(text: string): string | null {
  const m = /^\/([a-z_]+)(?:@\w+)?(?:\s|$)/i.exec(text.trim());
  return m ? m[1].toLowerCase() : null;
}

/** Telegram HTML parse mode needs these three escaped. */
export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function morningMessage(p: { day: number; total: number; title: string; excerpt: string; url: string }) {
  return [
    `<b>День ${p.day} з ${p.total}</b>`,
    `<b>${escapeHtml(p.title)}</b>`,
    "",
    escapeHtml(p.excerpt),
    "",
    `<a href="${p.url}">Читати пост дня →</a>`,
  ].join("\n");
}

export function eveningMessage(p: { day: number }) {
  return `Як пройшов день ${p.day}? Відміть одним дотиком — календар оновиться сам.`;
}

export const HELP_TEXT = [
  "Я бот «Стоденки». Що вмію:",
  "",
  "/today — пост дня",
  "/mark — відмітити сьогоднішній день",
  "/settings — нагадування",
  "/stop — відʼєднати Telegram від акаунта",
].join("\n");
