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
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="תצוגה מקדימה של התמונה שנבחרה"
            className="size-24 rounded-lg object-cover"
          />
          <div className="flex flex-col gap-1 text-body-sm">
            <span className="flex items-center gap-1 text-success" role="status">
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden /> מעלים...
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden /> התמונה מוכנה ({Math.round(size / 1024)}KB)
                </>
              )}
            </span>
            <button
              type="button"
              onClick={clear}
              disabled={uploading || disabled}
              className="flex min-h-touch items-center gap-1 text-link disabled:opacity-50"
            >
              <X className="size-4" aria-hidden /> הסירו תמונה
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex min-h-touch w-fit cursor-pointer items-center gap-2 rounded-card border-2 border-dashed border-input bg-card px-5 text-body-sm font-medium text-ink has-[:focus-visible]:outline-2 ${
            disabled || processing ? "opacity-50" : ""
          }`}
        >
          {processing ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> מעבדים תמונה...
            </>
          ) : (
            <>
              <Camera className="size-4" aria-hidden /> הוסיפו תמונה
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
