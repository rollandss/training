import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { canSendEmail, getBaseUrl, sendEmail } from "@/lib/email";
import { unlockedProgramDayByTime } from "@/lib/progress";

function dayKeyUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const expected = process.env.CRON_TOKEN ?? "";
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!canSendEmail()) {
    return NextResponse.json({ ok: false, error: "smtp_not_configured" }, { status: 500 });
  }

  const today = new Date();
  const todayKey = dayKeyUTC(today);
  const baseUrl = getBaseUrl();

  const subs = await prisma.userEmailSubscription.findMany({
    where: { enabled: true },
    select: {
      userId: true,
      lastSentDayKey: true,
      user: {
        select: {
          email: true,
          userPrograms: {
            take: 1,
            orderBy: { startedAt: "desc" },
            select: { startedAt: true, program: { select: { durationDays: true } } },
          },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const s of subs) {
    const up = s.user.userPrograms[0];
    if (!up) {
      skipped++;
      continue;
    }

    // idempotent per day per user
    if (s.lastSentDayKey === todayKey) {
      skipped++;
      continue;
    }

    const day = unlockedProgramDayByTime({ startedAt: up.startedAt, durationDays: up.program.durationDays, today });
    const post = await prisma.dailyPost.findFirst({ where: { dayNumber: day } });
    if (!post) {
      skipped++;
      continue;
    }

    const subject = `Сотка — День ${day}: ${post.titleUk}`;
    const link = `${baseUrl}/app/post/${post.slug}`;
    const text = `День ${day}\n\n${post.titleUk}\n\nВідкрити пост: ${link}\n`;

    try {
      await sendEmail({ to: s.user.email, subject, text });
      await prisma.userEmailSubscription.update({
        where: { userId: s.userId },
        data: { lastSentDayKey: todayKey },
      });
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, todayKey, sent, skipped });
}

