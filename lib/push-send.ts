import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COOLDOWN_MS,
  MAX_SUBSCRIPTIONS_PER_USER,
  TEST_PUSH_INTERVAL_MS,
  aggregateOthers,
  buildPushPayload,
  buildReplyPayload,
  chunk,
  cooledDownUserIds,
  inReplyCooldown,
  isGoneStatus,
  replyPushSkipReason,
  selectRecipients,
  type ReplyPushKind,
  type PushPayload,
  type PushSubscriptionInput,
} from "@/lib/push";

export type SendSummary = { recipients: number; sent: number; removed: number; failed: number; skipped?: string };

type Admin = ReturnType<typeof createAdminClient>;
type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

const TTL_SECONDS = 2 * 60 * 60;
const IN_CHUNK = 100;
const SEND_CONCURRENCY = 20;

let vapidReady = false;
function ensureVapid(): boolean {
  if (vapidReady) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !subject) return false;
  webpush.setVapidDetails(subject, pub, priv);
  vapidReady = true;
  return true;
}

/** Sends one payload to many subscriptions. Deletes dead ones (404/410). Returns the user ids with >= 1 delivery. */
async function deliver(
  admin: Admin,
  subs: Sub[],
  payload: PushPayload,
  topic: string | null,
): Promise<{ summary: Omit<SendSummary, "recipients">; deliveredUsers: Set<string> }> {
  const body = JSON.stringify(payload);
  const deliveredUsers = new Set<string>();
  const goneEndpoints: string[] = [];
  const okIds: string[] = [];
  let failed = 0;

  for (const group of chunk(subs, SEND_CONCURRENCY)) {
    const results = await Promise.allSettled(
      group.map((s) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
          TTL: TTL_SECONDS,
          urgency: "normal",
          ...(topic ? { topic } : {}),
          timeout: 10_000,
        }),
      ),
    );
    results.forEach((r, i) => {
      const s = group[i];
      if (r.status === "fulfilled") {
        deliveredUsers.add(s.user_id);
        okIds.push(s.id);
      } else if (isGoneStatus((r.reason as { statusCode?: number } | undefined)?.statusCode)) {
        goneEndpoints.push(s.endpoint);
      } else {
        failed++;
      }
    });
  }

  for (const part of chunk(goneEndpoints, IN_CHUNK)) {
    await admin.from("push_subscriptions").delete().in("endpoint", part);
  }
  for (const part of chunk(okIds, IN_CHUNK)) {
    await admin.from("push_subscriptions").update({ last_success_at: new Date().toISOString() }).in("id", part);
  }
  return { summary: { sent: okIds.length, removed: goneEndpoints.length, failed }, deliveredUsers };
}

async function loadSubs(admin: Admin, userIds: string[]): Promise<Sub[]> {
  const out: Sub[] = [];
  for (const part of chunk(userIds, IN_CHUNK)) {
    const { data } = await admin
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", part);
    out.push(...(data ?? []));
  }
  return out;
}

/**
 * Push for a new report to everyone who favorited the beach (minus the author, minus opted-out, minus cooldown).
 * Never throws: it runs inside after() and must not affect the action that triggered it.
 */
export async function notifyFavoriteUsers(input: {
  beachId: number;
  authorId: string | null;
  text: string | null;
  waveRating: number | null;
}): Promise<SendSummary> {
  const empty: SendSummary = { recipients: 0, sent: 0, removed: 0, failed: 0 };
  try {
    if (!ensureVapid()) return { ...empty, skipped: "vapid-not-configured" };
    const admin = createAdminClient();

    const [{ data: beach }, authorRes, favRes] = await Promise.all([
      admin.from("beaches").select("name_he").eq("id", input.beachId).maybeSingle(),
      input.authorId
        ? admin.from("profiles").select("display_name").eq("id", input.authorId).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from("user_favorites").select("user_id").eq("beach_id", input.beachId).limit(5000),
    ]);
    if (!beach) return { ...empty, skipped: "beach-not-found" };
    const candidates = (favRes.data ?? []).map((f) => f.user_id).filter((id) => id !== input.authorId);
    if (candidates.length === 0) return empty;

    const enabled = new Set<string>();
    const logRows: { user_id: string; sent_at: string }[] = [];
    const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
    for (const part of chunk(candidates, IN_CHUNK)) {
      const [{ data: profs }, { data: log }] = await Promise.all([
        admin.from("profiles").select("id").in("id", part).eq("push_enabled", true),
        admin
          .from("push_log")
          .select("user_id, sent_at")
          .eq("beach_id", input.beachId)
          .eq("kind", "report")
          .gte("sent_at", since)
          .in("user_id", part),
      ]);
      (profs ?? []).forEach((p) => enabled.add(p.id));
      logRows.push(...(log ?? []));
    }

    const recipients = selectRecipients({
      favoriteUserIds: candidates,
      authorId: input.authorId,
      pushEnabledUserIds: enabled,
      cooledDown: cooledDownUserIds(logRows),
    });
    if (recipients.length === 0) return empty;

    const subs = await loadSubs(admin, recipients);
    if (subs.length === 0) return { ...empty, recipients: recipients.length };

    const payload = buildPushPayload({
      beachId: input.beachId,
      beachName: beach.name_he,
      authorName: authorRes.data?.display_name ?? "",
      text: input.text,
      waveRating: input.waveRating,
    });
    const { summary, deliveredUsers } = await deliver(admin, subs, payload, `beach-${input.beachId}`);

    if (deliveredUsers.size > 0) {
      const rows = [...deliveredUsers].map((user_id) => ({ user_id, beach_id: input.beachId, kind: "report" as const }));
      await admin.from("push_log").insert(rows);
    }
    return { recipients: recipients.length, ...summary };
  } catch (e) {
    console.error("notifyFavoriteUsers failed", e instanceof Error ? e.message : e);
    return { ...empty, skipped: "error" };
  }
}

