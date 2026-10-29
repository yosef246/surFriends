"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import type { SkillLevel } from "@/lib/database.types";
import { BIO_MAX, DISPLAY_NAME_MAX, profileTextLength, validateProfileInput } from "@/lib/profile";
import { SkillLevelSelect } from "./SkillLevelSelect";

type Initial = { display_name: string; skill_level: SkillLevel | null; bio: string | null };

const INPUT =
  "block min-h-12 w-full rounded-pill border-[1.5px] border-input bg-white/90 px-5 py-3 text-body text-copy shadow-card backdrop-blur-sm placeholder:text-muted-text focus:border-link-blue focus:ring-3 focus:ring-link/25 focus:outline-none aria-invalid:border-danger";

export function ProfileEditForm({ initial }: { initial: Initial }) {
  const [name, setName] = useState(initial.display_name);
  const [skill, setSkill] = useState<SkillLevel | null>(initial.skill_level);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [saved, setSaved] = useState<Initial>(initial);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const busy = useRef(false);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  // Single-line pill that grows (max 3 lines) only when the text wraps.
  useEffect(() => {
    const el = bioRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
    el.style.overflowY = el.scrollHeight > 96 ? "auto" : "hidden";
  }, [bio]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const check = validateProfileInput({ display_name: name, skill_level: skill, bio });
  const nameLen = profileTextLength(name.trim());
  const bioLen = profileTextLength(bio);
  const nameError = !check.ok && /^(השם|הכניסו)/.test(check.error) ? check.error : null;
  const bioError = !check.ok && /^הטקסט/.test(check.error) ? check.error : null;
  const dirty = check.ok
    ? check.value.display_name !== saved.display_name ||
      check.value.skill_level !== saved.skill_level ||
      check.value.bio !== saved.bio
    : true;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setTouched(true);
    setBanner(null);
    if (!check.ok) return;
    busy.current = true;
    setPending(true);
    let res: Awaited<ReturnType<typeof updateProfile>>;
    try {
      res = await updateProfile(check.value);
    } catch {
      res = { error: "השמירה נכשלה, נסו שוב" };
    }
    busy.current = false;
    setPending(false);
    if ("error" in res) {
      setBanner(res.error);
      return;
    }
    setSaved(check.value);
    setName(check.value.display_name);
    setBio(check.value.bio ?? "");
    setToast(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="profile-name" className="text-body-sm font-medium text-ink">
          שם
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          maxLength={DISPLAY_NAME_MAX * 4}
          autoComplete="name"
          disabled={pending}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && nameError ? true : undefined}
          aria-describedby="profile-name-meta"
          className={INPUT}
        />
        <div id="profile-name-meta" className="flex justify-between gap-2 text-body-sm empty:hidden">
          <span role={touched && nameError ? "alert" : undefined} className="text-danger">
            {touched && nameError ? `⚠ ${nameError}` : ""}
          </span>
          {nameLen > 30 ? (
            <span className={`font-mono ${nameLen > DISPLAY_NAME_MAX ? "text-danger" : "text-muted-text"}`}>
              {nameLen}/{DISPLAY_NAME_MAX}
            </span>
          ) : null}
        </div>
      </div>

      <SkillLevelSelect value={skill} onChange={setSkill} disabled={pending} />

      <div className="flex flex-col gap-2">
        <label htmlFor="profile-bio" className="text-body-sm font-medium text-ink">
          כמה מילים עליכם (לא חובה)
        </label>
        <textarea
          id="profile-bio"
          ref={bioRef}
          rows={1}
          value={bio}
          disabled={pending}
          onChange={(e) => setBio(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault(); // one-line field
          }}
          aria-invalid={bioError ? true : undefined}
          aria-describedby="profile-bio-meta"
          className={`${INPUT} resize-none`}
        />
        <div id="profile-bio-meta" className="flex justify-between gap-2 text-body-sm empty:hidden">
          <span role={bioError ? "alert" : undefined} className="text-danger">
            {bioError ? `⚠ ${bioError}` : ""}
          </span>
          {bioLen > 120 ? (
            <span className={`font-mono ${bioLen > BIO_MAX ? "text-danger" : "text-muted-text"}`}>
              {bioLen}/{BIO_MAX}
            </span>
          ) : null}
        </div>
      </div>

      {banner ? (
        <p role="alert" className="rounded-lg border border-danger bg-white/90 p-3 text-body-sm text-danger">
          ⚠ {banner}
        </p>
      ) : null}

      <Button type="submit" variant="ocean" size="lg" disabled={pending || !dirty} aria-busy={pending} className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "שומרים..." : "שמירה"}
      </Button>

      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+1rem)] z-40 mx-auto max-w-feed empty:hidden"
      >
        {toast ? (
          <p className="flex items-center justify-center gap-2 rounded-pill bg-success px-4 py-2.5 text-body-sm font-medium text-success-foreground shadow-raised animate-toast-in">
            <Check className="size-4" aria-hidden /> הפרופיל נשמר
          </p>
        ) : null}
      </div>
    </form>
  );
}
