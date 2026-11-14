export const PULLUP_LEVELS = [
  { value: "novice", label: "Жодного — я новачок" },
  { value: "basic", label: "1–5 разів" },
  { value: "intermediate", label: "6–12 разів" },
  { value: "advanced", label: "Більше 12" },
] as const;

export function pullupLevelLabel(value: string | null | undefined) {
  if (!value) return null;
  return PULLUP_LEVELS.find((l) => l.value === value)?.label ?? value;
}
