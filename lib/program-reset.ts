import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Start the user's program over: day 1 from today, calendar marks and training
 * logs removed. Maximums, own exercises, profile and email settings stay.
 * Returns false when the user has no program yet.
 */
export async function resetUserProgram(userId: string, now = new Date()) {
  const up = await prisma.userProgram.findFirst({
    where: { userId },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (!up) return false;

  await prisma.$transaction([
    prisma.userProgram.update({ where: { id: up.id }, data: { cursorDay: 1, startedAt: now } }),
    // TrainingDayExerciseLine rows go with their entry (onDelete: Cascade).
    prisma.trainingDayEntry.deleteMany({ where: { userId } }),
    prisma.userCalendarDay.deleteMany({ where: { userId } }),
    prisma.workoutLog.deleteMany({ where: { userId } }),
  ]);
  return true;
}

/** Paths whose content depends on the program position. */
export const PROGRAM_PATHS = ["/app", "/app/calendar", "/app/posts", "/app/settings", "/app/exercises"] as const;
