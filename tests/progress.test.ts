import assert from "node:assert/strict";
import { test } from "node:test";

import { isCalendarDayEditable } from "../lib/calendar-access";
import { calendarDate, todayKey, unlockedProgramDayByTime } from "../lib/progress";

// APP_TIMEZONE defaults to Europe/Kyiv (UTC+2 winter, UTC+3 summer).
const t = (iso: string) => new Date(iso);

test("day boundary is local midnight in Kyiv, not 00:00 UTC", () => {
  assert.equal(todayKey(t("2026-11-13T23:30:00Z")), "2026-11-14"); // 01:30 Kyiv
  assert.equal(todayKey(t("2026-11-13T21:59:00Z")), "2026-11-13"); // 23:59 Kyiv
  assert.equal(todayKey(t("2026-07-01T21:30:00Z")), "2026-07-02"); // DST: 00:30 Kyiv
});

test("calendarDate returns a UTC-midnight Date", () => {
  assert.equal(calendarDate(t("2026-11-13T23:30:00Z")).toISOString(), "2026-11-14T00:00:00.000Z");
});

test("program days unlock at local midnight", () => {
  const startedAt = t("2026-11-13T22:30:00Z"); // 00:30 Kyiv on the 14th
  assert.equal(unlockedProgramDayByTime({ startedAt, durationDays: 100, today: t("2026-11-14T21:00:00Z") }), 1);
  assert.equal(unlockedProgramDayByTime({ startedAt, durationDays: 100, today: t("2026-11-14T22:30:00Z") }), 2);
  assert.equal(unlockedProgramDayByTime({ startedAt, durationDays: 100, today: t("2027-06-01T12:00:00Z") }), 100);
});

test("a late-night workout after local midnight lands on the new day", () => {
  const startedAt = t("2026-11-13T22:30:00Z");
  const base = { startedAt, registeredAt: startedAt, durationDays: 100, cursorDay: 1, today: t("2026-11-14T22:40:00Z") };
  assert.equal(isCalendarDayEditable({ ...base, dayKey: "2026-11-15" }), true);
  assert.equal(isCalendarDayEditable({ ...base, dayKey: "2026-11-16" }), false);
  assert.equal(isCalendarDayEditable({ ...base, dayKey: "2026-11-13" }), false); // before start
});
