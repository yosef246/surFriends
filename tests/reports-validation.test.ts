// Run: node --test tests/*.test.ts   (Node >= 22.18 strips types natively)
// Covers the pure helpers the createReport server action relies on (lib/reports.ts).
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { videoPathFromUrl, imagePathFromUrl, textLength, REPORT_TEXT_MAX, WAVE_HEIGHTS } from "../lib/reports.ts";

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

// ---- validateReportInput (shared client + server rules) ----
// @ts-expect-error -- .ts extension is required by node --test
import { validateReportInput, isBlankText } from "../lib/reports.ts";

const RID = "44444444-4444-4444-8444-444444444444";
const base = { id: RID, beachId: 1, text: "נקי", waveRating: null, waveHeight: null, imageUrl: null };
const IMG = { userId: UID, supabaseUrl: SB };

test("validateReportInput accepts text only, rating only, and trims", () => {
  const a = validateReportInput({ ...base, text: "  נקי  " });
  assert.ok(a.ok && a.value.text === "נקי" && a.value.id === RID);
  const b = validateReportInput({ ...base, text: "", waveRating: 3 });
  assert.ok(b.ok && b.value.text === null && b.value.waveRating === 3);
});

test("validateReportInput rejects bad id, beach, rating, height, empty", () => {
  assert.equal(validateReportInput({ ...base, id: "nope" }).ok, false);
  assert.equal(validateReportInput({ ...base, id: undefined }).ok, false);
  assert.equal(validateReportInput({ ...base, beachId: 0 }).ok, false);
  assert.equal(validateReportInput({ ...base, beachId: 1.5 }).ok, false);
  assert.equal(validateReportInput({ ...base, waveRating: 6 }).ok, false);
  assert.equal(validateReportInput({ ...base, waveRating: 2.5 }).ok, false);
  assert.equal(validateReportInput({ ...base, waveHeight: "ענק" }).ok, false);
  assert.equal(validateReportInput({ ...base, text: "", waveRating: null }).ok, false);
  assert.equal(validateReportInput(null).ok, false);
});

test("validateReportInput: blank/zero-width text counts as empty; newline runs collapse", () => {
  assert.ok(isBlankText(" \n\t​‏"));
  assert.equal(validateReportInput({ ...base, text: "​​" }).ok, false);
  assert.equal(validateReportInput({ ...base, text: "\n\n" }).ok, false);
  const r = validateReportInput({ ...base, text: "a\n\n\n\n\nb" });
  assert.ok(r.ok && r.value.text === "a\n\nb");
});

test("validateReportInput enforces the 500 code point limit", () => {
  assert.equal(validateReportInput({ ...base, text: "🤙".repeat(REPORT_TEXT_MAX) }).ok, true);
  assert.equal(validateReportInput({ ...base, text: "🤙".repeat(REPORT_TEXT_MAX + 1) }).ok, false);
});

test("validateReportInput checks imageUrl against the user's own folder", () => {
  assert.equal(validateReportInput({ ...base, imageUrl: url(UID) }, IMG).ok, true);
  assert.equal(validateReportInput({ ...base, imageUrl: url(OTHER) }, IMG).ok, false);
  assert.equal(validateReportInput({ ...base, imageUrl: url(UID) }).ok, false); // no context -> reject
  assert.equal(validateReportInput({ ...base, imageUrl: 5 }, IMG).ok, false);
});

const VID = "44444444-4444-4444-8444-444444444444";
const vurl = (uid: string, file: string) => `${SB}/storage/v1/object/public/report-videos/${uid}/${file}`;
const rbase = { id: VID, beachId: 1, text: "גלים", waveRating: null, waveHeight: null, imageUrl: null };
const ctx = { userId: UID, supabaseUrl: SB };
const vid = {
  videoUrl: vurl(UID, `${VID}.mp4`),
  videoPosterUrl: vurl(UID, `${VID}-poster.jpg`),
  videoDurationMs: 9000,
};

test("videoPathFromUrl accepts own video and poster, rejects others", () => {
  assert.equal(videoPathFromUrl(vid.videoUrl, UID, SB), `${UID}/${VID}.mp4`);
  assert.equal(videoPathFromUrl(vid.videoPosterUrl, UID, SB, "poster"), `${UID}/${VID}-poster.jpg`);
  assert.equal(videoPathFromUrl(vid.videoPosterUrl, UID, SB), null);
  assert.equal(videoPathFromUrl(vurl(OTHER, `${VID}.mp4`), UID, SB), null);
  assert.equal(videoPathFromUrl(vurl(UID, `${VID}.exe`), UID, SB), null);
});

test("validateReportInput accepts a full video report", () => {
  const r = validateReportInput({ ...rbase, ...vid }, ctx);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.value.videoDurationMs, 9000);
});

test("validateReportInput without video leaves video fields null", () => {
  const r = validateReportInput(rbase, ctx);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.value.videoUrl, null);
});

test("validateReportInput rejects photo + video", () => {
  const r = validateReportInput({ ...rbase, ...vid, imageUrl: url(UID) }, ctx);
  assert.ok(!r.ok);
});

test("validateReportInput rejects video without poster or duration, or bad duration", () => {
  assert.ok(!validateReportInput({ ...rbase, videoUrl: vid.videoUrl, videoDurationMs: 5000 }, ctx).ok);
  assert.ok(!validateReportInput({ ...rbase, videoUrl: vid.videoUrl, videoPosterUrl: vid.videoPosterUrl }, ctx).ok);
  assert.ok(!validateReportInput({ ...rbase, ...vid, videoDurationMs: 0 }, ctx).ok);
  assert.ok(!validateReportInput({ ...rbase, ...vid, videoDurationMs: 10501 }, ctx).ok);
  assert.ok(validateReportInput({ ...rbase, ...vid, videoDurationMs: 10500 }, ctx).ok);
});

test("validateReportInput: video report still needs text or rating", () => {
  assert.ok(!validateReportInput({ ...rbase, text: "", ...vid }, ctx).ok);
  assert.ok(validateReportInput({ ...rbase, text: "", waveRating: 3, ...vid }, ctx).ok);
});
