// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/splash.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = mod as any;

test("splash: ready session waits for the 2s minimum", () => {
  assert.equal(s.splashDismissDelay({ elapsedMs: 0, ready: true, reducedMotion: false }), 2000);
  assert.equal(s.splashDismissDelay({ elapsedMs: 1500, ready: true, reducedMotion: false }), 500);
  assert.equal(s.splashDismissDelay({ elapsedMs: 2500, ready: true, reducedMotion: false }), 0);
});

test("splash: not ready waits up to the 4s cap, then dismisses anyway", () => {
  assert.equal(s.splashDismissDelay({ elapsedMs: 2500, ready: false, reducedMotion: false }), 1500);
  assert.equal(s.splashDismissDelay({ elapsedMs: 9000, ready: false, reducedMotion: false }), 0);
});

test("splash: reduced motion shortens the minimum to 800ms", () => {
  assert.equal(s.splashDismissDelay({ elapsedMs: 0, ready: true, reducedMotion: true }), 800);
  assert.equal(s.splashDismissDelay({ elapsedMs: 900, ready: true, reducedMotion: true }), 0);
});
