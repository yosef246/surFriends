import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const FEED_PAGE_SIZE = 20;

export type FeedReport = {
  id: string;
  user_id: string;
  text: string;
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
