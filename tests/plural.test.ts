import assert from "node:assert/strict";
import { test } from "node:test";

import { DAY_FORMS, pluralUk } from "../lib/plural";

test("pluralUk picks the right form", () => {
  assert.equal(pluralUk(1, DAY_FORMS), "день");
  assert.equal(pluralUk(3, DAY_FORMS), "дні");
  assert.equal(pluralUk(5, DAY_FORMS), "днів");
  assert.equal(pluralUk(11, DAY_FORMS), "днів");
  assert.equal(pluralUk(14, DAY_FORMS), "днів");
  assert.equal(pluralUk(21, DAY_FORMS), "день");
  assert.equal(pluralUk(22, DAY_FORMS), "дні");
  assert.equal(pluralUk(100, DAY_FORMS), "днів");
});
