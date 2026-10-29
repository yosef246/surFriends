// fetchReports against a recording fake of the supabase query builder (no network).
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { fetchReports, FEED_PAGE_SIZE } from "../lib/feed.ts";

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
  assert.deepEqual(calls.find((c) => c[0] === "order"), ["order", "created_at", { ascending: false }]);
  assert.deepEqual(calls.find((c) => c[0] === "limit"), ["limit", FEED_PAGE_SIZE]);
  assert.ok(!calls.some((c) => c[0] === "lt"));
  assert.match(String(calls.find((c) => c[0] === "select")?.[1]), /coming:replies\(count\)/);
});

test("maps embedded aggregates and tolerates null relations", async () => {
  const { client } = fakeClient([
    { id: "a", user_id: "u", text: null, image_url: null, wave_rating: 4, wave_height_estimate: null,
      created_at: "2026-10-29T07:39:04.061515+00:00", profiles: null, beaches: null, replies: [{ count: 3 }], coming: [{ count: 1 }] },
    { id: "b", user_id: "u", text: "x", image_url: null, wave_rating: null, wave_height_estimate: null,
      created_at: null, profiles: null, beaches: null, replies: null, coming: null },
  ]);
  const [a, b] = await fetchReports(client);
  assert.equal(a.replyCount, 3);
  assert.equal(a.comingCount, 1);
  assert.equal(b.replyCount, 0);
  assert.equal(b.created_at, new Date(0).toISOString()); // null created_at silently becomes 1970 (see report)
});

test("cursor page uses a strict created_at < cursor filter", async () => {
  const { client, calls } = fakeClient();
  await fetchReports(client, "2026-10-29T07:39:04.061515+00:00");
  assert.deepEqual(calls.find((c) => c[0] === "lt"), ["lt", "created_at", "2026-10-29T07:39:04.061515+00:00"]);
});

// KNOWN BUG (BUG-002 in docs/TEST_REPORT.md): rows sharing created_at with the last row of a page are skipped.
// Expected fix: keyset (created_at, id): .or("created_at.lt.X,and(created_at.eq.X,id.lt.ID)") + secondary order by id.
test("cursor pagination has an id tiebreak", { todo: "fix BUG-002" }, async () => {
  const { client, calls } = fakeClient();
  await fetchReports(client, "2026-10-29T07:39:04.061515+00:00");
  assert.ok(calls.some((c) => c[0] === "or"), "expected an .or() keyset filter");
  assert.ok(calls.filter((c) => c[0] === "order").length >= 2, "expected a secondary order by id");
});
