"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          setBanner("ההתחברות פגה. התחברו מחדש");
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-28">
      <div className="motion-fade-up" style={section(0)}>
        <BeachPicker
          beaches={beaches}
          value={beachId}
          onChange={setBeachId}
          onBlur={() => setTouched((s) => ({ ...s, beach: true }))}
          error={beachError}
        />
      </div>

      <div className="motion-fade-up" style={section(1)}>
        <WaveRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="motion-fade-up flex flex-col gap-2" style={section(2)}>
        <label htmlFor="report-text" className="text-body-sm font-medium text-ink">
          מה קורה בחוף?{rating !== null ? " (לא חובה)" : ""}
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
          className="block min-h-12 w-full resize-none rounded-pill border-[1.5px] border-input bg-white/90 px-5 py-3 text-body text-copy shadow-card backdrop-blur-sm placeholder:text-muted-text focus:border-link-blue focus:ring-3 focus:ring-link/25 focus:outline-none aria-invalid:border-danger"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="טקסט מהיר">
          {QUICK_TEXTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addQuick(t)}
              className="bubble-chip h-12 shrink-0 rounded-full px-5 text-body-sm font-semibold whitespace-nowrap"
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

      <fieldset className="motion-fade-up flex flex-col gap-1.5" style={section(3)}>
        <legend className="mb-1.5 text-body-sm font-medium text-ink">גובה גל (לא חובה)</legend>
        <div className="flex flex-wrap gap-2">
          {WAVE_HEIGHTS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={height === h}
              onClick={() => setHeight(height === h ? null : h)}
              className="bubble-chip h-12 rounded-full px-5 text-body-sm font-semibold"
            >
              {height === h ? "✓ " : ""}
              {h}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="motion-fade-up" style={section(4)}>
        <PhotoField onChange={setPhoto} onProcessing={setProcessing} uploading={stage === "uploading"} uploadError={photoError} disabled={busy} />
      </div>

      <div className="glass-bar fixed inset-x-0 bottom-0 z-30 rounded-t-card px-4 pt-3 shadow-nav pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-feed flex-col gap-2">
          {banner ? (
            <p role="alert" className="rounded-lg border border-danger bg-white/90 p-3 text-body-sm text-danger">
              ⚠ {banner}
            </p>
          ) : null}
          <Button type="submit" variant="ocean" size="lg" disabled={blocked} aria-busy={blocked} className="w-full">
            {blocked ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {label}
          </Button>
        </div>
      </div>
    </form>
  );
}
