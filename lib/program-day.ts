import "server-only";

import type { CalendarStatus } from "@/app/app/calendar/actions";
import { isCalendarDayEditable } from "@/lib/calendar-access";
import { getPostByDayCached } from "@/lib/post-cache";
import { prisma } from "@/lib/prisma";
import { todayKey, unlockedProgramDay } from "@/lib/progress";

/** Shared, framework-agnostic program logic used by the web app, the Telegram bot and (later) the mobile API. */
export async function getUserProgramState(userId: string, now = new Date()) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      userPrograms: {
        take: 1,
        orderBy: { startedAt: "desc" },
        select: { startedAt: true, cursorDay: true, program: { select: { durationDays: true } } },
      },
    },
  });
  const up = user?.userPrograms[0];
  if (!user || !up) return null;
  const day = unlockedProgramDay({
    cursorDay: up.cursorDay,
    startedAt: up.startedAt,
    durationDays: up.program.durationDays,
    today: now,
  });
  return { day, total: up.program.durationDays, startedAt: up.startedAt, cursorDay: up.cursorDay, registeredAt: user.createdAt, todayKey: todayKey(now) };
}

export async function getTodayPost(userId: string, now = new Date()) {
  const state = await getUserProgramState(userId, now);
  if (!state) return null;
  const post = await getPostByDayCached(state.day);
  return post ? { state, post } : null;
}

/** Sets a day's status without training details (the bot's quick mark). Keeps existing training entries. */
export async function markCalendarDay(userId: string, dayKey: string, status: CalendarStatus, now = new Date()) {
  const state = await getUserProgramState(userId, now);
  if (!state) return { ok: false as const, reason: "no_program" as const };
  const editable = isCalendarDayEditable({
    dayKey,
    startedAt: state.startedAt,
    registeredAt: state.registeredAt,
    durationDays: state.total,
    cursorDay: state.cursorDay,
    today: now,
  });
  if (!editable) return { ok: false as const, reason: "locked" as const };

  await prisma.userCalendarDay.upsert({
    where: { userId_dayKey: { userId, dayKey } },
    create: { userId, dayKey, status },
    update: { status },
  });
  if (status !== "TRAINING") {
    await prisma.trainingDayEntry.deleteMany({ where: { userId, dayKey } });
  }
  return { ok: true as const };
}
