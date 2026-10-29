// Run: node --test tests/*.test.ts
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import * as mod from "../lib/push.ts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = mod as any;

const P256DH = "B" + "A".repeat(86); // 87 chars -> 65 bytes
const AUTH = "A".repeat(22); // 22 chars -> 16 bytes
const goodSub = { endpoint: "https://fcm.googleapis.com/fcm/send/abc:def", keys: { p256dh: P256DH, auth: AUTH } };

test("validateSubscription: accepts a real-shaped subscription", () => {
  const r = p.validateSubscription(goodSub);
  assert.ok(r.ok);
  assert.equal(r.value.endpoint, goodSub.endpoint);
  assert.ok(p.validateSubscription({ ...goodSub, endpoint: "https://web.push.apple.com/QWER" }).ok);
  assert.ok(p.validateSubscription({ ...goodSub, endpoint: "https://updates.push.services.mozilla.com/wpush/v2/x" }).ok);
  assert.ok(p.validateSubscription({ ...goodSub, endpoint: "https://wns2-par02p.notify.windows.com/w/?token=x" }).ok);
});

test("validateSubscription: rejects non-https, foreign hosts (SSRF), credentials, ports, junk", () => {
  const bad = [
    "http://fcm.googleapis.com/x",
    "https://evil.example.com/x",
    "https://fcm.googleapis.com.evil.com/x",
    "https://169.254.169.254/latest/meta-data",
    "https://localhost/x",
    "https://user:pw@fcm.googleapis.com/x",
    "https://fcm.googleapis.com:8443/x",
    "javascript:alert(1)",
    "not a url",
    "",
    "https://fcm.googleapis.com/" + "a".repeat(2100),
    null,
    42,
  ];
  for (const endpoint of bad) assert.equal(p.validateSubscription({ ...goodSub, endpoint }).ok, false, String(endpoint).slice(0, 40));
});

test("validateSubscription: keys must be base64url with the right byte length", () => {
  for (const keys of [
    undefined,
    {},
    { p256dh: P256DH },
    { auth: AUTH },
    { p256dh: "short", auth: AUTH },
    { p256dh: P256DH, auth: "short" },
    { p256dh: P256DH + "!", auth: AUTH },
    { p256dh: P256DH, auth: "A".repeat(43) },
    { p256dh: 1, auth: 2 },
  ]) {
    assert.equal(p.validateSubscription({ endpoint: goodSub.endpoint, keys }).ok, false, JSON.stringify(keys));
  }
  assert.equal(p.validateSubscription(null).ok, false);
  assert.equal(p.validateSubscription("x").ok, false);
});

test("urlBase64ToUint8Array: decodes url-safe base64 with and without padding", () => {
  assert.deepEqual([...p.urlBase64ToUint8Array("AQID")], [1, 2, 3]);
  assert.deepEqual([...p.urlBase64ToUint8Array("AQI")], [1, 2]);
  assert.deepEqual([...p.urlBase64ToUint8Array("__-_")], [255, 255, 191]); // '_' -> '/', '-' -> '+'
  const key = Buffer.alloc(65, 7).toString("base64url");
  const out = p.urlBase64ToUint8Array(key);
  assert.equal(out.length, 65);
  assert.ok(out instanceof Uint8Array);
});

test("buildPushPayload: Hebrew title/body/url/tag", () => {
  const out = p.buildPushPayload({ beachId: 7, beachName: "גורדון", authorName: "דנה כהן", text: "גלים יפים\nוחלק", waveRating: 4 });
  assert.equal(out.title, "🌊 גורדון");
  assert.equal(out.body, "דנה: גלים יפים וחלק");
  assert.equal(out.url, "/beach/7");
  assert.equal(out.tag, "beach-7");
});

test("buildPushPayload: rating label when no text; fallbacks", () => {
  const base = { beachId: 1, beachName: "דור", authorName: "יוסי", text: null };
  assert.equal(p.buildPushPayload({ ...base, waveRating: 5 }).body, "יוסי: גלים: אש");
  assert.equal(p.buildPushPayload({ ...base, waveRating: 1 }).body, "יוסי: גלים: שטוח");
  assert.equal(p.buildPushPayload({ ...base, waveRating: null }).body, "יוסי: דיווח חדש");
  assert.equal(p.buildPushPayload({ ...base, waveRating: 9 }).body, "יוסי: דיווח חדש");
  assert.equal(p.buildPushPayload({ ...base, authorName: "  ", waveRating: 3 }).body, "מישהו: גלים: סביר");
});

test("snippet: truncates at 80 code points with an ellipsis, emoji stay whole", () => {
  assert.equal(p.snippet("a".repeat(80)), "a".repeat(80));
  const cut = p.snippet("א".repeat(120));
  assert.equal(Array.from(cut).length, 80);
  assert.ok(cut.endsWith("…"));
  const emoji = p.snippet("🌊".repeat(100));
  assert.equal(Array.from(emoji).length, 80);
  assert.ok(!emoji.includes("�"));
  assert.equal(p.snippet("  a   b \n c "), "a b c");
});

test("cooledDownUserIds: inside the 30 minute window only", () => {
  const now = Date.parse("2026-10-29T12:00:00Z");
  const iso = (minAgo: number) => new Date(now - minAgo * 60_000).toISOString();
  const set = p.cooledDownUserIds(
    [
      { user_id: "a", sent_at: iso(5) },
      { user_id: "b", sent_at: iso(29.9) },
      { user_id: "c", sent_at: iso(30) },
      { user_id: "d", sent_at: iso(120) },
      { user_id: "e", sent_at: "garbage" },
    ],
    now,
  );
  assert.deepEqual([...set].sort(), ["a", "b"]);
  assert.equal(p.COOLDOWN_MS, 30 * 60 * 1000);
});

