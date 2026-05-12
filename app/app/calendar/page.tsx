import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isCalendarDayEditable } from "@/lib/calendar-access";
import { CALENDAR_STATUS_ORDER, CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { unlockedProgramDay } from "@/lib/progress";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTrainingReps, trainingRepsFromEntry, trainingRepsFromProfile } from "@/lib/training-exercises";
import { buildTrainingLinesForForm, legacyRepsFromEntry } from "@/lib/user-exercise-utils";
import { listUserExercises } from "@/lib/user-exercises";
import { cn } from "@/lib/utils";

import { CalendarDayCell } from "./calendar-day-cell";
import { type CalendarStatus } from "./actions";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDayKeyUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function monthKeyToUTCDate(monthKey: string) {
  const m = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month1 = Number(m[2]); // 1..12
  if (!Number.isFinite(year) || !Number.isFinite(month1) || month1 < 1 || month1 > 12) return null;
  return new Date(Date.UTC(year, month1 - 1, 1));
}

function addMonthsUTC(d: Date, delta: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1));
}

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"] as const;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const up = user.userPrograms[0];
  if (!up) redirect("/onboarding");

  const sp = await searchParams;
  const monthParam = typeof sp.m === "string" ? sp.m : Array.isArray(sp.m) ? sp.m[0] : undefined;
  const monthStart = monthParam ? monthKeyToUTCDate(monthParam) : null;

  const startedAt = new Date(up.startedAt);
  const programStart = startOfDayUTC(startedAt);
  const programMonthStart = new Date(Date.UTC(startedAt.getUTCFullYear(), startedAt.getUTCMonth(), 1));
  const now = new Date();
  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = monthStart ?? currentMonthStart;
  const clampedStart = start.getTime() < programMonthStart.getTime() ? programMonthStart : start;
  const monthKey = `${clampedStart.getUTCFullYear()}-${pad2(clampedStart.getUTCMonth() + 1)}`;
  const prevMonth = addMonthsUTC(clampedStart, -1);
  const nextMonth = addMonthsUTC(clampedStart, 1);
  const prevKey = `${prevMonth.getUTCFullYear()}-${pad2(prevMonth.getUTCMonth() + 1)}`;
  const nextKey = `${nextMonth.getUTCFullYear()}-${pad2(nextMonth.getUTCMonth() + 1)}`;
  const prevLocked = prevMonth.getTime() < programMonthStart.getTime();

  const monthEndExclusive = new Date(Date.UTC(clampedStart.getUTCFullYear(), clampedStart.getUTCMonth() + 1, 1));
  const daysInMonth = Math.round((monthEndExclusive.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24));

  // Monday=0..Sunday=6
  const firstDow = (clampedStart.getUTCDay() + 6) % 7;

  const dayKeys: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dayKeys.push(toDayKeyUTC(new Date(Date.UTC(clampedStart.getUTCFullYear(), clampedStart.getUTCMonth(), day))));
  }

  const rows = Math.ceil((firstDow + daysInMonth) / 7);

  const existing = await prisma.userCalendarDay.findMany({
    where: {
      userId: user.id,
      dayKey: { in: dayKeys },
    },
    select: { dayKey: true, status: true },
  });

  const byDayKey = new Map(existing.map((e) => [e.dayKey, e.status as CalendarStatus]));

  const exercises = await listUserExercises(user.id);

  const [training, latestTraining] = await Promise.all([
    prisma.trainingDayEntry.findMany({
      where: { userId: user.id, dayKey: { in: dayKeys } },
      select: {
        dayKey: true,
        mode: true,
        rounds: true,
        pullupsReps: true,
        squatsReps: true,
        pushupsReps: true,
        lungesReps: true,
        notes: true,
        lines: {
          orderBy: { sortOrder: "asc" },
          select: {
            reps: true,
            sortOrder: true,
            userExerciseId: true,
            userExercise: {
              select: {
                label: true,
                short: true,
                builtinKey: true,
              },
            },
          },
        },
      },
    }),
    prisma.trainingDayEntry.findFirst({
      where: { userId: user.id },
      orderBy: { dayKey: "desc" },
      select: {
        pullupsReps: true,
        squatsReps: true,
        pushupsReps: true,
        lungesReps: true,
      },
    }),
  ]);
  const trainingByDayKey = new Map(training.map((t) => [t.dayKey, t]));
  const trainingRepDefaults = resolveTrainingReps(
    trainingRepsFromEntry(latestTraining),
    trainingRepsFromProfile(user.profile),
  );

  const unlockedDay = unlockedProgramDay({
    cursorDay: up.cursorDay,
    startedAt: up.startedAt,
    durationDays: up.program.durationDays,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Календар</CardTitle>
          <CardDescription>
            Дні відкриваються поступово: доступно до дня <span className="font-black text-foreground">{unlockedDay}</span>.
            Позначай: тренування, розтяжка, відпочинок або хвороба. Минулі відкриті дні можна редагувати.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <a
            href={prevLocked ? undefined : `/app/calendar?m=${prevKey}`}
            aria-disabled={prevLocked}
            className={[
              "rounded-[var(--radius)] border-2 border-border bg-background px-3 py-2 text-sm font-black uppercase tracking-wider sm:border-4 sm:shadow-[4px_4px_0px_0px_var(--color-border)]",
              prevLocked
                ? "pointer-events-none opacity-50"
                : "sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 sm:hover:shadow-[6px_6px_0px_0px_var(--color-border)]",
            ].join(" ")}
          >
            ←
          </a>
          <div className="rounded-[var(--radius)] border-2 border-border bg-card px-3 py-2 text-center text-sm font-black uppercase tracking-wider sm:border-4 sm:px-4 sm:shadow-[4px_4px_0px_0px_var(--color-border)]">
            {monthKey}
          </div>
          <a
            href={`/app/calendar?m=${nextKey}`}
            className="rounded-[var(--radius)] border-2 border-border bg-background px-3 py-2 text-sm font-black uppercase tracking-wider sm:border-4 sm:shadow-[4px_4px_0px_0px_var(--color-border)] sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 sm:hover:shadow-[6px_6px_0px_0px_var(--color-border)]"
          >
            →
          </a>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
        {CALENDAR_STATUS_ORDER.map((status) => (
          <div key={status} className="inline-flex items-center gap-2">
            <span className={cn("size-3 rounded-sm border border-border", CALENDAR_STATUS_UI[status].cellClassName)} />
            <span>{CALENDAR_STATUS_UI[status].label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground sm:text-xs">
            {d}
          </div>
        ))}

        {Array.from({ length: rows * 7 }).map((_, idx) => {
          const dayNum = idx - firstDow + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <div key={`empty-${idx}`} className="h-14 rounded-[var(--radius)] border-2 border-border bg-card/40 sm:h-[7rem] sm:border-4" />;
          }

          const date = new Date(Date.UTC(clampedStart.getUTCFullYear(), clampedStart.getUTCMonth(), dayNum));
          const dayKey = toDayKeyUTC(date);

          // Don't show days before program start (in the first month).
          if (date.getTime() < programStart.getTime()) {
            return <div key={`prestart-${dayKey}`} className="h-14 rounded-[var(--radius)] border-2 border-border bg-card/40 sm:h-[7rem] sm:border-4" />;
          }

          const status = byDayKey.get(dayKey);
          const locked = !isCalendarDayEditable({
            dayKey,
            startedAt: up.startedAt,
            registeredAt: user.createdAt,
            durationDays: up.program.durationDays,
            cursorDay: up.cursorDay,
          });
          const t = trainingByDayKey.get(dayKey);
          const trainingLines = t
            ? buildTrainingLinesForForm(
                exercises,
                t.lines.map((line) => ({
                  userExerciseId: line.userExerciseId,
                  reps: line.reps,
                  sortOrder: line.sortOrder,
                })),
                trainingRepDefaults,
                legacyRepsFromEntry(t),
              )
            : buildTrainingLinesForForm(exercises, null, trainingRepDefaults);

          return (
            <CalendarDayCell
              key={dayKey}
              dayNum={dayNum}
              dayKey={dayKey}
              locked={locked}
              status={status}
              trainingLines={trainingLines}
              training={
                t
                  ? {
                      mode: t.mode === "SETS" ? "SETS" : "ROUNDS",
                      rounds: t.rounds,
                      notes: t.notes,
                      lines: trainingLines,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}

