"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminMutationResult = { ok: true } | { ok: false; error: string };

function requireAdmin(role?: string) {
  if (role !== "ADMIN") redirect("/app");
}

export async function updateUserRoleAction(formData: FormData): Promise<AdminMutationResult> {
  const user = await getCurrentUser();
  requireAdmin(user?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toUpperCase();
  if (!userId) return { ok: false, error: "Не вказано користувача" };
  if (role !== "USER" && role !== "ADMIN") return { ok: false, error: "Невірна роль" };

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function updateUserCursorDayAction(formData: FormData): Promise<AdminMutationResult> {
  const user = await getCurrentUser();
  requireAdmin(user?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  const cursorDayRaw = String(formData.get("cursorDay") ?? "").trim();
  const cursorDay = Number(cursorDayRaw);
  if (!userId || !programId) return { ok: false, error: "Не вказано користувача або програму" };
  if (!Number.isInteger(cursorDay) || cursorDay < 1 || cursorDay > 100) {
    return { ok: false, error: "День має бути від 1 до 100" };
  }

  await prisma.userProgram.update({
    where: { userId_programId: { userId, programId } },
    data: { cursorDay },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/app");
  revalidatePath("/app/posts");
  revalidatePath("/app/calendar");
  return { ok: true };
}

