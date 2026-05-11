import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isCalendarDayEditable } from "@/lib/calendar-access";
import { unlockedProgramDay } from "@/lib/progress";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const training = await prisma.trainingDayEntry.findMany({
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
    },
  });
  const trainingByDayKey = new Map(training.map((t) => [t.dayKey, t]));

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
        <CardContent className="flex flex-wrap items-center gap-2">
          <a
            href={prevLocked ? undefined : `/app/calendar?m=${prevKey}`}
            aria-disabled={prevLocked}
            className={[
              "rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] transition-[transform,box-shadow]",
              prevLocked
                ? "opacity-50 pointer-events-none"
                : "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_var(--color-border)] active:translate-x-1 active:translate-y-1",
            ].join(" ")}
          >
            ←
          </a>
          <div className="rounded-[var(--radius)] border-4 border-border bg-card px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)]">
            {monthKey}
          </div>
          <a
            href={`/app/calendar?m=${nextKey}`}
            className="rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_var(--color-border)] active:translate-x-1 active:translate-y-1 transition-[transform,box-shadow]"
          >
            →
          </a>
        </CardContent>
      </Card>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-black uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}

        {Array.from({ length: rows * 7 }).map((_, idx) => {
          const dayNum = idx - firstDow + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <div key={`empty-${idx}`} className="h-[92px] sm:h-[112px] rounded-[var(--radius)] border-4 border-border bg-card/40" />;
          }

          const date = new Date(Date.UTC(clampedStart.getUTCFullYear(), clampedStart.getUTCMonth(), dayNum));
          const dayKey = toDayKeyUTC(date);

          // Don't show days before program start (in the first month).
          if (date.getTime() < programStart.getTime()) {
            return <div key={`prestart-${dayKey}`} className="h-[92px] sm:h-[112px] rounded-[var(--radius)] border-4 border-border bg-card/40" />;
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

          return (
            <CalendarDayCell
              key={dayKey}
              dayNum={dayNum}
              dayKey={dayKey}
              locked={locked}
              status={status}
              training={
                t
                  ? {
                      mode: t.mode === "SETS" ? "SETS" : "ROUNDS",
                      rounds: t.rounds,
                      pullupsReps: t.pullupsReps,
                      squatsReps: t.squatsReps,
                      pushupsReps: t.pushupsReps,
                      lungesReps: t.lungesReps,
                      notes: t.notes,
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

