import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Per-request memoized helpers: layout, page and actions share one auth + profile round-trip. */
export const getSupabase = cache(async () => createClient());

/** Minimal user derived from verified JWT claims (no network call). */
export type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string; [key: string]: unknown };
};

/**
 * Uses getClaims(): the JWT signature is verified locally with the project's JWKS (ES256), so there
 * is no Auth-server round-trip. Safe for authz in server actions too; the trade-off is that a
 * revoked session stays valid until its access token expires (<= 1h by default). Acceptable here.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return {
    id: claims.sub,
    email: claims.email,
    user_metadata: claims.user_metadata,
  };
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser(); // local, no network
  if (!user) return null;
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
