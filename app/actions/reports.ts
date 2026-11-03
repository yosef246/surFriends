"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { getDaylightState, nightClosedMessage } from "@/lib/daylight";
import { notifyFavoriteUsers } from "@/lib/push-send";
import {
  REPORT_BUCKET,
  VIDEO_BUCKET,
  imagePathFromUrl,
  videoPathFromUrl,
  validateReportInput,
  type ActionResult,
  type CreateReportInput,
} from "@/lib/reports";

const GENERIC = "הפרסום נכשל. הטקסט נשמר, נסו שוב";
const RATE_LIMITED = "יותר מדי דיווחים, נסו שוב בעוד כמה דקות";

/** Orphan cleanup: after a definitive rejection, remove the uploaded video + poster (best effort, own folder only). */
async function discardVideo(input: CreateReportInput, userId: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return;
  const raw = (input ?? {}) as Partial<Record<keyof CreateReportInput, unknown>>;
  const paths = [
    typeof raw.videoUrl === "string" ? videoPathFromUrl(raw.videoUrl, userId, base) : null,
    typeof raw.videoPosterUrl === "string" ? videoPathFromUrl(raw.videoPosterUrl, userId, base, "poster") : null,
  ].filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    const supabase = await getSupabase();
    await supabase.storage.from(VIDEO_BUCKET).remove(paths);
  } catch {
    /* ignore */
  }
}

export async function createReport(input: CreateReportInput): Promise<ActionResult> {
  const res = await createReportInner(input);
  if ("error" in res && res.rejected) {
    const user = await getCurrentUser();
    if (user) await discardVideo(input, user.id);
  }
  return res;
}

async function createReportInner(input: CreateReportInput): Promise<ActionResult> {
  // Night lockout (sunset to sunrise, Israel): checked first, before any validation or insert.
  if (getDaylightState(new Date()).isNight) return { error: nightClosedMessage(), rejected: true };
  const user = await getCurrentUser();
  if (!user) return { error: "רעננו את הדף ונסו שוב" };
  const supabase = await getSupabase();

  const v = validateReportInput(input, {
    userId: user.id,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
  if (!v.ok) return { error: v.error, rejected: true };
  const r = v.value;

  const { data: beach } = await supabase.from("beaches").select("id").eq("id", r.beachId).maybeSingle();
  if (!beach) return { error: "בחרו חוף", rejected: true };

  const { error } = await supabase.from("reports").insert({
    id: r.id, // client-generated: a retry of the same submit hits the PK instead of duplicating
    user_id: user.id, // always from the session, never from the client
    beach_id: r.beachId,
    text: r.text,
    wave_rating: r.waveRating,
    wave_height_estimate: r.waveHeight,
    image_url: r.imageUrl,
    video_url: r.videoUrl,
    video_poster_url: r.videoPosterUrl,
    video_duration_ms: r.videoDurationMs,
  });
  if (error) {
    if (error.code === "23505") {
      // Same id again: success only if that report is ours (an earlier attempt landed).
      const { data: mine } = await supabase
        .from("reports")
        .select("id")
        .eq("id", r.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (mine) {
        revalidatePath("/");
        return { ok: true };
      }
      return { error: GENERIC };
    }
    const msg = error.message ?? "";
    if (msg.includes("night_closed")) return { error: nightClosedMessage(), rejected: true };
    if (msg.includes("rate_limit")) return { error: RATE_LIMITED };
    if (error.code === "23514") {
      if (msg.includes("reports_image_url_own_folder")) return { error: "התמונה לא תקינה", rejected: true };
      if (msg.includes("reports_one_media")) {
        return { error: "אפשר לצרף תמונה או סרטון, לא את שניהם", rejected: true };
      }
      if (msg.includes("reports_video_duration_range")) return { error: "הסרטון ארוך מ-10 שניות", rejected: true };
      if (msg.includes("reports_video_")) return { error: "הסרטון לא תקין", rejected: true };
      if (msg.includes("reports_wave_height_allowed")) return { error: "גובה גל לא תקין", rejected: true };
      if (msg.includes("reports_text_or_rating")) {
        return { error: "ספרו מה קורה בחוף או דרגו את הגלים", rejected: true };
      }
    }
    return { error: GENERIC };
  }

  // Push to the beach's favoriters after the response is sent. Only on a fresh insert (the 23505 retry path
  // above returns earlier), so a retried submit never double-notifies. notifyFavoriteUsers never throws.
  after(() =>
    notifyFavoriteUsers({ beachId: r.beachId, authorId: user.id, text: r.text, waveRating: r.waveRating }).then(
      () => undefined,
    ),
  );

  revalidatePath("/");
  return { ok: true };
}

export async function deleteReport(id: string): Promise<ActionResult> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { error: "הדיווח לא נמצא" };
  const user = await getCurrentUser();
  if (!user) return { error: "רעננו את הדף ונסו שוב" };
  const supabase = await getSupabase();

  const { data: row } = await supabase
    .from("reports")
    .select("image_url, video_url, video_poster_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { error: "הדיווח לא נמצא" };

  const { error } = await supabase.from("reports").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: "המחיקה נכשלה, נסו שוב" };

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const path = row.image_url && base ? imagePathFromUrl(row.image_url, user.id, base) : null;
  if (path) {
    try {
      await supabase.storage.from(REPORT_BUCKET).remove([path]); // best effort
    } catch {
      /* ignore */
    }
  }

  if (base) {
    const vids = [
      row.video_url ? videoPathFromUrl(row.video_url, user.id, base) : null,
      row.video_poster_url ? videoPathFromUrl(row.video_poster_url, user.id, base, "poster") : null,
    ].filter((p): p is string => !!p);
    if (vids.length > 0) {
      try {
        await supabase.storage.from(VIDEO_BUCKET).remove(vids); // best effort
      } catch {
        /* ignore */
      }
    }
  }

  revalidatePath("/");
  return { ok: true };
}
