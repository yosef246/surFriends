// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/profile.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = mod as any;

const base = { display_name: "דנה", skill_level: null, bio: null };

test("validateProfileInput: name is trimmed, 2-40 code points", () => {
  assert.equal(p.validateProfileInput({ ...base, display_name: "  דנה כהן " }).value.display_name, "דנה כהן");
  assert.ok(p.validateProfileInput({ ...base, display_name: "אב" }).ok);
  assert.ok(p.validateProfileInput({ ...base, display_name: "x".repeat(40) }).ok);
  assert.ok(p.validateProfileInput({ ...base, display_name: "🤙".repeat(40) }).ok);
  for (const bad of ["", " ", "א", " א ", "x".repeat(41), "🤙".repeat(41), "​​", null, 5, undefined]) {
    assert.equal(p.validateProfileInput({ ...base, display_name: bad }).ok, false, String(bad));
  }
  assert.equal(p.validateProfileInput(null).ok, false);
});

test("validateProfileInput: skill_level enum or null", () => {
  for (const s of ["beginner", "intermediate", "advanced", "pro", null, undefined]) {
    assert.ok(p.validateProfileInput({ ...base, skill_level: s }).ok, String(s));
  }
  assert.equal(p.validateProfileInput({ ...base, skill_level: undefined }).value.skill_level, null);
  for (const s of ["expert", "", 3]) assert.equal(p.validateProfileInput({ ...base, skill_level: s }).ok, false);
});

test("validateProfileInput: bio <= 160 code points, blank -> null, one line", () => {
  assert.equal(p.validateProfileInput({ ...base, bio: "  " }).value.bio, null);
  assert.equal(p.validateProfileInput({ ...base, bio: "" }).value.bio, null);
  assert.equal(p.validateProfileInput({ ...base, bio: undefined }).value.bio, null);
  assert.equal(p.validateProfileInput({ ...base, bio: " גולש\nבחיפה " }).value.bio, "גולש בחיפה");
  assert.ok(p.validateProfileInput({ ...base, bio: "x".repeat(160) }).ok);
  assert.equal(p.validateProfileInput({ ...base, bio: "x".repeat(161) }).ok, false);
  assert.ok(p.validateProfileInput({ ...base, bio: "🤙".repeat(160) }).ok);
  assert.equal(p.validateProfileInput({ ...base, bio: "🤙".repeat(161) }).ok, false);
  assert.equal(p.validateProfileInput({ ...base, bio: 7 }).ok, false);
});

test("isBeachId and setFavorite", () => {
  assert.ok(p.isBeachId(3));
  for (const b of [0, -1, 1.5, "3", null, NaN]) assert.equal(p.isBeachId(b), false);
  assert.deepEqual(p.setFavorite([1, 2], 3, true), [1, 2, 3]);
  assert.deepEqual(p.setFavorite([1, 2, 3], 3, true), [1, 2, 3]); // idempotent
  assert.deepEqual(p.setFavorite([1, 2], 2, false), [1]);
  assert.deepEqual(p.setFavorite([1], 9, false), [1]);
});

test("default name: no first name for the greeting, real names use the first word", () => {
  assert.equal(p.DEFAULT_DISPLAY_NAME, "גולש/ת");
  assert.equal(p.validateProfileInput({ ...base, display_name: p.DEFAULT_DISPLAY_NAME }).ok, true);
  assert.equal(p.firstNameOf("גולש/ת"), "");
  assert.equal(p.firstNameOf(null), "");
  assert.equal(p.firstNameOf("  דנה כהן "), "דנה");
  assert.equal(p.isDefaultName(" גולש/ת "), true);
  assert.equal(p.isDefaultName("דנה"), false);
});
