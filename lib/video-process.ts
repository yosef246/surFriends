// Client-only: on-device video compression (canvas + MediaRecorder) and poster extraction.
import {
  VIDEO_MAX_BYTES,
  VIDEO_MAX_MS,
  VIDEO_UNSUPPORTED_ERROR,
  extForFile,
  pickRecorderMime,
  scaledSize,
  validateDuration,
} from "@/lib/video-helpers";

export class VideoProcessError extends Error {}

export type VideoMeta = { durationMs: number; width: number; height: number };
export type CompressedVideo = { blob: Blob; mime: string; ext: "mp4" | "webm" | "mov"; durationMs: number };

const META_TIMEOUT_MS = 8000;
const MAX_SIDE = 480;
const POSTER_MAX_BYTES = 80 * 1024;

function makeVideo(url: string): HTMLVideoElement {
  const v = document.createElement("video");
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.setAttribute("playsinline", "");
  v.preload = "metadata";
  v.src = url;
  return v;
}

function disposeVideo(v: HTMLVideoElement) {
  try {
    v.pause();
    v.removeAttribute("src");
    v.load();
  } catch {
    /* ignore */
  }
}

function waitFor(v: HTMLVideoElement, ok: string, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => done(new VideoProcessError(VIDEO_UNSUPPORTED_ERROR)), ms);
    const onOk = () => done();
    const onErr = () => done(new VideoProcessError(VIDEO_UNSUPPORTED_ERROR));
    function done(err?: Error) {
      clearTimeout(t);
      v.removeEventListener(ok, onOk);
      v.removeEventListener("error", onErr);
      if (err) reject(err);
      else resolve();
    }
    v.addEventListener(ok, onOk);
    v.addEventListener("error", onErr);
  });
}

export async function readVideoMeta(file: Blob): Promise<VideoMeta> {
  const url = URL.createObjectURL(file);
  const v = makeVideo(url);
  try {
    await waitFor(v, "loadedmetadata", META_TIMEOUT_MS);
    const d = v.duration;
    if (!Number.isFinite(d) || d <= 0 || !v.videoWidth || !v.videoHeight) throw new VideoProcessError(VIDEO_UNSUPPORTED_ERROR);
    return { durationMs: Math.round(d * 1000), width: v.videoWidth, height: v.videoHeight };
  } finally {
    disposeVideo(v);
    URL.revokeObjectURL(url);
  }
}

function toJpeg(canvas: HTMLCanvasElement, q: number): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", q));
}

