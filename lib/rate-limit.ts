import "server-only";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

type Rule = { key: string; limit: number; windowMs: number };

const MINUTE = 60_000;

export async function clientIp() {
  const h = await headers();
  // Vercel sets x-forwarded-for with the real client IP first.
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || "unknown";
}

async function countSince(key: string, windowMs: number) {
  return prisma.authAttempt.count({
    where: { key, createdAt: { gte: new Date(Date.now() - windowMs) } },
  });
}

/** Returns true if any rule is already at its limit. Does not record anything. */
export async function isRateLimited(rules: Rule[]) {
  const counts = await Promise.all(rules.map((r) => countSince(r.key, r.windowMs)));
  return counts.some((c, i) => c >= rules[i].limit);
}

export async function recordAttempt(keys: string[]) {
  await prisma.authAttempt.createMany({ data: keys.map((key) => ({ key })) });
  // Cheap opportunistic cleanup (~1% of writes).
  if (Math.random() < 0.01) {
    await prisma.authAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * MINUTE) } },
    });
  }
}

export async function clearAttempts(keys: string[]) {
  await prisma.authAttempt.deleteMany({ where: { key: { in: keys } } });
}

export function loginRules(email: string, ip: string): Rule[] {
  return [
    { key: `login:email:${email}`, limit: 8, windowMs: 15 * MINUTE },
    { key: `login:ip:${ip}`, limit: 30, windowMs: 15 * MINUTE },
  ];
}

export function registerRules(ip: string): Rule[] {
  return [{ key: `register:ip:${ip}`, limit: 5, windowMs: 60 * MINUTE }];
}

export const RATE_LIMIT_MESSAGE = "Забагато спроб. Спробуйте ще раз за 15 хвилин.";
