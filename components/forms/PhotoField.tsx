"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { processImage, ImageProcessError, IMAGE_READ_ERROR } from "@/lib/image-process";

type Props = {
  /** Called with the processed JPEG (or null when removed / failed). */
  onChange: (blob: Blob | null) => void;
  uploading: boolean;
  uploadError?: string | null;
  disabled?: boolean;
};

export function PhotoField({ onChange, uploading, uploadError, disabled }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clear() {
    setPreview(null);
    setSize(0);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    setPreview(null);
    onChange(null);
    try {
      const blob = await processImage(file);
      setPreview(URL.createObjectURL(blob));
      setSize(blob.size);
      onChange(blob);
    } catch (e) {
      setError(e instanceof ImageProcessError ? e.message : IMAGE_READ_ERROR);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setProcessing(false);
    }
  }

  const shownError = error ?? uploadError ?? null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body-sm font-medium text-ink">תמונה (לא חובה)</span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        disabled={disabled || processing || uploading}
        onChange={(e) => onFile(e.target.files?.[0])}
        className="sr-only"
      />
      {preview ? (
        <div className="motion-pop-in relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface shadow-card">
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
            className="bubble-glass motion-press absolute end-3 top-3 flex size-11 items-center justify-center rounded-full text-ink disabled:opacity-50"
          >
            <X className="size-5" aria-hidden />
          </button>
          <span
            role="status"
            className="glass-card absolute start-3 bottom-3 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-body-sm font-medium text-ink"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> מעלים...
              </>
            ) : (
              <>
                <Check className="size-4 text-success" aria-hidden /> התמונה מוכנה ({Math.round(size / 1024)}KB)
              </>
            )}
          </span>
          {uploading ? (
            <div aria-hidden className="absolute inset-0 flex items-center justify-center bg-abyss/50">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`bubble-glass motion-press inline-flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full px-5 text-body-sm font-semibold text-ink has-[:focus-visible]:outline-2 ${
            disabled || processing ? "opacity-50" : ""
          }`}
        >
          {processing ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> מעבדים תמונה...
            </>
          ) : (
            <>
              <Camera className="size-5" aria-hidden /> הוסיפו תמונה
            </>
          )}
        </label>
      )}
      {shownError ? (
        <p role="alert" className="text-body-sm text-danger">
          ⚠ {shownError}
        </p>
      ) : null}
    </div>
  );
}
