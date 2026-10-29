/** Shared (client + server) constants and validation for reports. */
export const REPORT_TEXT_MAX = 500;
export const WAVE_HEIGHTS = ["קרסול", "ברך", "מותן", "כתף", "ראש"] as const;
export const QUICK_TEXTS = ["גלים נקיים", "עמוס בחוף", "ריק ושקט", "רוח חזקה", "גלים גדולים"] as const;
export const REPORT_BUCKET = "report-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Reports (and their replies/images) live this long. Keep in sync with the 12 hours in
 *  supabase/migrations/20261029020000_report_ttl_cleanup.sql. */
export const REPORT_TTL_HOURS = 12;
export const REPORT_TTL_MS = REPORT_TTL_HOURS * 3600 * 1000;
/** ISO cutoff: reports with created_at <= this are expired. Compute server-side only. */
export const reportCutoffIso = (nowMs: number = Date.now()) => new Date(nowMs - REPORT_TTL_MS).toISOString();
export const LAST_BEACH_KEY = "surfriends:lastBeach";

/** Single source for the 1-5 wave rating words (form + feed card). */
export const WAVE_RATING_LABELS = ["שטוח", "קטן", "סביר", "טוב", "אש"] as const;

export const textLength = (s: string) => Array.from(s).length;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

/** Blank = only whitespace or invisible format characters (zero-width etc.). */
export const isBlankText = (s: string) => s.replace(/[\s\p{Cf}]/gu, "").length === 0;

export type CreateReportInput = {
  /** Client-generated UUID so a retried request cannot create a duplicate. */
  id: string;
  beachId: number;
  text: string;
  waveRating: number | null;
  waveHeight: string | null;
  imageUrl: string | null;
};
/** `rejected` = definitive validation failure (safe to discard the uploaded photo). */
export type ActionResult = { ok: true } | { error: string; rejected?: boolean };

export type ValidReport = {
  id: string;
  beachId: number;
  text: string | null;
  waveRating: number | null;
  waveHeight: string | null;
  imageUrl: string | null;
};

/**
 * Shared client + server validation. `image` is only needed (and checked) when imageUrl is present.
 * Pure: no I/O. The server remains the authority; the client uses it to fail fast.
 */
export function validateReportInput(
  input: unknown,
  image?: { userId: string; supabaseUrl: string | undefined }
): { ok: true; value: ValidReport } | { ok: false; error: string } {
  const raw = (input ?? {}) as Partial<Record<keyof CreateReportInput, unknown>>;
  const fail = (error: string) => ({ ok: false as const, error });

  if (!isUuid(raw.id)) return fail("הדיווח לא תקין. רעננו ונסו שוב");

  const beachId = raw.beachId;
  if (typeof beachId !== "number" || !Number.isInteger(beachId) || beachId <= 0) return fail("בחרו חוף");

  if (raw.text != null && typeof raw.text !== "string") return fail("ספרו מה קורה בחוף");
  let text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (isBlankText(text)) text = "";
  text = text.replace(/\n{3,}/g, "\n\n"); // no tall empty cards
  if (textLength(text) > REPORT_TEXT_MAX) return fail(`הטקסט ארוך מדי (עד ${REPORT_TEXT_MAX} תווים)`);

  const rating = raw.waveRating ?? null;
  if (rating !== null && (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return fail("דירוג לא תקין");
  }
  // Text is optional only when a wave rating is given.
  if (text.length === 0 && rating === null) return fail("ספרו מה קורה בחוף או דרגו את הגלים");

  const height = raw.waveHeight ?? null;
  if (height !== null && !(typeof height === "string" && (WAVE_HEIGHTS as readonly string[]).includes(height))) {
    return fail("גובה גל לא תקין");
  }

  let imageUrl: string | null = null;
  if (raw.imageUrl != null) {
    if (
      typeof raw.imageUrl !== "string" ||
      !image?.supabaseUrl ||
      !imagePathFromUrl(raw.imageUrl, image.userId, image.supabaseUrl)
    ) {
      return fail("התמונה לא תקינה");
    }
    imageUrl = raw.imageUrl;
  }

  return {
    ok: true,
    value: { id: raw.id, beachId, text: text.length > 0 ? text : null, waveRating: rating, waveHeight: height, imageUrl },
  };
}

const UUID_JPG = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i;

/** Returns the storage object path ("{userId}/{uuid}.jpg") if `url` is under this project's
 *  report-images/{userId}/ public path, else null. */
export function imagePathFromUrl(url: string, userId: string, supabaseUrl: string): string | null {
  try {
    const u = new URL(url);
    const base = new URL(supabaseUrl);
    if (u.origin !== base.origin || u.search || u.hash) return null;
    const prefix = `/storage/v1/object/public/${REPORT_BUCKET}/${userId}/`;
    if (!u.pathname.startsWith(prefix)) return null;
    const file = u.pathname.slice(prefix.length);
    return UUID_JPG.test(file) ? `${userId}/${file}` : null;
  } catch {
    return null;
  }
}
