// Registers the webhook and the command menu with Telegram.
// Usage: PUBLIC_BASE_URL=https://your.domain npx tsx scripts/telegram-set-webhook.ts
import { createHash } from "node:crypto";

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const base = process.env.PUBLIC_BASE_URL;

async function tg(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(method, json.ok ? "ok" : json);
}

async function main() {
  if (!token || !secret || !base) throw new Error("Need TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and PUBLIC_BASE_URL");
  await tg("setWebhook", {
    url: `${base.replace(/\/$/, "")}/api/telegram/webhook`,
    secret_token: createHash("sha256").update(secret).digest("hex"),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  await tg("setMyCommands", {
    commands: [
      { command: "today", description: "Пост дня" },
      { command: "mark", description: "Відмітити сьогоднішній день" },
      { command: "settings", description: "Нагадування" },
      { command: "stop", description: "Відʼєднати Telegram" },
    ],
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
