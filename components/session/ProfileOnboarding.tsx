"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { Mascot } from "@/components/mascot";
import { SkillLevelSelect } from "@/components/settings/SkillLevelSelect";
import { WaveStrip } from "@/components/shared/WaveStrip";
import { Button } from "@/components/ui/button";
import type { SkillLevel } from "@/lib/database.types";
import { DISPLAY_NAME_MAX, profileTextLength, validateProfileInput } from "@/lib/profile";

export const PROFILE_READY_EVENT = "sf:profile-ready";

const INPUT =
  "block min-h-12 w-full rounded-pill border-[1.5px] border-input bg-white/90 px-5 py-3 text-body text-copy shadow-card backdrop-blur-sm placeholder:text-muted-text focus:border-link-blue focus:ring-3 focus:ring-link/25 focus:outline-none aria-invalid:border-danger";

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
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-sea-page">
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-6 px-6 py-10 pb-28 text-foreground">
        <div className="flex flex-col items-center gap-2 text-center">
          <Mascot.Wave size={140} className="motion-float" />
          <h1 className="text-title heading-tight font-display font-normal text-gradient-sea">איך קוראים לך בים?</h1>
          <p className="text-body-sm text-muted-text">השם שלך יופיע בברכה ובדיווחים</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="onboard-name" className="text-body-sm font-medium text-ink">
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
            <p role="alert" className="rounded-lg border border-danger bg-white/90 p-3 text-body-sm text-danger">
              ⚠ {banner}
            </p>
          ) : null}

          <Button type="submit" variant="ocean" size="lg" disabled={pending} aria-busy={pending} className="w-full">
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "שומרים..." : "יאללה לים 🤙"}
          </Button>
        </form>
      </main>
      <WaveStrip tone="light" className="h-24" />
    </div>
  );
}
