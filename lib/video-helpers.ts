// Pure helpers for on-device video processing (no DOM): safe to unit test in node.

export const VIDEO_MAX_MS = 10500;
export const VIDEO_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_TOO_LONG_ERROR = "הסרטון ארוך מ-10 שניות. צלמו קצר יותר 🙂";
export const VIDEO_UNSUPPORTED_ERROR = "לא הצלחנו לעבד את הסרטון במכשיר הזה. נסו תמונה במקום";

export type RecorderPick = { mime: string; ext: "mp4" | "webm" };

const CANDIDATES: RecorderPick[] = [
  { mime: "video/mp4;codecs=avc1", ext: "mp4" },
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm;codecs=vp9", ext: "webm" },
  { mime: "video/webm;codecs=vp8", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
];

/** First MediaRecorder mime the browser supports, in preference order (mp4/H.264 plays everywhere). */
export function pickRecorderMime(isTypeSupported: (mime: string) => boolean): RecorderPick | null {
  for (const c of CANDIDATES) {
    try {
      if (isTypeSupported(c.mime)) return c;
    } catch {
      /* treat as unsupported */
    }
  }
  return null;
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** Fit the longest side to `max` (never upscale), keep aspect, even dimensions (required by H.264). */
export function scaledSize(w: number, h: number, max = 480): { width: number; height: number } {
  if (!(w > 0) || !(h > 0)) return { width: even(max), height: even(max) };
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: even(w * scale), height: even(h * scale) };
}

export function validateDuration(ms: number): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(ms) || ms <= 0) return { ok: false, error: VIDEO_UNSUPPORTED_ERROR };
  if (ms > VIDEO_MAX_MS) return { ok: false, error: VIDEO_TOO_LONG_ERROR };
  return { ok: true };
}

/** Storage extension allowed by the bucket, from a mime type; null if not allowed. */
export function extForFile(type: string): "mp4" | "webm" | "mov" | null {
  const t = type.split(";")[0].trim().toLowerCase();
  if (t === "video/mp4") return "mp4";
  if (t === "video/webm") return "webm";
  if (t === "video/quicktime") return "mov";
  return null;
}

/** "0:08" */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