/**
 * Push to the owner of a report when someone reacts ("coming"/"on_the_way") or replies with text.
 * Cooldown 5 min per (owner, report) via push_log; the next push after the window folds in other reactors
 * ("דני ועוד 2 באים"). Never throws: it runs inside after().
 */
export async function sendReplyPush(input: {
  reportId: string;
  actorId: string;
  kind: ReplyPushKind;
  text?: string | null;
}): Promise<SendSummary> {
  const empty: SendSummary = { recipients: 0, sent: 0, removed: 0, failed: 0 };
  try {
    if (!ensureVapid()) return { ...empty, skipped: "vapid-not-configured" };
    const admin = createAdminClient();

    const { data: report } = await admin.from("reports").select("user_id, beach_id").eq("id", input.reportId).maybeSingle();
    const ownerId = report?.user_id ?? null;
    const [{ data: beach }, { data: actor }, { data: owner }] = await Promise.all([
      report ? admin.from("beaches").select("name_he").eq("id", report.beach_id).maybeSingle() : Promise.resolve({ data: null }),
      admin.from("profiles").select("display_name").eq("id", input.actorId).maybeSingle(),
      ownerId ? admin.from("profiles").select("push_enabled").eq("id", ownerId).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    const skip = replyPushSkipReason({
      reportExists: !!report,
      ownerId,
      actorId: input.actorId,
      ownerPushEnabled: owner?.push_enabled === true,
    });
    if (skip || !report || !ownerId) return { ...empty, skipped: skip ?? "report-not-found" };

    const { data: last } = await admin
      .from("push_log")
      .select("sent_at")
      .eq("user_id", ownerId)
      .eq("report_id", input.reportId)
      .eq("kind", "reply")
      .order("sent_at", { ascending: false })
      .limit(1);
    const lastSentAt = last?.[0]?.sent_at ?? null;
    if (inReplyCooldown(lastSentAt)) return { ...empty, recipients: 1, skipped: "cooldown" };

    let others = 0;
    if (input.kind !== "text") {
      const { data: rx } = await admin
        .from("replies")
        .select("user_id, created_at")
        .eq("report_id", input.reportId)
        .eq("quick_reaction", input.kind)
        .limit(200);
      others = aggregateOthers(rx ?? [], input.actorId, ownerId, lastSentAt);
    }

    const subs = await loadSubs(admin, [ownerId]);
    if (subs.length === 0) return { ...empty, recipients: 1, skipped: "no-subscriptions" };

    const payload = buildReplyPayload({
      reportId: input.reportId,
      beachId: report.beach_id,
      beachName: beach?.name_he ?? null,
      actorName: actor?.display_name ?? "",
      kind: input.kind,
      text: input.text,
      others,
    });
    // Topic max 32 chars: the uuid without dashes.
    const { summary, deliveredUsers } = await deliver(admin, subs, payload, input.reportId.replace(/-/g, ""));
    if (deliveredUsers.size > 0) {
      await admin
        .from("push_log")
        .insert({ user_id: ownerId, beach_id: report.beach_id, report_id: input.reportId, kind: "reply" });
    }
    return { recipients: 1, ...summary };
  } catch (e) {
    console.error("sendReplyPush failed", e instanceof Error ? e.message : e);
    return { ...empty, skipped: "error" };
  }
}

/** Test push to the user's own devices. Rate limited to 1/minute through push_log (kind = 'test'). */
export async function sendTestPush(userId: string): Promise<SendSummary & { rateLimited?: boolean }> {
  const empty: SendSummary = { recipients: 1, sent: 0, removed: 0, failed: 0 };
  try {
    if (!ensureVapid()) return { ...empty, skipped: "vapid-not-configured" };
    const admin = createAdminClient();
    const since = new Date(Date.now() - TEST_PUSH_INTERVAL_MS).toISOString();
    const { data: recent } = await admin
      .from("push_log")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", "test")
      .gte("sent_at", since)
      .limit(1);
    if (recent && recent.length > 0) return { ...empty, rateLimited: true };

    const subs = await loadSubs(admin, [userId]);
    if (subs.length === 0) return { ...empty, skipped: "no-subscriptions" };
    await admin.from("push_log").insert({ user_id: userId, beach_id: null, kind: "test" });
    const { summary } = await deliver(
      admin,
      subs,
      { title: "🌊 surFriends", body: "ההתראות עובדות! נעדכן אתכם על דיווחים מהחופים המועדפים", url: "/settings", tag: "test" },
      null,
    );
    return { recipients: 1, ...summary };
  } catch (e) {
    console.error("sendTestPush failed", e instanceof Error ? e.message : e);
    return { ...empty, skipped: "error" };
  }
}

/**
 * Upsert by endpoint with the admin client. If the endpoint was registered by another account (shared device)
 * it moves to `userId`. `userId` must come from the session. Returns an error message or null.
 */
export async function saveSubscription(
  userId: string,
  sub: PushSubscriptionInput,
  userAgent: string | null,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data: existing } = await admin.from("push_subscriptions").select("user_id").eq("endpoint", sub.endpoint).maybeSingle();
  if (!existing) {
    const { count } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= MAX_SUBSCRIPTIONS_PER_USER) return "יותר מדי מכשירים רשומים להתראות";
  }
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: userAgent ? userAgent.slice(0, 300) : null,
    },
    { onConflict: "endpoint" },
  );
  return error ? "לא הצלחנו להפעיל התראות. נסו שוב" : null;
}
