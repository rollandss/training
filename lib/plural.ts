/** Ukrainian plural form: pluralUk(n, ["день", "дні", "днів"]). */
export function pluralUk(n: number, forms: readonly [one: string, few: string, many: string]) {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export const DAY_FORMS = ["день", "дні", "днів"] as const;
