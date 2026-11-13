import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getPostByDayCached } from "@/lib/post-cache";
import { prisma } from "@/lib/prisma";
import { canSendEmail, getBaseUrl, sendEmail } from "@/lib/email";
import { postBodyToPlainText } from "@/lib/post-text";
import { unlockedProgramDay } from "@/lib/progress";

function dayKeyUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function isAuthorizedCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function GET(req: Request) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
  // External schedulers must send the same header. Headers like `x-vercel-cron`
  // can be spoofed by anyone, and query-string tokens end up in logs.
  if (!isAuthorizedCron(req)) {
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
            select: { startedAt: true, cursorDay: true, program: { select: { durationDays: true } } },
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

    const day = unlockedProgramDay({
      cursorDay: up.cursorDay,
      startedAt: up.startedAt,
      durationDays: up.program.durationDays,
      today,
    });
    const post = await getPostByDayCached(day);
    if (!post) {
      skipped++;
      continue;
    }

    const subject = `Стоденка — День ${day}: ${post.titleUk}`;
    const link = `${baseUrl}/app/post/${post.slug}`;
    const text = `День ${day}\n\n${post.titleUk}\n\n${postBodyToPlainText(post.bodyUk)}\n\nВідкрити пост: ${link}\n`;

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

