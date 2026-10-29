import { NextResponse } from "next/server";
import { getBeachForecast, parseBeachId } from "@/lib/forecast";
import type { ForecastErrorBody } from "@/lib/forecast-types";

// Public (see middleware PUBLIC_PATHS). No extra rate limit on purpose: every request resolves to
// an upstream fetch cached for 30 min per beach (Next data cache) plus the CDN cache, and the only
// input is a validated int that must exist in the beaches table, so abuse cannot fan out upstream.
const CACHE_OK = "public, s-maxage=1800, stale-while-revalidate=3600";

function err(body: ForecastErrorBody, status: number, cache = "no-store") {
  return NextResponse.json(body, { status, headers: { "Cache-Control": cache } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ beachId: string }> }) {
  const { beachId: raw } = await params;
  const beachId = parseBeachId(raw);
  if (beachId === null) return err({ error: "invalid_beach_id" }, 400);

  const result = await getBeachForecast(beachId);
  if (result.ok) return NextResponse.json(result.forecast, { headers: { "Cache-Control": CACHE_OK } });
  if (result.reason === "not_found") return err({ error: "beach_not_found" }, 404, "public, s-maxage=300");
  return err({ error: "forecast_unavailable" }, 502);
}
