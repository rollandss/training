import { spawnSync } from "node:child_process";

// Same gate as migrate-deploy: preview builds share the production DB, so only
// production deploys push post content. Failure must not block the deploy.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`Skipping posts:sync on VERCEL_ENV=${process.env.VERCEL_ENV}`);
} else {
  const r = spawnSync("npx", ["tsx", "scripts/sync-posts.ts", "--apply"], { stdio: "inherit", env: process.env });
  if (r.status !== 0) console.warn("posts:sync failed — deploy continues; run `npm run posts:sync -- --apply` manually.");
}
