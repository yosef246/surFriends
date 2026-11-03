"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { greetingFor } from "@/components/feed/FeedGreeting";
import { Mascot } from "@/components/mascot";
import { OceanScene, SCENE_PHOTOS, Wordmark } from "@/components/shared/OceanScene";
import { SkillLevelSelect } from "@/components/settings/SkillLevelSelect";
import { Button } from "@/components/ui/button";
import type { SkillLevel } from "@/lib/database.types";
import { DISPLAY_NAME_MAX, profileTextLength, validateProfileInput } from "@/lib/profile";

export const PROFILE_READY_EVENT = "sf:profile-ready";

/** Time the success check is shown before the wave wipe starts (AppStart plays the wipe). */
const CHECK_MS = 600;

const HEADLINE = ["איך", "קוראים", "לך", "בים?"];
const CREDITS = [...new Set(SCENE_PHOTOS.map((p) => p.credit))].join(" · ");

/** Full-screen immersive "create profile" step, shown after the splash until a name is saved (no skip). */
export function ProfileOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const busy = useRef(false);

  const check = validateProfileInput({ display_name: name, skill_level: skill, bio: null });
  const nameError = !check.ok && /^(השם|הכניסו)/.test(check.error) ? check.error : null;
  const nameLen = profileTextLength(name.trim());
  const preview = name.trim();

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setTouched(true);
    setBanner(null);
    if (!check.ok) {
      if (nameError) setShake((n) => n + 1);
      inputRef.current?.focus();
      return;
    }
    busy.current = true;
    setPending(true);
    let res: Awaited<ReturnType<typeof updateProfile>>;
    try {
      res = await updateProfile(check.value);
    } catch {
      res = { error: "השמירה נכשלה, נסו שוב" };
    }
    if ("error" in res) {
      busy.current = false;
      setPending(false);
      setBanner(res.error);
      return;
    }
    router.refresh(); // the feed greeting picks up the new name
    setDone(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => window.dispatchEvent(new Event(PROFILE_READY_EVENT)), reduced ? 0 : CHECK_MS);
  }

  const state = done ? "done" : pending ? "busy" : "idle";

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-ocean-deep text-white">
      <OceanScene />
      <div className="absolute inset-0 overflow-y-auto">
        <main className="relative mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-between gap-6 px-4 pt-8 pb-10">
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="ob-rise" style={{ ["--base" as string]: "100ms" }}>
              <Wordmark />
            </div>
            <div className="ob-mascot-pop">
              <Mascot.Wave size={112} className="motion-float" />
            </div>
            <h1 className="font-display text-hero font-normal text-balance text-white drop-shadow-md">
              {HEADLINE.map((w, i) => (
                <span key={w}>
                  <span className="ob-word" style={{ ["--i" as string]: i }}>
                    {w}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="ob-rise text-body-sm text-white/90" style={{ ["--base" as string]: "950ms" }}>
              השם שלך יופיע בברכה ובדיווחים
            </p>
          </header>

          <div className="ob-card-in rounded-card border border-white/60 bg-white/85 p-5 text-foreground shadow-xl backdrop-blur-md">
            <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div key={shake} className={`ob-field pt-1 ${shake ? "ob-shake" : ""}`}>
                  <input
                    ref={inputRef}
                    id="onboard-name"
                    type="text"
                    value={name}
                    placeholder=" "
                    maxLength={DISPLAY_NAME_MAX * 4}
                    autoComplete="given-name"
                    disabled={pending || done}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-invalid={touched && nameError ? true : undefined}
                    aria-describedby="onboard-name-meta"
                    className="ob-input block min-h-14 w-full rounded-lg border border-mist-border bg-white px-3.5 pt-6 pb-1.5 text-body text-copy placeholder:text-transparent focus:border-brand focus:outline-none aria-invalid:border-danger disabled:bg-surface disabled:text-muted-text"
                  />
                  <label htmlFor="onboard-name" className="ob-label text-body">
                    איך קוראים לך?
                  </label>
                </div>
                <p aria-hidden className="min-h-6 truncate text-body-sm font-semibold text-ink">
                  {preview ? (
                    <>
                      {greetingFor()}, {preview} <span>🤙</span>
                    </>
                  ) : (
                    <span className="font-normal text-muted-text">ככה נברך אותך בכל בוקר 🌊</span>
                  )}
                </p>
                <div id="onboard-name-meta" className="flex justify-between gap-2 text-body-sm empty:hidden">
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

              <SkillLevelSelect value={skill} onChange={setSkill} disabled={pending || done} staggerIn />

              {banner ? (
                <p role="alert" className="alert-coast text-body-sm">
                  ⚠ {banner}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={pending || done}
                aria-busy={pending}
                data-state={state}
                className="btn-gradient ob-cta w-full disabled:opacity-100"
              >
                {done ? (
                  <>
                    <Check className="ob-check size-6" aria-hidden />
                    <span className="sr-only">נשמר</span>
                  </>
                ) : pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    שומרים...
                  </>
                ) : (
                  "יאללה לים 🤙"
                )}
              </Button>
            </form>
          </div>
        </main>
      </div>
      <span className="credit z-10" aria-hidden>
        © {CREDITS} · CC
      </span>
    </div>
  );
}
