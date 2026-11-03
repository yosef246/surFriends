"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INPUT_CLASS } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createReport } from "@/app/actions/reports";
import {
  LAST_BEACH_KEY,
  QUICK_TEXTS,
  REPORT_BUCKET,
  REPORT_TEXT_MAX,
  WAVE_HEIGHTS,
  isBlankText,
  textLength,
  validateReportInput,
} from "@/lib/reports";
import { BeachPicker, type BeachOption } from "./BeachPicker";
import { PhotoField } from "./PhotoField";
import { WaveRatingInput } from "./WaveRatingInput";

type Props = { beaches: BeachOption[]; defaultBeachId: number | null };

export function NewReportForm({ beaches, defaultBeachId }: Props) {
  const router = useRouter();
  const [beachId, setBeachId] = useState<number | null>(defaultBeachId);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ beach: false, text: false });
  const [processing, setProcessing] = useState(false);
  const submitting = useRef(false);
  // Stable across retries: a resubmit after a lost response hits the PK instead of duplicating.
  const reportId = useRef<string | null>(null);
  // Photo already uploaded for the current blob, reused on retry (no orphan, same URL).
  const uploaded = useRef<{ blob: Blob; path: string; url: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Single-line pill that grows (max 3 lines) only when the text wraps.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
    el.style.overflowY = el.scrollHeight > 96 ? "auto" : "hidden";
  }, [text]);

  // Preselect the last used beach (only when no ?beach= default was given).
  useEffect(() => {
    if (defaultBeachId !== null) return;
    try {
      const saved = Number(localStorage.getItem(LAST_BEACH_KEY));
      if (Number.isInteger(saved) && beaches.some((b) => b.id === saved)) setBeachId(saved);
    } catch {
      /* storage unavailable */
    }
  }, [defaultBeachId, beaches]);

  const len = textLength(text);
  const trimmedEmpty = isBlankText(text);
  // Text is optional once a wave rating is picked.
  const missingText = trimmedEmpty && rating === null;
  const tooLong = len > REPORT_TEXT_MAX;
  const beachError = touched.beach && beachId === null ? "בחרו חוף" : null;
  const textError = tooLong
    ? `הטקסט ארוך מדי (${len}/${REPORT_TEXT_MAX})`
    : touched.text && missingText
      ? "ספרו מה קורה בחוף או דרגו את הגלים"
      : null;
  const busy = stage !== "idle" || done;
  const blocked = busy || processing;

  function addQuick(t: string) {
    setText((cur) => (cur.trim() ? `${cur.trimEnd()} ${t}` : t));
    setTouched((s) => ({ ...s, text: true }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current || processing) return;
    setBanner(null);
    setPhotoError(null);
    setTouched({ beach: true, text: true });
    if (beachId === null || missingText || tooLong) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBanner("אין קליטה. נסו שוב כשיהיה חיבור");
      return;
    }

    reportId.current ??= crypto.randomUUID();
    const id = reportId.current;
    const pre = validateReportInput({ id, beachId, text, waveRating: rating, waveHeight: height, imageUrl: null });
    if (!pre.ok) {
      setBanner(pre.error);
      return;
    }

    submitting.current = true;
    const supabase = createClient();
    try {
      let imageUrl: string | null = null;
      if (photo && uploaded.current?.blob === photo) {
        imageUrl = uploaded.current.url;
      } else if (photo) {
        uploaded.current = null;
        setStage("uploading");
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setBanner("רעננו את הדף ונסו שוב");
          return;
        }
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(REPORT_BUCKET)
          .upload(path, photo, { contentType: "image/jpeg", upsert: false });
        if (upErr) {
          setPhotoError(
            /row-level security|policy/i.test(upErr.message)
              ? "יותר מדי העלאות, נסו שוב בעוד כמה דקות"
              : "ההעלאה נכשלה. נסו שוב או הסירו את התמונה"
          );
          return;
        }
        imageUrl = supabase.storage.from(REPORT_BUCKET).getPublicUrl(path).data.publicUrl;
        uploaded.current = { blob: photo, path, url: imageUrl };
      }

      setStage("saving");
      let res: Awaited<ReturnType<typeof createReport>>;
      try {
        res = await createReport({ id, beachId, text, waveRating: rating, waveHeight: height, imageUrl });
      } catch {
        res = { error: "הפרסום נכשל. הטקסט נשמר, נסו שוב" };
      }
      if ("error" in res) {
        // Only a definitive validation rejection discards the photo. After a thrown/unknown error the
        // report may already exist and reference it, so the image must stay.
        if (res.rejected && uploaded.current) {
          await supabase.storage.from(REPORT_BUCKET).remove([uploaded.current.path]).catch(() => {});
          uploaded.current = null;
        }
        setBanner(res.error);
        return;
      }

      try {
        localStorage.setItem(LAST_BEACH_KEY, String(beachId));
      } catch {
        /* ignore */
      }
      setDone(true);
      router.push("/?posted=1");
    } finally {
      submitting.current = false;
      setStage("idle");
    }
  }

  const label = processing
    ? "מעבדים תמונה..."
    : stage === "uploading"
      ? "מעלים תמונה..."
      : stage === "saving" || done
        ? "מפרסמים..."
        : "פרסמו 🤙";

  const section = (i: number) => ({ "--i": i }) as React.CSSProperties;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 pb-28">
      <div className="motion-fade-up card-coast" style={section(0)}>
        <BeachPicker
          beaches={beaches}
          value={beachId}
          onChange={setBeachId}
          onBlur={() => setTouched((s) => ({ ...s, beach: true }))}
          error={beachError}
        />
      </div>

      <div className="motion-fade-up card-coast" style={section(1)}>
        <WaveRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="motion-fade-up card-coast flex flex-col gap-2.5" style={section(2)}>
        <label htmlFor="report-text" className="section-title">
          מה קורה בחוף?{rating !== null ? <span className="text-body-sm font-normal text-muted-text"> (לא חובה)</span> : null}
        </label>
        <textarea
          id="report-text"
          ref={taRef}
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setTouched((s) => ({ ...s, text: true }))}
          aria-invalid={textError ? true : undefined}
          aria-describedby="report-text-meta"
          className={cn(INPUT_CLASS, "resize-none")}
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="טקסט מהיר">
          {QUICK_TEXTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addQuick(t)}
              className="chip-coast min-h-touch shrink-0"
            >
              {t}
            </button>
          ))}
        </div>
        <div id="report-text-meta" className="flex justify-between gap-2 text-body-sm empty:hidden">
          <span role={textError ? "alert" : undefined} className="text-danger">
            {textError ? `⚠ ${textError}` : ""}
          </span>
          {len > 400 || tooLong ? (
            <span className={`font-mono ${tooLong ? "text-danger" : "text-muted-text"}`}>
              {len}/{REPORT_TEXT_MAX}
            </span>
          ) : null}
        </div>
      </div>

      {/* A div group, not fieldset/legend: a legend is painted on the card's border line, outside its padding. */}
      <div role="group" aria-labelledby="wave-height-title" className="motion-fade-up card-coast flex flex-col gap-2" style={section(3)}>
        <p id="wave-height-title" className="section-title">
          גובה גל <span className="text-body-sm font-normal text-muted-text">(לא חובה)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {WAVE_HEIGHTS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={height === h}
              onClick={() => setHeight(height === h ? null : h)}
              className="chip-coast min-h-touch"
            >
              {height === h ? "✓ " : ""}
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="motion-fade-up card-coast" style={section(4)}>
        <PhotoField onChange={setPhoto} onProcessing={setProcessing} uploading={stage === "uploading"} uploadError={photoError} disabled={busy} />
      </div>

      <div className="bar-coast fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-feed flex-col gap-2">
          {banner ? (
            <p role="alert" className="alert-coast text-body-sm">
              ⚠ {banner}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={blocked} aria-busy={blocked} className="btn-gradient w-full">
            {blocked ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {label}
          </Button>
        </div>
      </div>
    </form>
  );
}
