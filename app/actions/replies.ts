"use server";

import { after } from "next/server";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { isFreshInsert } from "@/lib/push";
import { sendReplyPush } from "@/lib/push-send";
import {
  MSG_GENERIC,
  MSG_REPLY_GONE,
  MSG_SESSION,
  isReactionKind,
  mapReplyDbError,
  otherKind,
  validateReactionInput,
  validateReplyInput,
  type ReactionKind,
  type ReplyResult,
} from "@/lib/replies";
import { isUuid, type ActionResult } from "@/lib/reports";

// No revalidatePath: the feed/thread are updated live (realtime) and optimistically.

/** Text reply. `clientId` makes a retry idempotent (PK collision on our own row = success). */
export async function replyToReport(reportId: string, text: string, clientId?: string): Promise<ReplyResult> {
  const v = validateReplyInput(reportId, text, clientId);
  if (!v.ok) return { error: v.error };
  const user = await getCurrentUser();
  if (!user) return { error: MSG_SESSION };
  const supabase = await getSupabase();
  const { id, text: t } = v.value;

  const { error } = await supabase.from("replies").insert({
    id,
    report_id: v.value.reportId,
    user_id: user.id, // from the session, never from the client
    text: t,
    quick_reaction: null,
  });
  if (error) {
    if (error.code === "23505") {
      const { data: mine } = await supabase.from("replies").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (mine) return { ok: true, id };
      return { error: MSG_GENERIC };
    }
    return { error: mapReplyDbError(error) };
  }
  // Fire-and-forget push to the report owner; only reached on a fresh insert (the 23505 retry returns above).
  after(() => sendReplyPush({ reportId: v.value.reportId, actorId: user.id, kind: "text", text: t }).then(() => undefined));
  return { ok: true, id };
}

/**
 * Toggles my "coming" / "on_the_way" on a report. Mutually exclusive: turning one on removes the other.
 * Insert first, then remove the other, so a failed insert (rate limit) leaves the old state intact.
 */
export async function toggleReaction(reportId: string, kind: ReactionKind): Promise<ActionResult> {
  const v = validateReactionInput(reportId, kind);
  if (!v.ok) return { error: v.error };
  const user = await getCurrentUser();
  if (!user) return { error: MSG_SESSION };
  const supabase = await getSupabase();

  const { data: rows, error: readErr } = await supabase
    .from("replies")
    .select("id, quick_reaction")
    .eq("report_id", v.value.reportId)
    .eq("user_id", user.id)
    .in("quick_reaction", ["coming", "on_the_way"]);
  if (readErr) return { error: mapReplyDbError(readErr) };

  const mine = (rows ?? []).filter((r) => isReactionKind(r.quick_reaction));
  const existing = mine.find((r) => r.quick_reaction === v.value.kind);

  if (existing) {
    const { error } = await supabase.from("replies").delete().eq("id", existing.id).eq("user_id", user.id);
    return error ? { error: mapReplyDbError(error) } : { ok: true };
  }

  const { error: insErr } = await supabase.from("replies").insert({
    report_id: v.value.reportId,
    user_id: user.id,
    text: null,
    quick_reaction: v.value.kind,
  });
  // 23505 = already on (double tap / other tab): treat as on.
  if (insErr && insErr.code !== "23505") return { error: mapReplyDbError(insErr) };

  // Push only when this call really inserted (not the 23505 double-tap). Covers the coming -> on_the_way switch too.
  if (isFreshInsert(insErr)) {
    after(() => sendReplyPush({ reportId: v.value.reportId, actorId: user.id, kind: v.value.kind }).then(() => undefined));
  }

  const other = mine.find((r) => r.quick_reaction === otherKind(v.value.kind));
  if (other) {
    const { error } = await supabase.from("replies").delete().eq("id", other.id).eq("user_id", user.id);
    if (error) return { error: mapReplyDbError(error) };
  }
  return { ok: true };
}

/** Deletes one of my own replies (text or reaction). */
export async function deleteReply(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: MSG_REPLY_GONE };
  const user = await getCurrentUser();
  if (!user) return { error: MSG_SESSION };
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("replies").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (error) return { error: "המחיקה נכשלה, נסו שוב" };
  if (!data || data.length === 0) return { error: MSG_REPLY_GONE };
  return { ok: true };
}
