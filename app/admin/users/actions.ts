"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type AdminMutationResult = { ok: true } | { ok: false; error: string };

const emailSchema = z.string().trim().email("Некоректний email");
const passwordSchema = z.string().min(8, "Пароль має бути не коротший за 8 символів");

function requireAdmin(role?: string) {
  if (role !== "ADMIN") redirect("/app");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseRole(raw: string) {
  const role = raw.trim().toUpperCase();
  if (role !== "USER" && role !== "ADMIN") return null;
  return role;
}

async function countOtherAdmins(excludeUserId: string) {
  return prisma.user.count({
    where: { role: "ADMIN", NOT: { id: excludeUserId } },
  });
}

function revalidateUserSurfaces(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/stats");
}

async function refreshSessionIfSelf(actorId: string, targetId: string, email: string, role: "USER" | "ADMIN") {
  if (actorId !== targetId) return;
  await createSession({ sub: targetId, email, role });
}

export async function createUserAction(formData: FormData): Promise<AdminMutationResult> {
  const user = await getCurrentUser();
  requireAdmin(user?.role);

  const emailParsed = emailSchema.safeParse(formData.get("email"));
  if (!emailParsed.success) {
    return { ok: false, error: emailParsed.error.issues[0]?.message ?? "Некоректний email" };
  }
  const passwordParsed = passwordSchema.safeParse(formData.get("password"));
  if (!passwordParsed.success) {
    return { ok: false, error: passwordParsed.error.issues[0]?.message ?? "Некоректний пароль" };
  }

  const email = normalizeEmail(emailParsed.data);
  const role = parseRole(String(formData.get("role") ?? "USER"));
  if (!role) return { ok: false, error: "Невірна роль" };

  const exists = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (exists) return { ok: false, error: "Користувач з таким email уже існує" };

  const created = await prisma.user.create({
    data: {
      email,
      role,
      passwordHash: await bcrypt.hash(passwordParsed.data.trim(), 12),
      profile: { create: {} },
    },
    select: { id: true },
  });

  revalidateUserSurfaces(created.id);
  return { ok: true };
}

export async function updateUserAccountAction(formData: FormData): Promise<AdminMutationResult> {
  const actor = await getCurrentUser();
  requireAdmin(actor?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const emailParsed = emailSchema.safeParse(formData.get("email"));
  if (!userId) return { ok: false, error: "Не вказано користувача" };
  if (!emailParsed.success) {
    return { ok: false, error: emailParsed.error.issues[0]?.message ?? "Некоректний email" };
  }

  const role = parseRole(String(formData.get("role") ?? ""));
  if (!role) return { ok: false, error: "Невірна роль" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!target) return { ok: false, error: "Користувача не знайдено" };

  const email = normalizeEmail(emailParsed.data);
  const passwordRaw = String(formData.get("password") ?? "").trim();
  if (passwordRaw) {
    const passwordParsed = passwordSchema.safeParse(passwordRaw);
    if (!passwordParsed.success) {
      return { ok: false, error: passwordParsed.error.issues[0]?.message ?? "Некоректний пароль" };
    }
  }

  if (target.role === "ADMIN" && role === "USER" && (await countOtherAdmins(userId)) === 0) {
    return { ok: false, error: "Не можна зняти роль останнього адміністратора" };
  }

  const duplicate = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      NOT: { id: userId },
    },
    select: { id: true },
  });
  if (duplicate) return { ok: false, error: "Користувач з таким email уже існує" };

  const data: { email: string; role: string; passwordHash?: string } = { email, role };
  if (passwordRaw) {
    data.passwordHash = await bcrypt.hash(passwordRaw, 12);
  }

  await prisma.user.update({ where: { id: userId }, data });
  await refreshSessionIfSelf(actor!.id, userId, email, role);
  revalidateUserSurfaces(userId);
  return { ok: true };
}

export async function deleteUserAction(formData: FormData): Promise<AdminMutationResult> {
  const actor = await getCurrentUser();
  requireAdmin(actor?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return { ok: false, error: "Не вказано користувача" };
  if (actor?.id === userId) return { ok: false, error: "Не можна видалити власний обліковий запис" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "Користувача не знайдено" };
  if (target.role === "ADMIN" && (await countOtherAdmins(userId)) === 0) {
    return { ok: false, error: "Не можна видалити останнього адміністратора" };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/stats");
  return { ok: true };
}

export async function updateUserRoleAction(formData: FormData): Promise<AdminMutationResult> {
  const actor = await getCurrentUser();
  requireAdmin(actor?.role);

  const userId = String(formData.get("userId") ?? "").trim();
  const role = parseRole(String(formData.get("role") ?? ""));
  if (!userId) return { ok: false, error: "Не вказано користувача" };
  if (!role) return { ok: false, error: "Невірна роль" };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });
  if (!target) return { ok: false, error: "Користувача не знайдено" };
  if (target.role === "ADMIN" && role === "USER" && (await countOtherAdmins(userId)) === 0) {
    return { ok: false, error: "Не можна зняти роль останнього адміністратора" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  await refreshSessionIfSelf(actor!.id, userId, target.email, role);

  revalidateUserSurfaces(userId);
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

  revalidateUserSurfaces(userId);
  revalidatePath("/app");
  revalidatePath("/app/posts");
  revalidatePath("/app/calendar");
  return { ok: true };
}

