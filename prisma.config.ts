import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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

