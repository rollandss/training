export type Role = "USER" | "ADMIN";

export const ROLE_LABELS: Record<Role, string> = {
  USER: "Учасник",
  ADMIN: "Адмін",
};

export function roleLabel(role: string) {
  return ROLE_LABELS[role as Role] ?? role;
}
