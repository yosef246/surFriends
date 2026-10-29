import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { notifyFavoriteUsers } from "@/lib/push-send";
import { isBeachId } from "@/lib/profile";

export const dynamic = "force-dynamic";

function authorized(header: string | null, secret: string): boolean {
  const a = createHash("sha256").update(header ?? "").digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

/**
 * Internal / manual trigger (same code path as createReport). Guarded by CRON_SECRET, not by a user session.
 * POST { beachId, authorId?: uuid, text?: string, waveRating?: 1-5 }. The 30-minute cooldown still applies.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  if (!authorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { beachId?: unknown; authorId?: unknown; text?: unknown; waveRating?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isBeachId(body.beachId)) return NextResponse.json({ error: "invalid beachId" }, { status: 400 });
  const authorId =
    typeof body.authorId === "string" && /^[0-9a-f-]{36}$/i.test(body.authorId) ? body.authorId : null;
  const text = typeof body.text === "string" && body.text.trim() ? body.text.slice(0, 500) : null;
  const rating =
    typeof body.waveRating === "number" && Number.isInteger(body.waveRating) && body.waveRating >= 1 && body.waveRating <= 5
      ? body.waveRating
      : null;

  const summary = await notifyFavoriteUsers({ beachId: body.beachId, authorId, text, waveRating: rating });
  return NextResponse.json(summary);
}
