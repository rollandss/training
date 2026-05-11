import { unlockedProgramDay } from "@/lib/progress";

export type TrainingVolumeMode = "ROUNDS" | "SETS";

export function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function dayKeyToUTCDate(dayKey: string) {
  const m = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

export function diffDaysUTC(a: Date, b: Date) {
  const ms = startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function unlockedProgramDayByTime(params: { startedAt: Date; durationDays: number; today?: Date }) {
  const today = startOfDayUTC(params.today ?? new Date());
  const unlocked = diffDaysUTC(today, startOfDayUTC(params.startedAt)) + 1;
  return Math.max(1, Math.min(unlocked, params.durationDays));
}

export function isCalendarDayEditable(params: {
  dayKey: string;
  startedAt: Date;
  registeredAt: Date;
  durationDays: number;
  cursorDay: number;
  today?: Date;
}) {
  const date = dayKeyToUTCDate(params.dayKey);
  if (!date) return false;

  const todayUTC = startOfDayUTC(params.today ?? new Date());
  const programStart = startOfDayUTC(params.startedAt);
  const registeredAtUTC = startOfDayUTC(params.registeredAt);
  const unlockedDay = unlockedProgramDay({
    cursorDay: params.cursorDay,
    startedAt: params.startedAt,
    durationDays: params.durationDays,
    today: todayUTC,
  });
  const programDay = diffDaysUTC(date, programStart) + 1;

  if (date.getTime() > todayUTC.getTime()) return false;
  if (date.getTime() < registeredAtUTC.getTime()) return false;
  if (date.getTime() < programStart.getTime()) return false;
  if (programDay < 1 || programDay > params.durationDays) return false;
  if (programDay > unlockedDay) return false;

  return true;
}
