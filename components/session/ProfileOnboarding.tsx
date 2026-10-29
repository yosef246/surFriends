"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { SkillLevelSelect } from "@/components/settings/SkillLevelSelect";
import { PhotoHero } from "@/components/shared/PhotoHero";
import { Button } from "@/components/ui/button";
import { DEFAULT_BEACH_PHOTO } from "@/lib/beach-photo";
import { INPUT_CLASS } from "@/components/ui/field";
import type { SkillLevel } from "@/lib/database.types";
import { DISPLAY_NAME_MAX, profileTextLength, validateProfileInput } from "@/lib/profile";

export const PROFILE_READY_EVENT = "sf:profile-ready";

const INPUT = INPUT_CLASS;

/** Full-screen "create profile" step, shown after the splash until a name is saved (no skip). */
export function ProfileOnboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const busy = useRef(false);

  const check = validateProfileInput({ display_name: name, skill_level: skill, bio: null });
  const nameError = !check.ok && /^(השם|הכניסו)/.test(check.error) ? check.error : null;
  const nameLen = profileTextLength(name.trim());

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
    if ("error" in res) {
      busy.current = false;
      setPending(false);
      setBanner(res.error);
      return;
    }
    router.refresh(); // the feed greeting picks up the new name
    window.dispatchEvent(new Event(PROFILE_READY_EVENT));
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-page">
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col text-foreground">
        <PhotoHero
          priority
          imagePath={DEFAULT_BEACH_PHOTO.path}
          imageCredit={DEFAULT_BEACH_PHOTO.credit}
          className="min-h-64 rounded-t-none pb-10"
          eyebrow="ברוכים הבאים ל-surFriends"
          title={<h1>איך קוראים לך בים?</h1>}
        >
          <p className="text-body-sm text-white/90">השם שלך יופיע בברכה ובדיווחים</p>
        </PhotoHero>
        <div className="card-coast relative z-10 -mt-6 mb-10 flex flex-col gap-5 p-5 mx-4">
          <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="onboard-name" className="text-body-sm font-semibold text-ink">
                שם
              </label>
              <input
                id="onboard-name"
                type="text"
                value={name}
                maxLength={DISPLAY_NAME_MAX * 4}
                autoComplete="given-name"
                disabled={pending}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={touched && nameError ? true : undefined}
                aria-describedby="onboard-name-meta"
                className={INPUT}
              />
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

            <SkillLevelSelect value={skill} onChange={setSkill} disabled={pending} />

            {banner ? (
              <p role="alert" className="alert-coast text-body-sm">
                ⚠ {banner}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="btn-primary w-full">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {pending ? "שומרים..." : "יאללה לים 🤙"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
