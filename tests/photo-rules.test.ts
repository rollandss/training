import assert from "node:assert/strict";
import { test } from "node:test";

import { comparisonPair, isOwnPhotoKey, parsePhotoKind, photoExtension } from "../lib/photos/rules";

test("kind and type parsing", () => {
  assert.equal(parsePhotoKind("BEFORE"), "BEFORE");
  assert.equal(parsePhotoKind("before"), null);
  assert.equal(photoExtension("image/webp"), "webp");
  assert.equal(photoExtension("image/png"), null);
});

test("photo keys are scoped to their owner", () => {
  assert.ok(isOwnPhotoKey("abc", "u/abc/x1y2.webp"));
  assert.ok(!isOwnPhotoKey("abc", "u/abd/x1y2.webp"));
  assert.ok(!isOwnPhotoKey("abc", "u/abc/../abd/x.webp"));
  assert.ok(!isOwnPhotoKey("abc", "u/abc/x.png"));
});

test("comparison prefers BEFORE vs latest", () => {
  const d = (n: number) => new Date(2026, 0, n);
  const a = { kind: "PROGRESS", createdAt: d(1) };
  const b = { kind: "BEFORE", createdAt: d(2) };
  const c = { kind: "PROGRESS", createdAt: d(5) };
  const e = { kind: "PROGRESS", createdAt: d(9) };
  assert.deepEqual(comparisonPair([c, a, e, b]), [b, e]);
  assert.equal(comparisonPair([a]), null);
  const f = { kind: "AFTER", createdAt: d(7) };
  assert.deepEqual(comparisonPair([b, f, e]), [b, f]);
});
