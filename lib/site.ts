export const SITE_NAME = "Стоденка";
export const SITE_TITLE = "Стоденка — 100 днів";
export const SITE_TAGLINE = "100 днів, які затягують";
export const SITE_DESCRIPTION =
  "Безкоштовна україномовна платформа 100-денної програми з турніком: щоденний інфопост, календар і прогрес без хаосу.";

export function getSiteUrl() {
  const raw = process.env.PUBLIC_BASE_URL ?? process.env.VERCEL_URL;
  if (!raw) return "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}
