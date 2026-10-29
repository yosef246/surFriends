import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Per-request memoized helpers: layout, page and actions share one auth + profile round-trip. */
export const getSupabase = cache(async () => createClient());

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
