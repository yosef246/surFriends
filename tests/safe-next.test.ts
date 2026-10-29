// Open-redirect guard used by /login, /callback and the sf_next cookie.
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { safeNextPath } from "../lib/safe-next.ts";

test("allows same-origin relative paths (with query)", () => {
  for (const p of ["/", "/new", "/new?beach=3", "/beach/4", "/profile/abc"]) assert.equal(safeNextPath(p), p);
});

test("falls back to / for empty values", () => {
  for (const p of [null, undefined, ""]) assert.equal(safeNextPath(p), "/");
});

test("blocks absolute, protocol-relative and scheme URLs", () => {
  for (const p of ["https://evil.example", "http://evil.example/x", "//evil.example", "///evil.example", "javascript:alert(1)", "evil.example", "data:text/html,x"]) {
    assert.equal(safeNextPath(p), "/", p);
  }
});

test("blocks backslash and control-character tricks", () => {
  for (const p of ["/\\evil.example", "\\\\evil.example", "/\t/evil.example", "/\n/evil.example", "/\r/evil.example", "/\u0000x"]) {
    assert.equal(safeNextPath(p), "/", JSON.stringify(p));
  }
});

test("never loops back into the auth pages", () => {
  for (const p of ["/login", "/login?next=/new", "/callback", "/callback?code=1"]) assert.equal(safeNextPath(p), "/", p);
});

// Pins current behaviour: percent-encoded slashes are not decoded; safe because the callback prefixes `origin`.
test("percent-encoded double slash stays a single same-origin path", () => {
  assert.equal(safeNextPath("/%2Fevil.example"), "/%2Fevil.example");
});
