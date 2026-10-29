"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  REPORT_BUCKET,
  REPORT_TEXT_MAX,
  WAVE_HEIGHTS,
  imagePathFromUrl,
  textLength,
  type ActionResult,
  type CreateReportInput,
} from "@/lib/reports";

const GENERIC = "הפרסום נכשל. הטקסט נשמר, נסו שוב";

export async function createReport(input: CreateReportInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ההתחברות פגה. התחברו מחדש" };

  const raw = (input ?? {}) as Partial<Record<keyof CreateReportInput, unknown>>;

  const beachId = raw.beachId;
  if (typeof beachId !== "number" || !Number.isInteger(beachId) || beachId <= 0) {
    return { error: "בחרו חוף" };
  }
  if (raw.text != null && typeof raw.text !== "string") return { error: "ספרו מה קורה בחוף" };
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (textLength(text) > REPORT_TEXT_MAX) {
    return { error: `הטקסט ארוך מדי (עד ${REPORT_TEXT_MAX} תווים)` };
  }

  const rating = raw.waveRating ?? null;
  if (
    rating !== null &&
    (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return { error: "דירוג לא תקין" };
  }
  // Text is optional only when a wave rating is given.
  if (text.length === 0 && rating === null) return { error: "ספרו מה קורה בחוף או דרגו את הגלים" };
  const height = raw.waveHeight ?? null;
  if (
    height !== null &&
    !(typeof height === "string" && (WAVE_HEIGHTS as readonly string[]).includes(height))
  ) {
    return { error: "גובה גל לא תקין" };
  }
  let imageUrl: string | null = null;
  if (raw.imageUrl != null) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (typeof raw.imageUrl !== "string" || !base || !imagePathFromUrl(raw.imageUrl, user.id, base)) {
      return { error: "התמונה לא תקינה" };
    }
    imageUrl = raw.imageUrl;
  }

  const { data: beach } = await supabase.from("beaches").select("id").eq("id", beachId).maybeSingle();
  if (!beach) return { error: "בחרו חוף" };

  const { error } = await supabase.from("reports").insert({
    user_id: user.id, // always from the session, never from the client
    beach_id: beachId,
    text: text.length > 0 ? text : null,
    wave_rating: rating,
    wave_height_estimate: height,
    image_url: imageUrl,
  });
  if (error) return { error: GENERIC };

  revalidatePath("/");
  return { ok: true };
}

export async function deleteReport(id: string): Promise<ActionResult> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { error: "הדיווח לא נמצא" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ההתחברות פגה. התחברו מחדש" };

  const { data: row } = await supabase
    .from("reports")
    .select("image_url")
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

  revalidatePath("/");
  return { ok: true };
}
