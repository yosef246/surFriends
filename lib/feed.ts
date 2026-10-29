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

type Row = Omit<FeedReport, "author" | "beach" | "replyCount" | "comingCount" | "created_at"> & {
  created_at: string | null;
  profiles: FeedReport["author"];
  beaches: FeedReport["beach"];
  replies: { count: number }[] | null;
  coming: { count: number }[] | null;
};

/**
 * Latest reports (newest first). `cursor` is the created_at of the last report
 * already shown; only strictly older reports are returned.
 * Counts use embedded aggregates, so they respect RLS (replies are public-read).
 */
export async function fetchReports(
  supabase: SupabaseClient<Database>,
  cursor?: string | null
): Promise<FeedReport[]> {
  let query = supabase
    .from("reports")
    .select(
      `id, user_id, text, image_url, wave_rating, wave_height_estimate, created_at,
       profiles(display_name, avatar_url),
       beaches(id, name_he, city),
       replies(count),
       coming:replies(count)`
    )
    .eq("coming.quick_reaction", "coming")
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    text: r.text,
    image_url: r.image_url,
    wave_rating: r.wave_rating,
    wave_height_estimate: r.wave_height_estimate,
    created_at: r.created_at ?? new Date(0).toISOString(),
    author: r.profiles,
    beach: r.beaches,
    replyCount: r.replies?.[0]?.count ?? 0,
    comingCount: r.coming?.[0]?.count ?? 0,
  }));
}

const HERO_WINDOW_MS = 2 * 3600 * 1000;
const LIVE_WINDOW_MS = 3 * 3600 * 1000;

export type HeroSummary = {
  recentCount: number;
  latest: { created_at: string; beachName: string | null } | null;
};

/** Reports in the last 2h (count) + the latest report overall. Two cheap parallel queries. */
export async function fetchHeroSummary(supabase: SupabaseClient<Database>): Promise<HeroSummary> {
  const since = new Date(Date.now() - HERO_WINDOW_MS).toISOString();
  const [countRes, latestRes] = await Promise.all([
    supabase.from("reports").select("id", { count: "exact", head: true }).gt("created_at", since),
    supabase
      .from("reports")
      .select("created_at, beaches(name_he)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const row = latestRes.data as unknown as {
    created_at: string | null;
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
 * One query: beaches + embedded own favorites + embedded count of reports in the last 3h.
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
