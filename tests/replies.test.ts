// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/replies.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r = mod as any;

const RID = "11111111-1111-4111-8111-111111111111";
const CID = "22222222-2222-4222-8222-222222222222";

test("validateReplyInput: trims, 1-200 code points, uuid checks", () => {
  const ok = r.validateReplyInput(RID, "  היי  ", CID);
  assert.ok(ok.ok);
  assert.deepEqual(ok.value, { reportId: RID, text: "היי", id: CID });
  assert.ok(r.validateReplyInput(RID, "x".repeat(200)).ok);
  assert.equal(r.validateReplyInput(RID, "x".repeat(201)).ok, false);
  // emoji = 1 code point though 2 UTF-16 units
  assert.ok(r.validateReplyInput(RID, "🤙".repeat(200)).ok);
  assert.equal(r.validateReplyInput(RID, "🤙".repeat(201)).ok, false);
  for (const bad of ["", "   ", "​​", null, 5]) assert.equal(r.validateReplyInput(RID, bad).ok, false);
  assert.equal(r.validateReplyInput("nope", "hi").ok, false);
  assert.equal(r.validateReplyInput(RID, "hi", "nope").ok, false);
  assert.equal(r.validateReplyInput(RID, "a\n\n\n\nb").value.text, "a\n\nb");
  assert.match(r.validateReplyInput(RID, "hi").value.id, /^[0-9a-f-]{36}$/); // generated when omitted
});

test("validateReactionInput accepts only coming / on_the_way", () => {
  assert.ok(r.validateReactionInput(RID, "coming").ok);
  assert.ok(r.validateReactionInput(RID, "on_the_way").ok);
  assert.equal(r.validateReactionInput(RID, "liked").ok, false);
  assert.equal(r.validateReactionInput("x", "coming").ok, false);
  assert.equal(r.otherKind("coming"), "on_the_way");
  assert.equal(r.otherKind("on_the_way"), "coming");
});

test("mapReplyDbError maps rate limit / FK / check to Hebrew", () => {
  assert.equal(r.mapReplyDbError({ code: "P0001", message: "rate_limit_replies" }), r.MSG_RATE_LIMIT);
  assert.equal(r.mapReplyDbError({ code: "23503", message: "fk" }), r.MSG_REPORT_GONE);
  assert.match(r.mapReplyDbError({ code: "23514", message: "replies_text_or_reaction" }), /תגובה/);
  assert.equal(r.mapReplyDbError({ code: "42501" }), r.MSG_SESSION);
  assert.equal(r.mapReplyDbError(null), r.MSG_GENERIC);
});

const mk = (id: string, iso: string, extra: object = {}) => ({
  id, user_id: "u", text: "t", quick_reaction: null, created_at: iso, author: null, ...extra,
});

test("thread helpers: upsert dedupes optimistic vs echo, sorts oldest -> newest", () => {
  const a = mk("a", "2026-10-29T10:00:00.000Z");
  const b = mk("b", "2026-10-29T09:00:00.000Z");
  let l = r.upsertReply([a], b);
  assert.deepEqual(l.map((x: { id: string }) => x.id), ["b", "a"]);
  const opt = mk("c", "2026-10-29T11:00:00.000Z", { pending: true, author: { display_name: "me", avatar_url: null } });
  l = r.upsertReply(l, opt);
  l = r.upsertReply(l, mk("c", "2026-10-29T11:00:01.000Z")); // echo without author keeps the optimistic author
  assert.equal(l.length, 3);
  assert.equal(l[2].author.display_name, "me");
  assert.equal(r.removeReplyById(l, "zzz"), l);
  assert.equal(r.removeReplyById(l, "c").length, 2);
});

test("mergeReplies keeps unconfirmed optimistic items", () => {
  const pend = mk("p", "2026-10-29T12:00:00.000Z", { pending: true });
  const m = r.mergeReplies(
    [pend, mk("a", "2026-10-29T10:00:00.000Z")],
    [mk("a", "2026-10-29T10:00:00.000Z"), mk("b", "2026-10-29T11:00:00.000Z")]
  );
  assert.deepEqual(m.map((x: { id: string }) => x.id), ["a", "b", "p"]);
  assert.equal(r.mergeReplies([pend], [mk("p", "2026-10-29T12:00:00.000Z")]).length, 1);
});

test("mapReplyRow normalizes unknown reactions", () => {
  assert.equal(r.mapReplyRow({ ...mk("a", "x"), quick_reaction: "weird", profiles: null }).quick_reaction, null);
  assert.equal(r.mapReplyRow({ ...mk("a", "x"), quick_reaction: "coming", profiles: null }).quick_reaction, "coming");
});
