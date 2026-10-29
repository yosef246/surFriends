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
  textLength,
} from "@/lib/reports";
import { BeachPicker, type BeachOption } from "./BeachPicker";
import { PhotoField } from "./PhotoField";
import { WaveRatingInput } from "./WaveRatingInput";

type Props = { beaches: BeachOption[]; defaultBeachId: number | null };

const chip = (on: boolean) =>
  `min-h-touch rounded-full border px-4 text-body-sm font-medium ${
    on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground"
  }`;

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
  const submitting = useRef(false);

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
  const trimmedEmpty = text.trim().length === 0;
  const tooLong = len > REPORT_TEXT_MAX;
  const beachError = touched.beach && beachId === null ? "בחרו חוף" : null;
  const textError = tooLong
    ? `הטקסט ארוך מדי (${len}/${REPORT_TEXT_MAX})`
    : touched.text && trimmedEmpty
      ? "ספרו מה קורה בחוף"
      : null;
  const busy = stage !== "idle" || done;

  function addQuick(t: string) {
    setText((cur) => (cur.trim() ? `${cur.trimEnd()} ${t}` : t));
    setTouched((s) => ({ ...s, text: true }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    setBanner(null);
    setPhotoError(null);
    setTouched({ beach: true, text: true });
    if (beachId === null || trimmedEmpty || tooLong) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBanner("אין קליטה. נסו שוב כשיהיה חיבור");
      return;
    }

    submitting.current = true;
    const supabase = createClient();
    let uploadedPath: string | null = null;
    try {
      let imageUrl: string | null = null;
      if (photo) {
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
          setPhotoError("ההעלאה נכשלה. נסו שוב או הסירו את התמונה");
          return;
        }
        uploadedPath = path;
        imageUrl = supabase.storage.from(REPORT_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      setStage("saving");
      let res: Awaited<ReturnType<typeof createReport>>;
      try {
        res = await createReport({ beachId, text, waveRating: rating, waveHeight: height, imageUrl });
      } catch {
        res = { error: "הפרסום נכשל. הטקסט נשמר, נסו שוב" };
      }
      if ("error" in res) {
        if (uploadedPath) {
          await supabase.storage.from(REPORT_BUCKET).remove([uploadedPath]).catch(() => {}); // avoid orphans
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

  const label =
    stage === "uploading" ? "מעלים תמונה..." : stage === "saving" || done ? "מפרסמים..." : "פרסמו";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-28">
      <BeachPicker
        beaches={beaches}
        value={beachId}
        onChange={setBeachId}
        onBlur={() => setTouched((s) => ({ ...s, beach: true }))}
        error={beachError}
      />

      <WaveRatingInput value={rating} onChange={setRating} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-text" className="text-body-sm font-semibold text-sea-deep">
          מה קורה בחוף?
        </label>
        <textarea
          id="report-text"
          value={text}
          rows={4}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setTouched((s) => ({ ...s, text: true }))}
          aria-invalid={textError ? true : undefined}
          aria-describedby="report-text-meta"
          className="w-full resize-y rounded-lg border border-input bg-card p-3 text-body text-foreground aria-invalid:border-destructive"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="טקסט מהיר">
          {QUICK_TEXTS.map((t) => (
            <button key={t} type="button" onClick={() => addQuick(t)} className={chip(false)}>
              {t}
            </button>
          ))}
        </div>
        <div id="report-text-meta" className="flex justify-between gap-2 text-body-sm">
          <span role={textError ? "alert" : undefined} className="text-danger">
            {textError ? `⚠ ${textError}` : ""}
          </span>
          <span className={`font-mono ${tooLong ? "text-danger" : "text-mist-text"}`}>
            {len}/{REPORT_TEXT_MAX}
          </span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-body-sm font-semibold text-sea-deep">גובה גל (לא חובה)</legend>
        <div className="flex flex-wrap gap-2">
          {WAVE_HEIGHTS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={height === h}
              onClick={() => setHeight(height === h ? null : h)}
              className={chip(height === h)}
            >
              {height === h ? "✓ " : ""}
              {h}
            </button>
          ))}
        </div>
      </fieldset>

      <PhotoField onChange={setPhoto} uploading={stage === "uploading"} uploadError={photoError} disabled={busy} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-feed flex-col gap-2">
          {banner ? (
            <p role="alert" className="rounded-lg border border-destructive p-3 text-body-sm text-danger">
              ⚠ {banner}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={busy} aria-busy={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {label}
          </Button>
        </div>
      </div>
    </form>
  );
}
