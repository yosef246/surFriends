// Run: node --test tests/*.test.ts   (Node >= 22.18 strips types natively)
// Covers the pure helpers the createReport server action relies on (lib/reports.ts).
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { imagePathFromUrl, textLength, REPORT_TEXT_MAX, WAVE_HEIGHTS } from "../lib/reports.ts";

const SB = "https://abcd1234.supabase.co";
const UID = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const FILE = "33333333-3333-4333-8333-333333333333.jpg";
const url = (uid: string, file = FILE, base = SB) => `${base}/storage/v1/object/public/report-images/${uid}/${file}`;

test("textLength counts code points, not UTF-16 units", () => {
  assert.equal(textLength(""), 0);
  assert.equal(textLength("גלים"), 4);
  assert.equal(textLength("🤙"), 1); // "🤙".length === 2
  assert.equal(textLength("a🤙b"), 3);
  assert.equal(textLength("🤙".repeat(REPORT_TEXT_MAX)), REPORT_TEXT_MAX);
  assert.ok(textLength("🤙".repeat(REPORT_TEXT_MAX + 1)) > REPORT_TEXT_MAX);
});

test("imagePathFromUrl accepts the user's own storage URL", () => {
  assert.equal(imagePathFromUrl(url(UID), UID, SB), `${UID}/${FILE}`);
});

test("imagePathFromUrl rejects other users' folders", () => {
  assert.equal(imagePathFromUrl(url(OTHER), UID, SB), null);
});

test("imagePathFromUrl rejects foreign origins and look-alike hosts", () => {
  assert.equal(imagePathFromUrl(url(UID, FILE, "https://evil.example"), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, FILE, "https://abcd1234.supabase.co.evil.example"), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, FILE, "http://abcd1234.supabase.co"), UID, SB), null); // scheme differs
  assert.equal(
    imagePathFromUrl(`https://abcd1234.supabase.co@evil.example/storage/v1/object/public/report-images/${UID}/${FILE}`, UID, SB),
    null
  );
});

test("imagePathFromUrl rejects traversal, query, hash, bad filenames, other buckets", () => {
  assert.equal(imagePathFromUrl(url(UID) + "?x=1", UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID) + "#x", UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, "../" + OTHER + "/" + FILE), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, "..%2F" + OTHER + "%2F" + FILE), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, "evil.html"), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, FILE.replace(".jpg", ".png")), UID, SB), null);
  assert.equal(imagePathFromUrl(url(UID, "sub/" + FILE), UID, SB), null);
  assert.equal(imagePathFromUrl(`${SB}/storage/v1/object/public/avatars/${UID}/${FILE}`, UID, SB), null);
  assert.equal(imagePathFromUrl(`${SB}/storage/v1/object/sign/report-images/${UID}/${FILE}`, UID, SB), null);
});

test("imagePathFromUrl rejects garbage without throwing", () => {
  for (const bad of ["", "not a url", "javascript:alert(1)", "data:image/png;base64,AAAA", "//evil.example/x.jpg"]) {
    assert.equal(imagePathFromUrl(bad, UID, SB), null, bad);
  }
  assert.equal(imagePathFromUrl(url(UID), UID, "not a url"), null);
});

test("WAVE_HEIGHTS is the closed allow-list used by the server", () => {
  assert.deepEqual([...WAVE_HEIGHTS], ["קרסול", "ברך", "מותן", "כתף", "ראש"]);
});
