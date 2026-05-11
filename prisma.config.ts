import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prefer .env over stale shell exports so Prisma CLI targets the same DB as the app.
loadEnv({ path: ".env", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Use DIRECT_URL for migrations if provided (recommended for pooled DBs),
  // otherwise fallback to DATABASE_URL.
  datasource: {
    url: process.env.DIRECT_URL ? process.env.DIRECT_URL : env("DATABASE_URL"),
  },
});

