export function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function diffDaysUTC(a: Date, b: Date) {
  const ms = startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function unlockedProgramDayByTime(params: { startedAt: Date; durationDays: number; today?: Date }) {
  const today = params.today ?? new Date();
  const unlocked = diffDaysUTC(startOfDayUTC(today), startOfDayUTC(params.startedAt)) + 1;
  return Math.max(1, Math.min(unlocked, params.durationDays));
}

export function unlockedProgramDay(params: {
  cursorDay: number;
  startedAt: Date;
  durationDays: number;
  today?: Date;
}) {
  const timeDay = unlockedProgramDayByTime({
    startedAt: params.startedAt,
    durationDays: params.durationDays,
    today: params.today,
  });
  const day = Math.max(params.cursorDay, timeDay);
  return Math.max(1, Math.min(day, params.durationDays));
}

