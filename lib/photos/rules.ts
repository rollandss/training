// Pure rules shared by server actions and tests.
export const PHOTO_KINDS = ["BEFORE", "PROGRESS", "AFTER"] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

export const PHOTO_KIND_LABEL: Record<PhotoKind, string> = {
  BEFORE: "До старту",
  PROGRESS: "У процесі",
  AFTER: "Після 100 днів",
};

export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const PHOTO_MAX_PER_USER = 60;
export const PHOTO_MAX_SIDE = 1600;
export const PHOTO_TYPES = { "image/webp": "webp", "image/jpeg": "jpg" } as const;

export function parsePhotoKind(raw: unknown): PhotoKind | null {
  return PHOTO_KINDS.includes(raw as PhotoKind) ? (raw as PhotoKind) : null;
}

export function photoExtension(contentType: string): string | null {
  return (PHOTO_TYPES as Record<string, string>)[contentType] ?? null;
}

export function photoKeyPrefix(userId: string) {
  return `u/${userId}/`;
}

export function isOwnPhotoKey(userId: string, key: string) {
  const prefix = photoKeyPrefix(userId);
  return key.startsWith(prefix) && /^[a-z0-9]+\.(webp|jpg)$/.test(key.slice(prefix.length));
}

/** Pick the pair to compare: earliest "before" (or earliest overall) vs the latest other photo. */
export function comparisonPair<T extends { kind: string; createdAt: Date }>(photos: T[]): [T, T] | null {
  if (photos.length < 2) return null;
  const sorted = [...photos].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const first = sorted.find((p) => p.kind === "BEFORE") ?? sorted[0];
  const rest = sorted.filter((p) => p !== first);
  const after = [...rest].reverse().find((p) => p.kind === "AFTER") ?? rest[rest.length - 1];
  return [first, after];
}
