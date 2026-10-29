import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { BeachForecast } from "@/lib/forecast-types";
import { fetchBeachForecast } from "@/lib/openMeteo";

export type BeachForecastResult =
  | { ok: true; forecast: BeachForecast }
  | { ok: false; reason: "not_found" | "unavailable" };

/** Parses a route param into a positive int beach id, or null. */
export function parseBeachId(raw: string): number | null {
  if (!/^[1-9]\d{0,8}$/.test(raw)) return null;
  return Number(raw);
}

/**
 * Cookie-less anon client: beaches is public (RLS), and not touching cookies() keeps lookups
 * cheap and cache-friendly. Never uses the service role key.
 */
function anonClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Forecast for a beach. Shared by /api/forecast/[beachId] and server components (Day 11 beach page SSR);
 * both go through the same Next data cache (fetch revalidate 1800s, tag `forecast:<id>`). Never throws.
 */
export async function getBeachForecast(beachId: number): Promise<BeachForecastResult> {
  try {
    const { data, error } = await anonClient()
      .from("beaches")
      .select("latitude, longitude")
      .eq("id", beachId)
      .maybeSingle();
    if (error) return { ok: false, reason: "unavailable" };
    if (!data) return { ok: false, reason: "not_found" };
    const forecast = await fetchBeachForecast(beachId, data.latitude, data.longitude);
    return forecast ? { ok: true, forecast } : { ok: false, reason: "unavailable" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
