"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(role?: string) {
  if (role !== "ADMIN") redirect("/app");
}

export async function updateUserRoleAction(formData: FormData) {
  const user = await getCurrentUser();
  requireAdmin(user?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toUpperCase();
  if (!userId) return;
  if (role !== "USER" && role !== "ADMIN") return;

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateUserCursorDayAction(formData: FormData) {
  const user = await getCurrentUser();
  requireAdmin(user?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  const cursorDayRaw = String(formData.get("cursorDay") ?? "").trim();
  const cursorDay = Number(cursorDayRaw);
  if (!userId || !programId) return;
  if (!Number.isInteger(cursorDay) || cursorDay < 1 || cursorDay > 100) return;

  await prisma.userProgram.update({
    where: { userId_programId: { userId, programId } },
    data: { cursorDay },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/app");
}

