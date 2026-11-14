import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getBaseUrl } from "@/lib/email";
import { getTodayPost, markCalendarDay } from "@/lib/program-day";
import { excerptPostBody } from "@/lib/post-text";
import { todayKey } from "@/lib/progress";
import { answerCallbackQuery, editMessageText, sendMessage, telegramConfigured } from "@/lib/telegram/api";
import { consumeTelegramLinkCode, findLinkByChat, unlinkChat } from "@/lib/telegram/link";
import {
  escapeHtml,
  HELP_TEXT,
  markKeyboard,
  markLabel,
  morningMessage,
  parseCommand,
  parseMarkCallback,
  parseStartPayload,
} from "@/lib/telegram/messages";

type TgUpdate = {
  message?: { chat: { id: number; type: string }; from?: { username?: string }; text?: string };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number }; message_id: number };
  };
};

function isAuthorized(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) return false;
  const got = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

const NOT_LINKED =
  "Цей чат ще не привʼязаний до акаунта «Стоденки». Відкрий на сайті «Налаштування» → «Telegram» і натисни «Підключити».";

async function handleMessage(msg: NonNullable<TgUpdate["message"]>) {
  if (msg.chat.type !== "private" || !msg.text) return;
  const chatId = String(msg.chat.id);
  const text = msg.text;

  const startPayload = parseStartPayload(text);
  if (startPayload !== null) {
    if (startPayload) {
      const userId = await consumeTelegramLinkCode(startPayload, { chatId, username: msg.from?.username });
      if (userId) {
        await sendMessage(
          chatId,
          `Готово, Telegram підключено ✅\n\nЗранку надсилатиму пост дня, а ввечері питатиму, як пройшов день.\n\n${HELP_TEXT}`,
        );
        return;
      }
      await sendMessage(chatId, "Код недійсний або застарів. Згенеруй новий у «Налаштуваннях» на сайті.");
      return;
    }
    const link = await findLinkByChat(chatId);
    await sendMessage(chatId, link ? HELP_TEXT : `Привіт! ${NOT_LINKED}`);
    return;
  }

  const link = await findLinkByChat(chatId);
  if (!link) {
    await sendMessage(chatId, NOT_LINKED);
    return;
  }

  switch (parseCommand(text)) {
    case "today": {
      const data = await getTodayPost(link.userId);
      if (!data) {
        await sendMessage(chatId, "Пост дня поки не знайдено.");
        return;
      }
      await sendMessage(
        chatId,
        morningMessage({
          day: data.state.day,
          total: data.state.total,
          title: data.post.titleUk,
          excerpt: excerptPostBody(data.post.bodyUk, 280),
          url: `${getBaseUrl()}/app/post/${data.post.slug}`,
        }),
      );
      return;
    }
    case "mark": {
      await sendMessage(chatId, "Що було сьогодні?", markKeyboard(todayKey()));
      return;
    }
    case "settings": {
      await sendMessage(
        chatId,
        `Ранковий пост: ${link.morningEnabled ? "увімкнено" : "вимкнено"}\nВечірнє нагадування: ${link.eveningEnabled ? "увімкнено" : "вимкнено"}\n\nЗмінити можна в «Налаштуваннях» на сайті: ${getBaseUrl()}/app/settings`,
      );
      return;
    }
    case "stop": {
      await unlinkChat(chatId);
      await sendMessage(chatId, "Telegram відʼєднано. Повернутися можна будь-коли через «Налаштування» на сайті.");
      return;
    }
    default:
      await sendMessage(chatId, HELP_TEXT);
  }
}

async function handleCallback(cb: NonNullable<TgUpdate["callback_query"]>) {
  const parsed = cb.data ? parseMarkCallback(cb.data) : null;
  const chat = cb.message?.chat;
  if (!parsed || !chat || !cb.message) {
    await answerCallbackQuery(cb.id);
    return;
  }
  const chatId = String(chat.id);
  const link = await findLinkByChat(chatId);
  if (!link) {
    await answerCallbackQuery(cb.id, "Чат не привʼязаний до акаунта");
    return;
  }
  const res = await markCalendarDay(link.userId, parsed.dayKey, parsed.status);
  if (!res.ok) {
    await answerCallbackQuery(cb.id, res.reason === "locked" ? "Цей день уже не можна змінити" : "Програму не знайдено");
    return;
  }
  await answerCallbackQuery(cb.id, "Збережено");
  const extra =
    parsed.status === "TRAINING"
      ? `\n\nДеталі заняття (кола й повторення) можна додати в календарі: ${escapeHtml(`${getBaseUrl()}/app/calendar?open=${parsed.dayKey}`)}`
      : "";
  await editMessageText(chatId, cb.message.message_id, `Відмічено: ${markLabel(parsed.status)}${extra}`, markKeyboard(parsed.dayKey));
}

export async function POST(req: Request) {
  if (!telegramConfigured() || !isAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  try {
    if (update?.message) await handleMessage(update.message);
    else if (update?.callback_query) await handleCallback(update.callback_query);
  } catch (e) {
    console.error("telegram webhook error", e);
  }
  // Always 200 so Telegram doesn't retry the same update forever.
  return NextResponse.json({ ok: true });
}
