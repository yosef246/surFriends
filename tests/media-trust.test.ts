// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { trustedHost, isTrustedMediaFor } from "../lib/media-trust.ts";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { announcePlay, subscribePlay, shouldPause } from "../lib/video-bus.ts";

test("isTrustedMedia host check", () => {
  const host = trustedHost("https://abc.supabase.co");
  assert.equal(host, "abc.supabase.co");
  assert.equal(isTrustedMediaFor(host, "https://abc.supabase.co/storage/v1/object/public/report-videos/a.mp4"), true);
  assert.equal(isTrustedMediaFor(host, "https://evil.example/a.mp4"), false);
  assert.equal(isTrustedMediaFor(host, "javascript:alert(1)"), false);
  assert.equal(isTrustedMediaFor(host, "not a url"), false);
  assert.equal(isTrustedMediaFor(host, null), false);
  assert.equal(isTrustedMediaFor(null, "https://abc.supabase.co/x"), false);
  assert.equal(trustedHost(undefined), null);
});

test("video bus pauses others only", () => {
  assert.equal(shouldPause("a", "b"), true);
  assert.equal(shouldPause("a", "a"), false);
  const seen: string[] = [];
  const off = subscribePlay((id: string) => seen.push(id));
  announcePlay("x");
  off();
  announcePlay("y");
  assert.deepEqual(seen, ["x"]);
});
