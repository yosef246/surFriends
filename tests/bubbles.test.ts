import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { GROUP_WINDOW_MS, formatClock, groupWithPrevious, senderColor } from "../lib/bubbles.ts";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { safeErrorCode, safeNext } from "../lib/safe-next.ts";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { beachPhotoSrc, creditLabel } from "../lib/beach-photo.ts";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { parseCredits } from "../lib/credits.ts";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { clampLevel, waveHeightLevel } from "../lib/wave-level.ts";

test("senderColor is stable and within 1..6", () => {
  const id = "8f14e45f-ceea-4d2b-a1d6-0a1b2c3d4e5f";
  assert.equal(senderColor(id), senderColor(id));
  const seen = new Set<number>();
  for (let i = 0; i < 300; i++) {
    const c = senderColor(`user-${i}-${i * 7919}`);
    assert.ok(c >= 1 && c <= 6 && Number.isInteger(c));
    seen.add(c);
  }
  assert.equal(seen.size, 6, "all six colors are used");
});

test("groupWithPrevious groups same sender within 10 minutes only", () => {
  const t = (min: number) => new Date(Date.parse("2026-10-29T12:00:00Z") - min * 60_000).toISOString();
  const flags = groupWithPrevious([
    { user_id: "a", created_at: t(0) },
    { user_id: "a", created_at: t(5) }, // grouped
    { user_id: "b", created_at: t(6) }, // other sender
    { user_id: "b", created_at: t(6 + GROUP_WINDOW_MS / 60_000 + 1) }, // too far apart
    { user_id: "b", created_at: t(6 + GROUP_WINDOW_MS / 60_000 + 6) }, // grouped with the previous (5 min)
  ]);
  assert.deepEqual(flags, [false, true, false, false, true]);
  assert.deepEqual(groupWithPrevious([]), []);
});

test("formatClock renders Asia/Jerusalem HH:MM", () => {
  assert.equal(formatClock("2026-10-29T12:32:00Z"), "14:32"); // UTC+2 after the clocks change
  assert.equal(formatClock("2026-07-01T12:05:00Z"), "15:05"); // UTC+3 summer
  assert.equal(formatClock("garbage"), "");
});

test("safeNext allows only same-site relative paths", () => {
  assert.equal(safeNext("/profile"), "/profile");
  assert.equal(safeNext("/beach/3?x=1"), "/beach/3?x=1");
  assert.equal(safeNext("/"), "/");
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "\\\\evil.com", "/\t/evil.com", "javascript:alert(1)", "evil", "", null, undefined]) {
    assert.equal(safeNext(bad as string | null | undefined), "/profile", String(bad));
  }
  assert.equal(safeNext("//x", "/"), "/");
});

test("safeErrorCode keeps simple codes only", () => {
  assert.equal(safeErrorCode("identity_already_exists"), "identity_already_exists");
  assert.equal(safeErrorCode("<script>"), "unknown");
  assert.equal(safeErrorCode(null), "unknown");
});

test("beachPhotoSrc only accepts local beach images", () => {
  assert.equal(beachPhotoSrc("/beaches/poleg.jpg"), "/beaches/poleg.jpg");
  assert.equal(beachPhotoSrc("https://evil.com/a.jpg"), null);
  assert.equal(beachPhotoSrc("/beaches/../x.jpg"), null);
  assert.equal(beachPhotoSrc(null), null);
  assert.equal(creditLabel("Zvi Roger"), "© Zvi Roger · CC");
  assert.equal(creditLabel(null), null);
});

test("parseCredits reads the real CREDITS.md table", () => {
  const rows = parseCredits(readFileSync(new URL("../public/beaches/CREDITS.md", import.meta.url), "utf8"));
  assert.ok(rows.length >= 12);
  const poleg = rows.find((r) => r.file === "poleg.jpg");
  assert.ok(poleg);
  assert.equal(poleg.author, "Yehudit Garinkol");
  assert.equal(poleg.license, "CC BY 2.5");
  assert.ok(poleg.source?.startsWith("https://commons.wikimedia.org/"));
});

test("wave level helpers", () => {
  assert.equal(clampLevel(0), 1);
  assert.equal(clampLevel(7), 5);
  assert.equal(clampLevel(3.4), 3);
  assert.equal(waveHeightLevel(0.2), 1);
  assert.equal(waveHeightLevel(0.5), 2);
  assert.equal(waveHeightLevel(1.2), 3);
  assert.equal(waveHeightLevel(3), 4);
});
