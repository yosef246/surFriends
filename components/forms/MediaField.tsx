"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { processImage, ImageProcessError, IMAGE_READ_ERROR } from "@/lib/image-process";

export type Media = { kind: "image"; blob: Blob };

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
  "btn-secondary motion-press inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-body-sm font-semibold has-[:focus-visible]:outline-2";

export function MediaField({ onChange, onProcessing, uploading, uploadError, disabled }: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function resetInputs() {
    if (imageRef.current) imageRef.current.value = "";
  }

  function clear() {
    setMedia(null);
    setPreview(null);
    setError(null);
    onChange(null);
    resetInputs();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    onProcessing?.(true);
    setMedia(null);
    setPreview(null);
    onChange(null);
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const blob = await processImage(file);
      if (ctl.signal.aborted) return;
      const next: Media = { kind: "image", blob };
      setPreview(URL.createObjectURL(blob));
      setMedia(next);
      onChange(next);
    } catch (e) {
      if (ctl.signal.aborted) return;
      setError(e instanceof ImageProcessError ? e.message : IMAGE_READ_ERROR);
      resetInputs();
    } finally {
      if (abortRef.current === ctl) abortRef.current = null;
      if (!ctl.signal.aborted) {
        setProcessing(false);
        onProcessing?.(false);
      }
    }
  }

  const locked = disabled || processing || uploading;
  const shownError = error ?? uploadError ?? null;

  return (
    <div className="flex flex-col gap-2">
      <span className="section-title" id="media-title">
        תמונה <span className="text-body-sm font-normal text-muted-text">(לא חובה)</span>
      </span>

      <div role="group" aria-labelledby="media-title" className="flex gap-2">
        <label className={`${SEGMENT} ${locked ? "opacity-50" : ""}`}>
          📷 הוסיפו תמונה
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            disabled={locked}
            onChange={(e) => onFile(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
      </div>

      {processing ? (
        <p role="status" className="flex items-center gap-2 text-body-sm text-muted-text">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> מעבדים תמונה...
        </p>
      ) : null}

      {preview && media ? (
        <div className="motion-pop-in relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="תצוגה מקדימה של התמונה שנבחרה"
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            disabled={uploading || disabled}
            aria-label="הסירו תמונה"
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
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> מעלים...
              </>
            ) : (
              <>
                <Check className="size-4 text-success" aria-hidden /> התמונה מוכנה ({Math.round(media.blob.size / 1024)}KB)
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

      {shownError ? (
        <p role="alert" className="text-body-sm text-danger">
          ⚠ {shownError}
        </p>
      ) : null}
    </div>
  );
}
