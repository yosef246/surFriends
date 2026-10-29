import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Local copies of the tiny helpers in lib/reports.ts: this module must load under plain node --test
// (no "@/" alias at runtime).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);
const isBlankText = (s: string) => s.replace(/[\s\p{Cf}]/gu, "").length === 0;
const textLength = (s: string) => Array.from(s).length;

/** Shared (client + server) constants, validation and pure helpers for replies / reactions. */
export const REPLY_TEXT_MAX = 200;
export const REPLY_COUNTER_FROM = 160;
export const REACTION_KINDS = ["coming", "on_the_way"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];
export const REACTION_LABEL: Record<ReactionKind, { emoji: string; label: string }> = {
  coming: { emoji: "🤙", label: "אני בא" },
  on_the_way: { emoji: "🚗", label: "בדרך" },
};
export const isReactionKind = (v: unknown): v is ReactionKind =>
  typeof v === "string" && (REACTION_KINDS as readonly string[]).includes(v);

export const MSG_SESSION = "ההתחברות פגה. התחברו מחדש";
export const MSG_RATE_LIMIT = "יותר מדי תגובות, נסו שוב עוד מעט";
export const MSG_REPORT_GONE = "הדיווח כבר לא קיים";
export const MSG_REPLY_GONE = "התגובה לא נמצאה";
export const MSG_GENERIC = "לא הצלחנו לשלוח. נסו שוב";

export type ReplyResult = { ok: true; id: string } | { error: string };

export type ValidReply = { reportId: string; text: string; id: string };

/** Pure: trims, collapses tall blank runs, 1-200 code points. `id` is the client-generated reply id. */
export function validateReplyInput(
  reportId: unknown,
  text: unknown,
  id?: unknown
): { ok: true; value: ValidReply } | { ok: false; error: string } {
  const fail = (error: string) => ({ ok: false as const, error });
  if (!isUuid(reportId)) return fail(MSG_REPORT_GONE);
  if (id != null && !isUuid(id)) return fail(MSG_GENERIC);
  if (typeof text !== "string") return fail("כתבו תגובה");
  let t = text.trim();
  if (isBlankText(t)) return fail("כתבו תגובה");
  t = t.replace(/\n{3,}/g, "\n\n");
  if (textLength(t) > REPLY_TEXT_MAX) return fail(`התגובה ארוכה מדי (עד ${REPLY_TEXT_MAX} תווים)`);
  return { ok: true, value: { reportId, text: t, id: (id as string | undefined) ?? crypto.randomUUID() } };
}

export function validateReactionInput(
  reportId: unknown,
  kind: unknown
): { ok: true; value: { reportId: string; kind: ReactionKind } } | { ok: false; error: string } {
  if (!isUuid(reportId)) return { ok: false, error: MSG_REPORT_GONE };
  if (!isReactionKind(kind)) return { ok: false, error: MSG_GENERIC };
  return { ok: true, value: { reportId, kind } };
}

export const otherKind = (k: ReactionKind): ReactionKind => (k === "coming" ? "on_the_way" : "coming");

/** Maps a Postgres / PostgREST error from a replies write to a Hebrew message. */
export function mapReplyDbError(err: { code?: string | null; message?: string | null } | null | undefined): string {
  const msg = err?.message ?? "";
  if (msg.includes("rate_limit")) return MSG_RATE_LIMIT;
  switch (err?.code) {
    case "23503":
      return MSG_REPORT_GONE;
    case "23514":
      return "כתבו תגובה או בחרו תגובה מהירה";
    case "42501":
      return MSG_SESSION;
    default:
      return MSG_GENERIC;
  }
}

// ---------- thread data (client reads; RLS: replies are public-read) ----------

export type ReplyItem = {
  id: string;
  user_id: string;
  text: string | null;
  quick_reaction: ReactionKind | null;
  created_at: string;
  author: { display_name: string; avatar_url: string | null } | null;
  /** Optimistic, not yet confirmed by the server. */
  pending?: boolean;
};

export const REPLY_SELECT = "id, user_id, text, quick_reaction, created_at, profiles(display_name, avatar_url)";
export const THREAD_LIMIT = 200;

type ReplyRowRaw = Omit<ReplyItem, "author" | "pending"> & { profiles: ReplyItem["author"] };

export function mapReplyRow(r: ReplyRowRaw): ReplyItem {
  return {
    id: r.id,
    user_id: r.user_id,
    text: r.text,
    quick_reaction: isReactionKind(r.quick_reaction) ? r.quick_reaction : null,
    created_at: r.created_at,
    author: r.profiles ?? null,
  };
}

/** Oldest -> newest. */
export async function fetchReplies(supabase: SupabaseClient<Database>, reportId: string): Promise<ReplyItem[]> {
  const { data, error } = await supabase
    .from("replies")
    .select(REPLY_SELECT)
    .eq("report_id", reportId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(THREAD_LIMIT);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ReplyRowRaw[]).map(mapReplyRow);
}

export async function fetchReplyById(supabase: SupabaseClient<Database>, id: string): Promise<ReplyItem | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase.from("replies").select(REPLY_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapReplyRow(data as unknown as ReplyRowRaw);
}

const byOldest = (a: ReplyItem, b: ReplyItem) =>
  a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/** Insert or replace by id (dedupes the optimistic copy vs the realtime echo); keeps oldest -> newest. */
export function upsertReply(list: ReplyItem[], item: ReplyItem): ReplyItem[] {
  const i = list.findIndex((r) => r.id === item.id);
  if (i === -1) return [...list, item].sort(byOldest);
  const next = list.slice();
  next[i] = { ...item, author: item.author ?? list[i].author };
  return next.sort(byOldest);
}

export function removeReplyById(list: ReplyItem[], id: string): ReplyItem[] {
  return list.some((r) => r.id === id) ? list.filter((r) => r.id !== id) : list;
}

/** Merges a fetched page into the current list, keeping unconfirmed optimistic items. */
export function mergeReplies(current: ReplyItem[], fetched: ReplyItem[]): ReplyItem[] {
  const ids = new Set(fetched.map((r) => r.id));
  return [...fetched, ...current.filter((r) => r.pending && !ids.has(r.id))].sort(byOldest);
}