test("selectRecipients: excludes author, opted-out, cooldown; dedupes", () => {
  const out = p.selectRecipients({
    favoriteUserIds: ["author", "a", "b", "c", "a", "d"],
    authorId: "author",
    pushEnabledUserIds: new Set(["author", "a", "c", "d"]),
    cooledDown: new Set(["c"]),
  });
  assert.deepEqual(out, ["a", "d"]);
  assert.deepEqual(
    p.selectRecipients({ favoriteUserIds: [], authorId: null, pushEnabledUserIds: new Set(), cooledDown: new Set() }),
    [],
  );
  // null author (manual /api/push/send) keeps everyone eligible
  assert.deepEqual(
    p.selectRecipients({ favoriteUserIds: ["x"], authorId: null, pushEnabledUserIds: new Set(["x"]), cooledDown: new Set() }),
    ["x"],
  );
});

test("chunk / isGoneStatus", () => {
  assert.deepEqual(p.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(p.chunk([], 3), []);
  assert.ok(p.isGoneStatus(404) && p.isGoneStatus(410));
  assert.ok(!p.isGoneStatus(500) && !p.isGoneStatus(429) && !p.isGoneStatus(undefined));
});

test("buildReplyPayload: coming / on_the_way / text, aggregation, null beach, emoji, truncation", () => {
  const base = { reportId: "11111111-2222-3333-4444-555555555555", beachId: 9, beachName: "הילטון", actorName: "דני כהן" };
  const c = p.buildReplyPayload({ ...base, kind: "coming" });
  assert.equal(c.title, "🤙 דני בא/ה להילטון");
  assert.equal(c.body, "על הדיווח שלך");
  assert.equal(c.url, "/beach/9");
  assert.equal(c.tag, `reply-${base.reportId}`);
  assert.equal(p.buildReplyPayload({ ...base, kind: "coming", others: 2 }).title, "🤙 דני ועוד 2 באים להילטון");
  assert.equal(p.buildReplyPayload({ ...base, kind: "on_the_way" }).title, "🚗 דני בדרך להילטון");
  assert.equal(p.buildReplyPayload({ ...base, kind: "on_the_way", others: 1 }).title, "🚗 דני ועוד 1 בדרך להילטון");
  assert.equal(p.buildReplyPayload({ ...base, kind: "coming", beachName: null }).title, "🤙 דני בא/ה לחוף");
  assert.equal(p.buildReplyPayload({ ...base, kind: "coming", beachName: "Hilton" }).title, "🤙 דני בא/ה ל-Hilton");
  assert.equal(p.buildReplyPayload({ ...base, kind: "coming", actorName: "🏄 דני" }).title, "🤙 🏄 בא/ה להילטון");
  assert.equal(p.buildReplyPayload({ ...base, kind: "coming", actorName: "  " }).title, "🤙 מישהו בא/ה להילטון");
  const t = p.buildReplyPayload({ ...base, kind: "text", text: "😀".repeat(100) });
  assert.equal(t.title, "💬 דני הגיב/ה על הדיווח שלך");
  assert.equal(Array.from(t.body).length, 80);
  assert.ok(t.body.endsWith("…"));
  assert.equal(p.buildReplyPayload({ ...base, kind: "text", text: "קצר\nומסודר" }).body, "קצר ומסודר");
});

test("replyPushSkipReason: owner===actor, disabled, missing report", () => {
  const ok = { reportExists: true, ownerId: "o", actorId: "a", ownerPushEnabled: true };
  assert.equal(p.replyPushSkipReason(ok), null);
  assert.equal(p.replyPushSkipReason({ ...ok, actorId: "o" }), "own-report");
  assert.equal(p.replyPushSkipReason({ ...ok, ownerPushEnabled: false }), "push-disabled");
  assert.equal(p.replyPushSkipReason({ ...ok, reportExists: false }), "report-not-found");
  assert.equal(p.replyPushSkipReason({ ...ok, ownerId: null }), "report-not-found");
});

test("inReplyCooldown: 5 minute window", () => {
  const now = Date.parse("2026-10-29T12:00:00Z");
  assert.equal(p.inReplyCooldown(null, now), false);
  assert.equal(p.inReplyCooldown("2026-10-29T11:56:00Z", now), true);
  assert.equal(p.inReplyCooldown("2026-10-29T11:54:59Z", now), false);
  assert.equal(p.inReplyCooldown("garbage", now), false);
});

test("aggregateOthers: distinct, excludes actor/owner, only after last push", () => {
  const rows = [
    { user_id: "a", created_at: "2026-10-29T11:00:00Z" },
    { user_id: "b", created_at: "2026-10-29T11:10:00Z" },
    { user_id: "b", created_at: "2026-10-29T11:11:00Z" },
    { user_id: "c", created_at: "2026-10-29T11:12:00Z" },
    { user_id: "o", created_at: "2026-10-29T11:12:00Z" },
    { user_id: "old", created_at: "2026-10-29T09:00:00Z" },
  ];
  assert.equal(p.aggregateOthers(rows, "a", "o", "2026-10-29T10:00:00Z"), 2);
  assert.equal(p.aggregateOthers(rows, "a", "o", null), 3);
  assert.equal(p.aggregateOthers([], "a", "o", null), 0);
});

test("isFreshInsert: only when no error (23505 is not fresh)", () => {
  assert.equal(p.isFreshInsert(null), true);
  assert.equal(p.isFreshInsert(undefined), true);
  assert.equal(p.isFreshInsert({ code: "23505" }), false);
});
