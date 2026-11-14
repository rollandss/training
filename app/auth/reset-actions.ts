"use server";

import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";

import { canSendEmail, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT_MESSAGE, clearAttempts, clientIp, isRateLimited, recordAttempt } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const MINUTE = 60_000;

export type ResetFormState = { error?: string; ok?: boolean } | undefined;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** PUBLIC_BASE_URL if set, otherwise the host the request came in on (works on Vercel previews too). */
async function baseUrl() {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const requestSchema = z.object({ email: z.string().trim().email("Некоректний email") });

export async function requestPasswordResetAction(_prev: ResetFormState, formData: FormData): Promise<ResetFormState> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Помилка валідації" };
  const email = parsed.data.email.toLowerCase();

  if (!canSendEmail()) {
    return { error: "Відновлення пароля тимчасово недоступне. Напиши адміністратору." };
  }

  const ip = await clientIp();
  const rules = [
    { key: `reset:email:${email}`, limit: 3, windowMs: 60 * MINUTE },
    { key: `reset:ip:${ip}`, limit: 10, windowMs: 60 * MINUTE },
  ];
  if (await isRateLimited(rules)) return { error: RATE_LIMIT_MESSAGE };
  await recordAttempt(rules.map((r) => r.key));

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });

  // Same response whether or not the account exists, so the form can't be used to probe emails.
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });
    const link = `${await baseUrl()}/auth/reset?token=${token}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Стоденка — відновлення пароля",
        text: `Щоб задати новий пароль, відкрий посилання (діє 1 годину):\n\n${link}\n\nЯкщо ти не просив відновлення, просто проігноруй цей лист.`,
      });
    } catch (e) {
      console.error("password reset email failed", e);
      return { error: "Не вдалося надіслати лист. Спробуй пізніше." };
    }
  }

  return { ok: true };
}

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Пароль має бути не коротший за 8 символів"),
});

export async function resetPasswordAction(_prev: ResetFormState, formData: FormData): Promise<ResetFormState> {
  const parsed = resetSchema.safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Помилка валідації" };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true, user: { select: { email: true } } },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: "Посилання недійсне або застаріло. Запроси нове." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password.trim(), 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Any other outstanding links for this user stop working too.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null, NOT: { id: record.id } } }),
  ]);
  await clearAttempts([`login:email:${record.user.email.toLowerCase()}`]);

  return { ok: true };
}
