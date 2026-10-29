import { cache } from "react";
import { getSupabase } from "@/lib/auth";
import type { SkillLevel } from "@/lib/database.types";
import { isUuid } from "@/lib/reports";

export type ProfileView = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: SkillLevel | null;
  bio: string | null;
  created_at: string | null;
};

/** Public profile by id (RLS: profiles are readable by everyone). null for unknown / malformed ids. */
export const getProfileById = cache(async (id: string): Promise<ProfileView | null> => {
  if (!isUuid(id)) return null;
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, skill_level, bio, created_at")
    .eq("id", id)
    .maybeSingle();
  return data;
});

export type FavoriteBeach = { id: number; name: string; city: string };

/** The session user's favorites (RLS hides everyone else's). Ordered north to south like the feed. */
export async function fetchFavoriteBeaches(userId: string): Promise<FavoriteBeach[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("user_favorites")
    .select("beaches(id, name_he, city, latitude)")
    .eq("user_id", userId);
  if (error) return [];
  const rows = (data ?? []) as unknown as { beaches: { id: number; name_he: string; city: string; latitude: number } | null }[];
  return rows
    .flatMap((r) => (r.beaches ? [r.beaches] : []))
    .sort((a, b) => b.latitude - a.latitude)
    .map((b) => ({ id: b.id, name: b.name_he, city: b.city }));
}

export async function isFavoriteBeach(userId: string, beachId: number): Promise<boolean> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("user_favorites")
    .select("beach_id")
    .eq("user_id", userId)
    .eq("beach_id", beachId)
    .maybeSingle();
  return !!data;
}
