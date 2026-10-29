import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as fsMod from "../lib/feed-state.ts";
// Loosely typed: tests use minimal fixtures.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fs = fsMod as any;

type R = { id: string; text: string | null; replyCount: number; comingCount: number; created_at: string; [k: string]: unknown };
const mk = (id: string, iso: string, extra: object = {}): R => ({
  id, user_id: "u", text: "t", image_url: null, wave_rating: null, wave_height_estimate: null,
  created_at: iso, author: null, beach: null, replyCount: 0, comingCount: 0, ...extra,
});
const A = mk("a", "2026-10-29T10:00:00.000Z");
const B = mk("b", "2026-10-29T09:00:00.000Z");
const C = mk("c", "2026-10-29T11:00:00.000Z");

test("addIncoming: direct prepends, otherwise queues, dedupes by id", () => {
  let s: { items: R[]; queue: R[] } = { items: [A, B], queue: [] };
  s = fs.addIncoming(s, C, { direct: true });
  assert.deepEqual(s.items.map((r: { id: string }) => r.id), ["c", "a", "b"]);
  assert.equal(fs.addIncoming(s, C, { direct: false }), s);
  const d = mk("d", "2026-10-29T12:00:00.000Z");
  s = fs.addIncoming(s, d, { direct: false });
  assert.equal(s.queue.length, 1);
  assert.equal(fs.addIncoming(s, d, { direct: true }), s);
});

test("flushQueue merges queue on top and clears it", () => {
  const s = fs.flushQueue({ items: [A, B], queue: [C] });
  assert.deepEqual(s.items.map((r: { id: string }) => r.id), ["c", "a", "b"]);
  assert.equal(s.queue.length, 0);
});

test("removeReport / dropExpired", () => {
  const s = fs.removeReport({ items: [A, B], queue: [C] }, "c");
  assert.equal(s.queue.length, 0);
  const e = fs.dropExpired({ items: [A, B], queue: [] }, "2026-10-29T09:30:00.000Z");
  assert.deepEqual(e.items.map((r: { id: string }) => r.id), ["a"]);
  const same = { items: [A], queue: [] };
  assert.equal(fs.dropExpired(same, "2026-10-29T00:00:00.000Z"), same);
  assert.equal(fs.dropExpired({ items: [B], queue: [] }, B.created_at).items.length, 0); // boundary expired
});

test("applyReplyDelta clamps at zero and ignores unknown reports", () => {
  const s: { items: R[]; queue: R[] } = { items: [mk("a", A.created_at, { replyCount: 1, comingCount: 1 })], queue: [] };
  assert.equal(fs.applyReplyDelta(s, "zzz", { replies: 1, coming: 0 }), s);
  const up = fs.applyReplyDelta(s, "a", { replies: 1, coming: 1 });
  assert.equal(up.items[0].replyCount, 2);
  const down = fs.applyReplyDelta(up, "a", { replies: -5, coming: -5 });
  assert.equal(down.items[0].replyCount, 0);
});

test("appendPage dedupes and leaves prepended items out of the cursor (oldest stays last)", () => {
  let s: { items: R[]; queue: R[] } = { items: [A, B], queue: [] };
  s = fs.addIncoming(s, C, { direct: true });
  assert.equal(s.items[s.items.length - 1].id, "b");
  const old = mk("o", "2026-10-29T01:00:00.000Z");
  s = fs.appendPage(s, [B, old]);
  assert.deepEqual(s.items.map((r: { id: string }) => r.id), ["c", "a", "b", "o"]);
});

test("healWithFirstPage refreshes counts, drops deleted-in-range, queues unknown newer", () => {
  const s = { items: [A, B], queue: [] };
  const page = [C, mk("a", A.created_at, { replyCount: 4 })]; // b deleted (inside range? b older than oldest=a) 
  const h = fs.healWithFirstPage(s, page);
  assert.equal(h.items.find((r: { id: string }) => r.id === "a")?.replyCount, 4);
  assert.ok(h.items.some((r: { id: string }) => r.id === "b")); // older than page range: kept
  assert.deepEqual(h.queue.map((r: { id: string }) => r.id), ["c"]);
  const h2 = fs.healWithFirstPage({ items: [A, B], queue: [] }, [mk("a", A.created_at), mk("x", "2026-10-29T08:00:00.000Z")]);
  assert.ok(!h2.items.some((r: { id: string }) => r.id === "b")); // b inside range, missing -> deleted
});
