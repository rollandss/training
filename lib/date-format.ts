const dayFormatter = new Intl.DateTimeFormat("uk-UA", {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "2026-11-13" → "пт, 13 листопада". dayKeys are calendar dates, so format in UTC to avoid shifting. */
export function formatDayKeyUk(dayKey: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!m) return dayKey;
  return dayFormatter.format(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))));
}
