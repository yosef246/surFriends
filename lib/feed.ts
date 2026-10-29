import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const FEED_PAGE_SIZE = 20;

export type FeedReport = {
  id: string;
  user_id: string;
  text: string | null;
  image_url: string | null;
  wave_rating: number | null;
  wave_height_estimate: string | null;
  created_at: string;
  author: { display_name: string; avatar_url: string | null } | null;
  beach: { id: number; name_he: string; city: string } | null;
  replyCount: number;
  comingCount: number;
};

/** Keyset cursor: the (created_at, id) of the last report already shown. */
export type FeedCursor = { created_at: string; id: string };

const ISO_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Strict validation: the values are interpolated into a PostgREST filter string. */
export function parseFeedCursor(c: unknown): FeedCursor | null {
  if (!c || typeof c !== "object") return null;
  const { created_at, id } = c as Record<string, unknown>;
  if (typeof created_at !== "string" || typeof id !== "string") return null;
  if (!ISO_TS.test(created_at) || !UUID.test(id)) return null;
  return { created_at, id };
}

type Row = Omit<FeedReport, "author" | "beach" | "replyCount" | "comingCount"> & {
  profiles: FeedReport["author"];
  beaches: FeedReport["beach"];
  replies: { count: number }[] | null;
  coming: { count: number }[] | null;
};

/** The one select shape for feed reports (server list, load-more, realtime single fetch). */
export const FEED_SELECT = `id, user_id, text, image_url, wave_rating, wave_height_estimate, created_at,
       profiles(display_name, avatar_url),
       beaches(id, name_he, city),
       replies(count),
       coming:replies(count)`;

/** Maps a raw PostgREST row (FEED_SELECT) to FeedReport. */
export function mapFeedRow(r: Row): FeedReport {
  return {
    id: r.id,
    user_id: r.user_id,
    text: r.text,
    image_url: r.image_url,
    wave_rating: r.wave_rating,
    wave_height_estimate: r.wave_height_estimate,
    created_at: r.created_at,
    author: r.profiles,
    beach: r.beaches,
    replyCount: r.replies?.[0]?.count ?? 0,
    comingCount: r.coming?.[0]?.count ?? 0,
  };
}

/**
 * Latest reports (newest first, ties broken by id). `cursor` is the (created_at, id) of the last
 * report already shown; only reports strictly after it in that order are returned.
 * Counts use embedded aggregates, so they respect RLS (replies are public-read).
 */
export async function fetchReports(
  supabase: SupabaseClient<Database>,
  /** TTL cutoff from reportCutoffIso(): only reports newer than this are returned. */
  cutoff: string,
  cursor?: FeedCursor | null
): Promise<FeedReport[]> {
  let query = supabase
    .from("reports")
    .select(FEED_SELECT)
    .eq("coming.quick_reaction", "coming")
    .gt("created_at", cutoff)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (cursor) {
    const c = parseFeedCursor(cursor);
    if (!c) throw new Error("invalid cursor");
    query = query.or(`created_at.lt.${c.created_at},and(created_at.eq.${c.created_at},id.lt.${c.id})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Row[]).map(mapFeedRow);
}

/** One report by id (realtime INSERT payloads lack the joins). null if gone/expired/invalid. */
export async function fetchReportById(
  supabase: SupabaseClient<Database>,
  id: string,
  cutoff: string
): Promise<FeedReport | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase
    .from("reports")
    .select(FEED_SELECT)
    .eq("coming.quick_reaction", "coming")
    .eq("id", id)
    .gt("created_at", cutoff)
    .maybeSingle();
  if (error || !data) return null;
  return mapFeedRow(data as unknown as Row);
}

// Both windows are shorter than the 12h TTL, so expired reports can never count as "recent".
// One window for "recent" everywhere (hero count says "2 hours"; the live dots use the same).
const HERO_WINDOW_MS = 2 * 3600 * 1000;
const LIVE_WINDOW_MS = HERO_WINDOW_MS;

export type HeroSummary = {
  recentCount: number;
  latest: { created_at: string; beachName: string | null } | null;
};

/** Reports in the last 2h (count) + the latest report overall. Two cheap parallel queries. */
export async function fetchHeroSummary(
  supabase: SupabaseClient<Database>,
  cutoff: string
): Promise<HeroSummary> {
  const since = new Date(Date.now() - HERO_WINDOW_MS).toISOString();
  const [countRes, latestRes] = await Promise.all([
    supabase.from("reports").select("id", { count: "exact", head: true }).gt("created_at", since),
    supabase
      .from("reports")
      .select("created_at, beaches(name_he)")
      .gt("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const row = latestRes.data as unknown as {
    created_at: string;
    beaches: { name_he: string } | null;
  } | null;
  return {
    recentCount: countRes.count ?? 0,
    latest: row?.created_at ? { created_at: row.created_at, beachName: row.beaches?.name_he ?? null } : null,
  };
}

export type BeachCircleItem = { id: number; name: string; live: boolean };

type BeachRow = {
  id: number;
  name_he: string;
  latitude: number;
  user_favorites: { user_id: string }[] | null;
  reports: { count: number }[] | null;
};

/**
 * One query: beaches + embedded own favorites + embedded count of reports in the last 2h.
 * Favorites first (if any), otherwise all beaches north to south.
 */
export async function fetchBeachCircles(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BeachCircleItem[]> {
  const since = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from("beaches")
    .select("id, name_he, latitude, user_favorites(user_id), reports(count)")
    .eq("user_favorites.user_id", userId)
    .gt("reports.created_at", since)
    .order("latitude", { ascending: false });
  if (error) return [];

  const rows = (data ?? []) as unknown as BeachRow[];
  const favs = rows.filter((r) => (r.user_favorites?.length ?? 0) > 0);
  return (favs.length > 0 ? favs : rows).map((r) => ({
    id: r.id,
    name: r.name_he,
    live: (r.reports?.[0]?.count ?? 0) > 0,
  }));
}
