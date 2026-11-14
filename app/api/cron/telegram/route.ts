import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getBaseUrl } from "@/lib/email";
import { getTodayPost, getUserProgramState } from "@/lib/program-day";
import { excerptPostBody } from "@/lib/post-text";
import { prisma } from "@/lib/prisma";
import { todayKey as getTodayKey } from "@/lib/progress";
import { isBlockedError, sendMessage, telegramConfigured } from "@/lib/telegram/api";
import { eveningMessage, markKeyboard, morningMessage } from "@/lib/telegram/messages";

function isAuthorizedCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/** GET /api/cron/telegram?slot=morning|evening — called by Vercel Cron once per slot per day. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!telegramConfigured()) return NextResponse.json({ ok: false, error: "telegram_not_configured" }, { status: 500 });

  const slot = new URL(req.url).searchParams.get("slot");
  if (slot !== "morning" && slot !== "evening") {
    return NextResponse.json({ ok: false, error: "bad_slot" }, { status: 400 });
  }

  const todayKey = getTodayKey();
  const baseUrl = getBaseUrl();
  const links = await prisma.telegramLink.findMany({
    where:
      slot === "morning"
        ? { morningEnabled: true, NOT: { lastMorningDayKey: todayKey } }
        : { eveningEnabled: true, NOT: { lastEveningDayKey: todayKey } },
  });

  let sent = 0;
  let skipped = 0;
  for (const link of links) {
    try {
      if (slot === "morning") {
        const data = await getTodayPost(link.userId);
        if (!data) {
          skipped++;
          continue;
        }
        await sendMessage(
          link.chatId,
          morningMessage({
            day: data.state.day,
            total: data.state.total,
            title: data.post.titleUk,
            excerpt: excerptPostBody(data.post.bodyUk, 280),
            url: `${baseUrl}/app/post/${data.post.slug}`,
          }),
        );
        await prisma.telegramLink.update({ where: { id: link.id }, data: { lastMorningDayKey: todayKey } });
      } else {
        const state = await getUserProgramState(link.userId);
        if (!state) {
          skipped++;
          continue;
        }
        const marked = await prisma.userCalendarDay.findUnique({
          where: { userId_dayKey: { userId: link.userId, dayKey: todayKey } },
          select: { id: true },
        });
        // already marked today — no need to nag
        if (!marked) await sendMessage(link.chatId, eveningMessage({ day: state.day }), markKeyboard(todayKey));
        await prisma.telegramLink.update({ where: { id: link.id }, data: { lastEveningDayKey: todayKey } });
      }
      sent++;
    } catch (e) {
      if (isBlockedError(e)) await prisma.telegramLink.delete({ where: { id: link.id } }).catch(() => {});
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, slot, todayKey, sent, skipped });
}
