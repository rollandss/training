import assert from "node:assert/strict";
import { test } from "node:test";

import {
  escapeHtml,
  markCallbackData,
  markKeyboard,
  parseCommand,
  parseMarkCallback,
  parseStartPayload,
} from "../lib/telegram/messages";

test("mark callback round-trips", () => {
  const data = markCallbackData("STRETCHING", "2026-11-14");
  assert.deepEqual(parseMarkCallback(data), { status: "STRETCHING", dayKey: "2026-11-14" });
  assert.ok(Buffer.byteLength(data) <= 64);
});

test("mark callback rejects junk", () => {
  assert.equal(parseMarkCallback("mark:NONE:2026-11-14"), null);
  assert.equal(parseMarkCallback("mark:REST:2026-1-14"), null);
  assert.equal(parseMarkCallback("drop table"), null);
});

test("keyboard has four statuses", () => {
  const kb = markKeyboard("2026-11-14");
  assert.equal(kb.inline_keyboard.flat().length, 4);
});

test("start payload", () => {
  assert.equal(parseStartPayload("/start abc123"), "abc123");
  assert.equal(parseStartPayload("/start@stodenka_bot abc123"), "abc123");
  assert.equal(parseStartPayload("/start"), "");
  assert.equal(parseStartPayload("/today"), null);
});

test("commands", () => {
  assert.equal(parseCommand("/today"), "today");
  assert.equal(parseCommand("/Mark@stodenka_bot"), "mark");
  assert.equal(parseCommand("hello"), null);
});

test("escape html", () => {
  assert.equal(escapeHtml("a < b & c > d"), "a &lt; b &amp; c &gt; d");
});
