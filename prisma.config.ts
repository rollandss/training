import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prefer .env over stale shell exports so Prisma CLI targets the same DB as the app.
loadEnv({ path: ".env", override: true });

function getDatasourceUrl() {
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return env("DATABASE_URL");
  }

  try {
    const url = new URL(databaseUrl);
    if (url.hostname.includes("-pooler")) {
      url.hostname = url.hostname.replace("-pooler", "");
      return url.toString();
    }
  } catch {
    // Fall back to DATABASE_URL when parsing fails.
  }

  return databaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatasourceUrl(),
  },
});

