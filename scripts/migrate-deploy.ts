import { spawnSync } from "node:child_process";

const maxAttempts = 5;
const delayMs = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
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
