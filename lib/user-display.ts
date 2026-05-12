export function getUserInitials(email: string) {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function getUserShortLabel(email: string) {
  const local = email.split("@")[0] ?? email;
  if (local.length <= 20) return local;
  return `${local.slice(0, 18)}…`;
}
