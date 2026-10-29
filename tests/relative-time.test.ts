// Formatting helpers behind <RelativeTime> (Asia/Jerusalem).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// RelativeTime.tsx is a .tsx client component (node cannot load it). Its formatting helpers are pure and sit above
// the React part, so load just that slice (everything before `const listeners`) as a temp .ts module.
const src = readFileSync(new URL("../components/shared/RelativeTime.tsx", import.meta.url), "utf8");
const pure = src.slice(0, src.indexOf("const listeners")).replace(/^"use client";\s*/, "").replace(/import .*react.*;\s*/, "");
const dir = mkdtempSync(join(tmpdir(), "sf-rt-"));
writeFileSync(join(dir, "rt.ts"), pure);
const { formatRelative, formatAbsolute } = (await import(pathToFileURL(join(dir, "rt.ts")).href)) as {
  formatRelative: (iso: string, now: number) => string;
  formatAbsolute: (iso: string) => string;
};

const NOW = Date.parse("2026-10-29T12:00:00Z"); // 14:00 in Israel (UTC+2, winter time after Oct 25 2026)
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const H = 3_600_000;

test("relative buckets", () => {
  assert.equal(formatRelative(ago(10_000), NOW), "עכשיו");
  assert.equal(formatRelative(ago(MIN), NOW), "לפני דקה");
  assert.equal(formatRelative(ago(5 * MIN), NOW), "לפני 5 דקות");
  assert.equal(formatRelative(ago(H), NOW), "לפני שעה");
  assert.equal(formatRelative(ago(2 * H), NOW), "לפני שעתיים");
  assert.equal(formatRelative(ago(3 * H), NOW), "לפני 3 שעות");
});

test("yesterday and older use Israel calendar days, not UTC days", () => {
  // 21:30Z on the 28th is 23:30 on the 28th in Israel -> yesterday relative to 14:00 on the 29th
  assert.equal(formatRelative("2026-10-28T21:30:00Z", NOW), "אתמול 23:30");
  assert.equal(formatRelative("2026-10-20T10:00:00Z", NOW), "20.10");
});

test("a report just before local midnight is 'minutes ago', and 3h across midnight is 'yesterday'", () => {
  const now = Date.parse("2026-10-28T22:30:00Z"); // 00:30 Israel on the 29th
  assert.equal(formatRelative("2026-10-28T21:50:00Z", now), "לפני 40 דקות");
  assert.equal(formatRelative("2026-10-28T19:30:00Z", now), "אתמול 21:30");
});

test("absolute format", () => {
  assert.equal(formatAbsolute("2026-10-29T05:42:00Z"), "יום ה׳ 29.10, 07:42");
});
