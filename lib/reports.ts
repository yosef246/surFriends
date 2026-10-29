/** Shared (client + server) constants and validation for reports. */
export const REPORT_TEXT_MAX = 500;
export const WAVE_HEIGHTS = ["קרסול", "ברך", "מותן", "כתף", "ראש"] as const;
export const QUICK_TEXTS = ["גלים נקיים", "עמוס בחוף", "ריק ושקט", "רוח חזקה", "גלים גדולים"] as const;
export const REPORT_BUCKET = "report-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const LAST_BEACH_KEY = "surfriends:lastBeach";

export const textLength = (s: string) => Array.from(s).length;

export type CreateReportInput = {
  beachId: number;
  text: string;
  waveRating: number | null;
  waveHeight: string | null;
  imageUrl: string | null;
};
export type ActionResult = { ok: true } | { error: string };

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
