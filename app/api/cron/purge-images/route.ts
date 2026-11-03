import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REPORT_BUCKET, VIDEO_BUCKET } from "@/lib/reports";

export const dynamic = "force-dynamic";

const BATCH = 100;
const MAX_BATCHES = 10;

function authorized(header: string | null, secret: string): boolean {
  // Hash both sides so the buffers have equal length for timingSafeEqual.
  const a = createHash("sha256").update(header ?? "").digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  if (!authorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Backup for pg_cron: drop expired report rows (replies cascade).
    const purge = await admin.rpc("purge_expired_reports");
    const purgedReports = purge.error ? null : purge.data;

    async function purgeBucket(rpc: "expired_report_image_paths" | "expired_report_video_paths", bucket: string) {
      let removed = 0;
      let batches = 0;
      while (batches < MAX_BATCHES) {
        const { data, error } = await admin.rpc(rpc, { limit_count: BATCH });
        if (error) throw new Error(error.message);
        const names = (data ?? []).map((r) => r.name);
        if (names.length === 0) break;
        const { data: gone, error: rmErr } = await admin.storage.from(bucket).remove(names);
        if (rmErr) throw new Error(rmErr.message);
        batches++;
        removed += gone?.length ?? 0;
        if (!gone || gone.length === 0) break; // nothing removed: don't spin on the same rows
      }
      return { removed, batches };
    }

    const { removed, batches } = await purgeBucket("expired_report_image_paths", REPORT_BUCKET);
    // Videos: best effort, so a missing report-videos migration never breaks the image purge.
    let videos: { removed: number; batches: number } | null = null;
    try {
      videos = await purgeBucket("expired_report_video_paths", VIDEO_BUCKET);
    } catch (e) {
      console.error("purge-videos failed", e instanceof Error ? e.message : e);
    }
    // Housekeeping for the push cooldown log (best effort; needs the Day 12 migration).
    await admin.rpc("purge_old_push_log");
    return NextResponse.json({ removed, batches, purgedReports, videos });
  } catch (e) {
    console.error("purge-images failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "purge failed" }, { status: 500 });
  }
}