/** Poster (~0.5s in) as JPEG, <= ~80KB (quality lowered until it fits). */
export async function grabPoster(src: Blob): Promise<Blob> {
  const url = URL.createObjectURL(src);
  const v = makeVideo(url);
  try {
    await waitFor(v, "loadeddata", META_TIMEOUT_MS);
    const d = v.duration;
    if (Number.isFinite(d) && d > 0.6) {
      const seeked = waitFor(v, "seeked", META_TIMEOUT_MS);
      v.currentTime = 0.5;
      await seeked;
    }
    const { width, height } = scaledSize(v.videoWidth, v.videoHeight, MAX_SIDE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new VideoProcessError(VIDEO_UNSUPPORTED_ERROR);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(v, 0, 0, width, height);
    let blob: Blob | null = null;
    for (const q of [0.75, 0.6, 0.45, 0.3]) {
      blob = await toJpeg(canvas, q);
      if (blob && blob.size <= POSTER_MAX_BYTES) break;
    }
    if (!blob) throw new VideoProcessError(VIDEO_UNSUPPORTED_ERROR);
    return blob;
  } finally {
    disposeVideo(v);
    URL.revokeObjectURL(url);
  }
}

function recordToBlob(
  file: Blob,
  meta: VideoMeta,
  pick: { mime: string; ext: "mp4" | "webm" },
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<CompressedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = makeVideo(url);
    v.preload = "auto";
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let settled = false;
    let raf = 0;
    let guard: ReturnType<typeof setTimeout> | undefined;
    const chunks: Blob[] = [];
    const targetMs = Math.min(meta.durationMs, VIDEO_MAX_MS - 500);
    const target = targetMs / 1000;

    function cleanup() {
      clearTimeout(guard);
      cancelAnimationFrame(raf);
      signal?.removeEventListener("abort", onAbort);
      try {
        if (recorder && recorder.state !== "inactive") recorder.stop();
      } catch {
        /* ignore */
      }
      stream?.getTracks().forEach((t) => t.stop());
      disposeVideo(v);
      URL.revokeObjectURL(url);
    }
    function fail(e: unknown) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(e);
    }
    function onAbort() {
      fail(new VideoProcessError("בוטל"));
    }
    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort);

    (async () => {
      try {
        await waitFor(v, "loadeddata", META_TIMEOUT_MS);
        const { width, height } = scaledSize(v.videoWidth, v.videoHeight, MAX_SIDE);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(v, 0, 0, width, height);
        stream = canvas.captureStream(30); // video only: audio is dropped on purpose
        const rec = new MediaRecorder(stream, { mimeType: pick.mime, videoBitsPerSecond: 800_000 });
        recorder = rec;
        rec.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        rec.onerror = () => fail(new Error("recorder error"));
        rec.onstop = () => {
          if (settled) return;
          const blob = new Blob(chunks, { type: pick.mime.split(";")[0] });
          if (!blob.size) return fail(new Error("empty recording"));
          settled = true;
          cleanup();
          onProgress(1);
          resolve({ blob, mime: blob.type, ext: pick.ext, durationMs: Math.max(1, Math.round(targetMs)) });
        };

        const finish = () => {
          if (!settled && rec.state !== "inactive") rec.stop();
        };
        // The video clock drives the end; the guard covers a stalled decoder.
        guard = setTimeout(() => (v.currentTime > 0 ? finish() : fail(new Error("stalled"))), target * 3000 + 15000);

        const draw = () => {
          if (settled) return;
          ctx.drawImage(v, 0, 0, width, height);
          onProgress(Math.min(0.99, v.currentTime / target));
          if (v.ended || v.currentTime >= target) return finish();
          schedule();
        };
        const schedule = () => {
          if (typeof v.requestVideoFrameCallback === "function") {
            v.requestVideoFrameCallback(() => draw());
            // rVFC does not fire once the video ended; the rAF net only handles the end check.
            raf = requestAnimationFrame(() => {
              if (v.ended || v.currentTime >= target) draw();
            });
          } else {
            raf = requestAnimationFrame(draw);
          }
        };
        v.addEventListener("ended", finish);

        rec.start(250);
        await v.play();
        schedule();
      } catch (e) {
        fail(e);
      }
    })();
  });
}

/**
 * Compress to <=480px, ~800kbps, video only, <=10s. Falls back to the original file when recording is not
 * possible and it already fits the limits.
 */
export async function compressVideo(file: File, onProgress: (p: number) => void, signal?: AbortSignal): Promise<CompressedVideo> {
  let meta: VideoMeta;
  try {
    meta = await readVideoMeta(file);
  } catch {
    throw new VideoProcessError(VIDEO_UNSUPPORTED_ERROR);
  }
  const dur = validateDuration(meta.durationMs);
  if (!dur.ok) throw new VideoProcessError(dur.error);

  const canRecord =
    typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement !== "undefined" && "captureStream" in HTMLCanvasElement.prototype;
  const pick = canRecord ? pickRecorderMime((m) => MediaRecorder.isTypeSupported(m)) : null;
  if (pick) {
    try {
      return await recordToBlob(file, meta, pick, onProgress, signal);
    } catch (e) {
      if (signal?.aborted) throw e;
      /* fall through to the original-file fallback */
    }
  }
  const ext = extForFile(file.type);
  if (ext && file.size <= VIDEO_MAX_BYTES) {
    onProgress(1);
    return { blob: file, mime: file.type.split(";")[0], ext, durationMs: meta.durationMs };
  }
  throw new VideoProcessError(VIDEO_UNSUPPORTED_ERROR);
}
