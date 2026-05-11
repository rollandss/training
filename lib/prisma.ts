import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getConnectionString() {
  const cs = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!cs) throw new Error("DATABASE_URL is required");
  if (cs.startsWith("file:")) {
    throw new Error("DATABASE_URL points to SQLite (file:...). Set DATABASE_URL to PostgreSQL.");
  }
  try {
    const u = new URL(cs);
    // For SCRAM auth, pg needs a defined password.
    if (u.password === "") {
      throw new Error("Postgres password is missing in DATABASE_URL");
    }
  } catch {
    // ignore parse errors; PrismaPg will throw a better one
  }
  return cs;
}

function makeClient() {
  const connectionString = getConnectionString();
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ??
  makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
