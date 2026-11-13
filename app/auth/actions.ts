"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  RATE_LIMIT_MESSAGE,
  clearAttempts,
  clientIp,
  isRateLimited,
  loginRules,
  recordAttempt,
  registerRules,
} from "@/lib/rate-limit";
import { clearSession, createSession } from "@/lib/session";

const DUMMY_HASH = "$2b$12$UwnsmXQwmAuSAQczE5qs3uNoNLoe8dkX7B3vemRNvgpu.y9YNmTQy";

export type AuthFormState = { error: string } | undefined;

const authSchema = z.object({
  email: z.string().trim().email("Некоректний email"),
  password: z.string().min(8, "Пароль має бути не коротший за 8 символів"),
});

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Помилка валідації" };
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password.trim();
  const ip = await clientIp();
  const regRules = registerRules(ip);
  if (await isRateLimited(regRules)) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  const exists = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (exists) {
    return { error: "Користувач з таким email уже існує" };
  }
  await recordAttempt(regRules.map((r) => r.key));
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: {} },
    },
  });
  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });
  redirect("/onboarding");
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Помилка валідації" };
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password.trim();
  const rules = loginRules(email, await clientIp());
  if (await isRateLimited(rules)) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { profile: true },
  });
  // Compare against a dummy hash when the user is missing so timing doesn't reveal which emails exist.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await recordAttempt(rules.map((r) => r.key));
    return { error: "Невірний email або пароль" };
  }
  await clearAttempts([rules[0].key]);
  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });
  if (!user.profile?.onboardingDone) {
    redirect("/onboarding");
  }
  redirect("/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/login");
}
