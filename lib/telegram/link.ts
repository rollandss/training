import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const CODE_TTL_MS = 15 * 60 * 1000;

function hash(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

/** Creates a one-time code for the deep link t.me/<bot>?start=<code>. Old codes of the user are dropped. */
export async function createTelegramLinkCode(userId: string) {
  const code = randomBytes(16).toString("base64url"); // 22 chars, fits Telegram's 64-char start payload
  await prisma.$transaction([
    prisma.telegramLinkCode.deleteMany({ where: { userId } }),
    prisma.telegramLinkCode.create({
      data: { userId, codeHash: hash(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    }),
  ]);
  return code;
}

/** Links the chat to the code's owner. Returns the user id, or null for an unknown/expired code. */
export async function consumeTelegramLinkCode(code: string, chat: { chatId: string; username?: string | null }) {
  const row = await prisma.telegramLinkCode.findUnique({ where: { codeHash: hash(code) } });
  if (!row || row.expiresAt < new Date()) return null;

  await prisma.$transaction([
    prisma.telegramLinkCode.deleteMany({ where: { userId: row.userId } }),
    // a chat can belong to one account only; re-linking moves it
    prisma.telegramLink.deleteMany({ where: { OR: [{ chatId: chat.chatId }, { userId: row.userId }] } }),
    prisma.telegramLink.create({
      data: { userId: row.userId, chatId: chat.chatId, username: chat.username ?? null },
    }),
  ]);
  return row.userId;
}

export function findLinkByChat(chatId: string) {
  return prisma.telegramLink.findUnique({ where: { chatId } });
}

export function unlinkChat(chatId: string) {
  return prisma.telegramLink.deleteMany({ where: { chatId } });
}
