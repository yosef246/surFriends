// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { pickRecorderMime, scaledSize, validateDuration, extForFile, formatDuration } from "../lib/video-helpers.ts";

test("pickRecorderMime follows preference order", () => {
  assert.deepEqual(pickRecorderMime(() => true), { mime: "video/mp4;codecs=avc1", ext: "mp4" });
  assert.deepEqual(pickRecorderMime((m: string) => m.startsWith("video/webm")), { mime: "video/webm;codecs=vp9", ext: "webm" });
  assert.deepEqual(pickRecorderMime((m: string) => m === "video/webm"), { mime: "video/webm", ext: "webm" });
  assert.deepEqual(pickRecorderMime((m: string) => m === "video/mp4"), { mime: "video/mp4", ext: "mp4" });
  assert.equal(pickRecorderMime(() => false), null);
  assert.equal(pickRecorderMime(() => { throw new Error("x"); }), null);
});

test("scaledSize keeps aspect, even, no upscale", () => {
  assert.deepEqual(scaledSize(1280, 720), { width: 480, height: 270 });
  assert.deepEqual(scaledSize(720, 1280), { width: 270, height: 480 });
  assert.deepEqual(scaledSize(1920, 1080), { width: 480, height: 270 });
  assert.deepEqual(scaledSize(321, 201), { width: 322, height: 202 });
  assert.deepEqual(scaledSize(1000, 1000), { width: 480, height: 480 });
  const s = scaledSize(1081, 1919);
  assert.ok(s.width % 2 === 0 && s.height % 2 === 0 && Math.max(s.width, s.height) <= 480);
});

test("validateDuration", () => {
  assert.equal(validateDuration(8000).ok, true);
  assert.equal(validateDuration(10500).ok, true);
  assert.equal(validateDuration(10501).ok, false);
  assert.equal(validateDuration(0).ok, false);
  assert.equal(validateDuration(NaN).ok, false);
});

test("extForFile", () => {
  assert.equal(extForFile("video/mp4"), "mp4");
  assert.equal(extForFile("video/webm;codecs=vp9"), "webm");
  assert.equal(extForFile("video/quicktime"), "mov");
  assert.equal(extForFile("video/x-matroska"), null);
  assert.equal(extForFile(""), null);
});

test("formatDuration", () => {
  assert.equal(formatDuration(8000), "0:08");
  assert.equal(formatDuration(10400), "0:10");
  assert.equal(formatDuration(0), "0:00");
});
