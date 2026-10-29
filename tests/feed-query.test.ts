// fetchReports against a recording fake of the supabase query builder (no network).
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { fetchReports, parseFeedCursor, FEED_PAGE_SIZE } from "../lib/feed.ts";

function fakeClient(rows: unknown[] = []) {
  const calls: [string, ...unknown[]][] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q: any = {
    select: (...a: unknown[]) => (calls.push(["select", ...a]), q),
    eq: (...a: unknown[]) => (calls.push(["eq", ...a]), q),
    lt: (...a: unknown[]) => (calls.push(["lt", ...a]), q),
    or: (...a: unknown[]) => (calls.push(["or", ...a]), q),
    order: (...a: unknown[]) => (calls.push(["order", ...a]), q),
    limit: (...a: unknown[]) => (calls.push(["limit", ...a]), q),
    then: (res: (v: unknown) => void) => res({ data: rows, error: null }),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: { from: () => q } as any, calls };
}

test("first page: newest first, page size limit, counts embedded", async () => {
  const { client, calls } = fakeClient();
  await fetchReports(client);
  assert.deepEqual(calls.filter((c) => c[0] === "order"), [
    ["order", "created_at", { ascending: false }],
    ["order", "id", { ascending: false }],
  ]);
  assert.deepEqual(calls.find((c) => c[0] === "limit"), ["limit", FEED_PAGE_SIZE]);
  assert.ok(!calls.some((c) => c[0] === "lt"));
  assert.match(String(calls.find((c) => c[0] === "select")?.[1]), /coming:replies\(count\)/);
});

test("maps embedded aggregates and tolerates null relations", async () => {
  const { client } = fakeClient([
    { id: "a", user_id: "u", text: null, image_url: null, wave_rating: 4, wave_height_estimate: null,
      created_at: "2026-10-29T07:39:04.061515+00:00", profiles: null, beaches: null, replies: [{ count: 3 }], coming: [{ count: 1 }] },
    { id: "b", user_id: "u", text: "x", image_url: null, wave_rating: null, wave_height_estimate: null,
      created_at: "2026-10-29T07:00:00+00:00", profiles: null, beaches: null, replies: null, coming: null },
  ]);
  const [a, b] = await fetchReports(client);
  assert.equal(a.replyCount, 3);
  assert.equal(a.comingCount, 1);
  assert.equal(b.replyCount, 0);
  assert.equal(b.created_at, "2026-10-29T07:00:00+00:00");
});

const CUR = { created_at: "2026-10-29T07:39:04.061515+00:00", id: "11111111-1111-4111-8111-111111111111" };

test("cursor pagination is keyset on (created_at, id): strict lt OR (eq AND id lt)", async () => {
  const { client, calls } = fakeClient();
  await fetchReports(client, CUR);
  assert.ok(!calls.some((c) => c[0] === "lt"));
  assert.deepEqual(calls.find((c) => c[0] === "or"), [
    "or",
    `created_at.lt.${CUR.created_at},and(created_at.eq.${CUR.created_at},id.lt.${CUR.id})`,
  ]);
  assert.equal(calls.filter((c) => c[0] === "order").length, 2);
});

test("cursor is validated strictly (no filter injection)", async () => {
  assert.deepEqual(parseFeedCursor(CUR), CUR);
  assert.equal(parseFeedCursor({ created_at: "1", id: CUR.id }), null);
  assert.equal(parseFeedCursor({ created_at: CUR.created_at, id: "x),or(id.neq.0" }), null);
  assert.equal(parseFeedCursor({ created_at: "2026-10-29T07:39:04Z,id.gt.0", id: CUR.id }), null);
  assert.equal(parseFeedCursor("2026-10-29T07:39:04Z"), null);
  assert.equal(parseFeedCursor(null), null);
  const { client } = fakeClient();
  await assert.rejects(() => fetchReports(client, { created_at: "bad", id: CUR.id }));
});
