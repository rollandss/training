import { redirect } from "next/navigation";

import { Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { setCalendarDayStatusAction, type CalendarStatus } from "./actions";

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

function diffDaysUTC(a: Date, b: Date) {
  const ms = startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const STATUS_UI: Record<
  CalendarStatus,
  {
    label: string;
    className: string;
    short: string;
  }
> = {
  TRAINING: { label: "Тренування", short: "Т", className: "bg-primary text-primary-foreground" },
  REST: { label: "Відпочинок", short: "В", className: "bg-secondary text-secondary-foreground" },
  SICK: { label: "Хвороба", short: "Х", className: "bg-destructive text-primary-foreground" },
};

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

  const now = new Date();
  const defaultMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = monthStart ?? defaultMonthStart;
  const monthKey = `${start.getUTCFullYear()}-${pad2(start.getUTCMonth() + 1)}`;
  const prevKey = `${addMonthsUTC(start, -1).getUTCFullYear()}-${pad2(addMonthsUTC(start, -1).getUTCMonth() + 1)}`;
  const nextKey = `${addMonthsUTC(start, 1).getUTCFullYear()}-${pad2(addMonthsUTC(start, 1).getUTCMonth() + 1)}`;

  const monthEndExclusive = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const daysInMonth = Math.round((monthEndExclusive.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Monday=0..Sunday=6
  const firstDow = (start.getUTCDay() + 6) % 7;

  const dayKeys: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dayKeys.push(toDayKeyUTC(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day))));
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

  const programStart = startOfDayUTC(new Date(up.startedAt));
  const unlockedDay = Math.max(1, Math.min(up.cursorDay, up.program.durationDays));
  const todayUTC = startOfDayUTC(new Date());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Календар</CardTitle>
          <CardDescription>
            Дні відкриваються поступово: доступно до дня <span className="font-black text-foreground">{unlockedDay}</span>.
            Позначай: тренування, відпочинок або хвороба.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <a
            href={`/app/calendar?m=${prevKey}`}
            className="rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_var(--color-border)] active:translate-x-1 active:translate-y-1 transition-[transform,box-shadow]"
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
            return <div key={`empty-${idx}`} className="h-[112px] rounded-[var(--radius)] border-4 border-border bg-card/40" />;
          }

          const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), dayNum));
          const dayKey = toDayKeyUTC(date);
          const status = byDayKey.get(dayKey);
          const programDay = diffDaysUTC(date, programStart) + 1; // 1..duration
          const isFuture = date.getTime() > todayUTC.getTime();
          const afterStart = date.getTime() >= programStart.getTime();
          const beyondProgram = programDay > up.program.durationDays;
          const beyondCursor = afterStart && programDay > unlockedDay;
          const locked = isFuture || beyondProgram || beyondCursor;

          return (
            <div
              key={dayKey}
              className={cn(
                "relative flex h-[112px] flex-col rounded-[var(--radius)] border-4 border-border bg-card p-2 shadow-[8px_8px_0px_0px_var(--color-border)]",
                locked && "opacity-95",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-black">{dayNum}</div>
                {status ? (
                  <div
                    className={cn(
                      "inline-flex items-center rounded-[var(--radius)] border-4 border-border px-2 py-1 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]",
                      STATUS_UI[status].className,
                    )}
                    title={STATUS_UI[status].label}
                  >
                    {STATUS_UI[status].short}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-muted-foreground">—</div>
                )}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-1">
                {(Object.keys(STATUS_UI) as CalendarStatus[]).map((s) => (
                  <form key={s} action={setCalendarDayStatusAction}>
                    <input type="hidden" name="dayKey" value={dayKey} />
                    <button
                      type="submit"
                      name="status"
                      value={s}
                      disabled={locked}
                      className={cn(
                        "w-full rounded-[var(--radius)] border-4 border-border px-1 py-1 text-[11px] font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none",
                        STATUS_UI[s].className,
                      )}
                      title={STATUS_UI[s].label}
                    >
                      {STATUS_UI[s].short}
                    </button>
                  </form>
                ))}
              </div>

              {locked ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="bg-card border-4 border-border p-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
                    <Lock className="size-6 text-foreground" />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

