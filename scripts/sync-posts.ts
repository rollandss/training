/**
 * Pushes edits from posts_uk_md/*.md into existing DailyPost rows — safely.
 *
 * - Only touches posts whose stored body is still markdown, i.e. never edited in
 *   the admin editor (TipTap saves HTML). Admin-edited posts are listed, not changed.
 * - Updates body and title only; never creates/deletes posts, never touches images.
 * - Idempotent: posts already matching their file are skipped.
 *
 * Usage:  npm run posts:sync            (dry run: prints what would change)
 *         npm run posts:sync -- --apply (writes)
 * Runs automatically with --apply on Vercel production builds (see vercel-build).
 */
import fs from "node:fs/promises";
import path from "node:path";

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env", override: false });

// TipTap output always starts with a tag; seeded markdown starts with "# Title".
const looksLikeHtml = (body: string) => body.trimStart().startsWith("<");

function parseTitle(content: string, fallback: string) {
  const first = content.split("\n").find((line) => line.trim().length > 0);
  if (first?.trim().startsWith("#")) return first.replace(/^#+\s*/, "").trim() || fallback;
  return fallback;
}

function slugForFile(name: string) {
  const day = /^posts__([0-9]+)\.md$/i.exec(name);
  if (day) return { slug: `day-${Number(day[1])}`, fallback: `День ${Number(day[1])}` };
  const prep = /^posts__([a-z]+)\.md$/i.exec(name);
  if (prep) return { slug: `prep-${prep[1]}`, fallback: prep[1] };
  return null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const dir = path.join(process.cwd(), "posts_uk_md");
  const files = (await fs.readdir(dir)).filter((n) => n.endsWith(".md")).sort();

  let updated = 0;
  let unchanged = 0;
  const editedInAdmin: string[] = [];
  const missing: string[] = [];

  try {
    for (const name of files) {
      const target = slugForFile(name);
      if (!target) continue;
      const body = await fs.readFile(path.join(dir, name), "utf8");
      const title = parseTitle(body, target.fallback);

      const row = await prisma.dailyPost.findUnique({
        where: { slug: target.slug },
        select: { id: true, bodyUk: true, titleUk: true },
      });
      if (!row) {
        missing.push(target.slug);
        continue;
      }
      if (looksLikeHtml(row.bodyUk)) {
        if (row.bodyUk.trim() !== body.trim()) editedInAdmin.push(target.slug);
        continue;
      }
      if (row.bodyUk === body && row.titleUk === title) {
        unchanged++;
        continue;
      }
      updated++;
      console.log(`${apply ? "update" : "would update"}: ${target.slug}`);
      if (apply) {
        await prisma.dailyPost.update({ where: { id: row.id }, data: { bodyUk: body, titleUk: title } });
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(
    `posts:sync ${apply ? "applied" : "dry run"} — ${updated} ${apply ? "updated" : "to update"}, ${unchanged} unchanged, ` +
      `${editedInAdmin.length} edited in admin (left as is), ${missing.length} not in DB.`,
  );
  if (editedInAdmin.length) console.log(`Edited in admin, review manually: ${editedInAdmin.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
