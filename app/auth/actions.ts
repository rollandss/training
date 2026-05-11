"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

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
  const exists = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (exists) {
    return { error: "Користувач з таким email уже існує" };
  }
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
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { profile: true },
  });
  if (!user) {
    return { error: "Невірний email або пароль" };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Невірний email або пароль" };
  }
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
