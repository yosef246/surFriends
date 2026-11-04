"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { processImage, ImageProcessError, IMAGE_READ_ERROR } from "@/lib/image-process";
import { compressVideo, grabPoster, VideoProcessError } from "@/lib/video-process";
import { VIDEO_UNSUPPORTED_ERROR, formatDuration } from "@/lib/video-helpers";

export type Media =
  | { kind: "image"; blob: Blob }
  | { kind: "video"; blob: Blob; posterBlob: Blob; durationMs: number; ext: "mp4" | "webm" | "mov"; mime: string };

type Props = {
  /** Called with the processed media (or null when removed / failed / being replaced). */
  onChange: (media: Media | null) => void;
  /** True while a picked file is being decoded/compressed (submit must wait). */
  onProcessing?: (processing: boolean) => void;
  uploading: boolean;
  uploadError?: string | null;
  disabled?: boolean;
};

const SEGMENT =
  "btn-secondary motion-press inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-body-sm font-semibold has-[:focus-visible]:outline-2";

export function MediaField({ onChange, onProcessing, uploading, uploadError, disabled }: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState<"image" | "video" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function resetInputs() {
    if (imageRef.current) imageRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  }

  function clear() {
    setMedia(null);
    setPreview(null);
    setError(null);
    setNote(null);
    onChange(null);
    resetInputs();
  }

  async function onFile(kind: "image" | "video", file: File | undefined) {
    if (!file) return;
    const replaced = media && media.kind !== kind ? media.kind : null;
    setError(null);
    setNote(null);
    setProgress(0);
    setProcessing(kind);
    onProcessing?.(true);
    setMedia(null);
    setPreview(null);
    onChange(null);
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      let next: Media;
      let previewBlob: Blob;
      if (kind === "image") {
        const blob = await processImage(file);
        next = { kind: "image", blob };
        previewBlob = blob;
      } else {
        const c = await compressVideo(file, setProgress, ctl.signal);
        const posterBlob = await grabPoster(c.blob);
        next = { kind: "video", blob: c.blob, posterBlob, durationMs: c.durationMs, ext: c.ext, mime: c.mime };
        previewBlob = posterBlob;
      }
      if (ctl.signal.aborted) return;
      setPreview(URL.createObjectURL(previewBlob));
      setMedia(next);
      if (replaced) setNote(kind === "video" ? "הסרטון החליף את התמונה" : "התמונה החליפה את הסרטון");
      onChange(next);
    } catch (e) {
      if (ctl.signal.aborted) return;
      setError(
        e instanceof ImageProcessError || e instanceof VideoProcessError
          ? e.message
          : kind === "video"
            ? VIDEO_UNSUPPORTED_ERROR
            : IMAGE_READ_ERROR
      );
      resetInputs();
    } finally {
      if (abortRef.current === ctl) abortRef.current = null;
      if (!ctl.signal.aborted) {
        setProcessing(null);
        onProcessing?.(false);
      }
    }
  }

  const locked = disabled || processing !== null || uploading;
  const shownError = error ?? uploadError ?? null;
  const pct = Math.round(progress * 100);
  const isVideo = media?.kind === "video";

  return (
    <div className="flex flex-col gap-2">
      <span className="section-title" id="media-title">
        תמונה או סרטון <span className="text-body-sm font-normal text-muted-text">(לא חובה)</span>
      </span>

      <div role="group" aria-labelledby="media-title" className="flex gap-2">
        <label className={`${SEGMENT} ${locked ? "opacity-50" : ""}`}>
          📷 תמונה
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            disabled={locked}
            onChange={(e) => onFile("image", e.target.files?.[0])}
            className="sr-only"
          />
        </label>
        <label className={`${SEGMENT} ${locked ? "opacity-50" : ""}`}>
          🎥 סרטון
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            disabled={locked}
            onChange={(e) => onFile("video", e.target.files?.[0])}
            className="sr-only"
          />
        </label>
      </div>

      {processing === "image" ? (
        <p role="status" className="flex items-center gap-2 text-body-sm text-muted-text">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> מעבדים תמונה...
        </p>
      ) : null}

      {processing === "video" ? (
        <div className="flex flex-col gap-1.5">
          <p role="status" aria-live="polite" className="text-body-sm text-muted-text">
            מכינים את הסרטון... {pct}%
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="התקדמות הכנת הסרטון"
            className="h-2 w-full overflow-hidden rounded-pill bg-surface"
          >
            <div className="h-full rounded-pill bg-brand transition-[width] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      {preview && media ? (
        <div className="motion-pop-in relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={isVideo ? "תצוגה מקדימה של הסרטון שנבחר" : "תצוגה מקדימה של התמונה שנבחרה"}
            className="size-full object-cover"
          />
          {isVideo ? (
            <>
              <span aria-hidden className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-abyss/60 text-xl text-white">
                ▶
              </span>
              <span className="absolute end-3 bottom-3 rounded-pill bg-abyss/70 px-2.5 py-1 tabular-nums text-body-sm font-semibold text-white">
                {formatDuration(media.kind === "video" ? media.durationMs : 0)}
              </span>
            </>
          ) : null}
          <button
            type="button"
            onClick={clear}
            disabled={uploading || disabled}
            aria-label={isVideo ? "הסירו סרטון" : "הסירו תמונה"}
            className="motion-press absolute end-3 top-3 flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-raised disabled:opacity-50"
          >
            <X className="size-5" aria-hidden />
          </button>
          <span
            role="status"
            className="absolute start-3 bottom-3 flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-body-sm font-semibold text-ink shadow-raised"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> {isVideo ? "מעלים סרטון..." : "מעלים..."}
              </>
            ) : (
              <>
                <Check className="size-4 text-success" aria-hidden /> {isVideo ? "הסרטון מוכן" : "התמונה מוכנה"} ({Math.round(media.blob.size / 1024)}KB)
              </>
            )}
          </span>
          {uploading ? (
            <div aria-hidden className="absolute inset-0 flex items-center justify-center bg-abyss/50">
              <Loader2 className="size-8 animate-spin text-white motion-reduce:animate-none" />
            </div>
          ) : null}
        </div>
      ) : null}

      {note ? (
        <p role="status" className="text-body-sm text-muted-text">
          {note}
        </p>
      ) : null}
      {shownError ? (
        <p role="alert" className="text-body-sm text-danger">
          ⚠ {shownError}
        </p>
      ) : null}
    </div>
  );
}
