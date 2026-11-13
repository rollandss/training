import { spawnSync } from "node:child_process";

const maxAttempts = 5;
const delayMs = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Preview builds share env vars with production unless a separate preview DB is configured.
  // Running `migrate deploy` from a feature branch would then apply its migrations to prod.
  const vercelEnv = process.env.VERCEL_ENV;
  const force = process.env.MIGRATE_ON_PREVIEW === "1";
  if (vercelEnv && vercelEnv !== "production" && !force) {
    console.log(`Skipping prisma migrate deploy on VERCEL_ENV=${vercelEnv} (set MIGRATE_ON_PREVIEW=1 with a separate preview DB to enable).`);
    return;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: process.env,
    });

    if (result.status === 0) {
      return;
    }

    if (attempt < maxAttempts) {
      console.warn(`prisma migrate deploy failed (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs / 1000}s...`);
      await sleep(delayMs);
    }
  }

  process.exit(1);
}

void main();
