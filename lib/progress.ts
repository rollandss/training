/**
 * All day math works on "calendar dates" represented as UTC-midnight Date objects.
 * Instants (now, startedAt, createdAt) must go through `calendarDate()` first so the
 * day boundary is local midnight in APP_TIMEZONE, not 00:00 UTC (02:00/03:00 in Kyiv).
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || "Europe/Kyiv";

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let f = partsFormatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    partsFormatterCache.set(timeZone, f);
  }
  return f;
}

/** The wall-clock date of `instant` in `timeZone`, as a UTC-midnight Date. */
export function calendarDate(instant: Date, timeZone: string = APP_TIMEZONE) {
  const parts = partsFormatter(timeZone).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}

export function dayKeyFromCalendarDate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Today's dayKey (YYYY-MM-DD) in APP_TIMEZONE. */
export function todayKey(now: Date = new Date()) {
  return dayKeyFromCalendarDate(calendarDate(now));
}

export function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function diffDaysUTC(a: Date, b: Date) {
  const ms = startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function unlockedProgramDayByTime(params: { startedAt: Date; durationDays: number; today?: Date }) {
  const today = calendarDate(params.today ?? new Date());
  const unlocked = diffDaysUTC(today, calendarDate(params.startedAt)) + 1;
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
