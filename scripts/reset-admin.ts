import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env", override: true });

const adminEmail = "admin@example.com";

function adminPassword() {
  const raw = process.env.ADMIN_SEED_PASSWORD ?? "admin-admin-CHANGE";
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const password = adminPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.deleteMany({ where: { email: "admin@local" } });
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      profile: { create: { onboardingDone: true } },
    },
    update: {
      passwordHash,
      role: "ADMIN",
      profile: {
        upsert: {
          create: { onboardingDone: true },
          update: { onboardingDone: true },
        },
      },
    },
  });

  const program = await prisma.program.findUnique({ where: { slug: "100-dniv" } });
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });
  if (program) {
    await prisma.userProgram.upsert({
      where: { userId_programId: { userId: admin.id, programId: program.id } },
      create: { userId: admin.id, programId: program.id, cursorDay: 1 },
      update: {},
    });
  }

  console.log(`Admin ready: ${adminEmail} / ${password}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
