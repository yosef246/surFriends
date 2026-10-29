"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** `link_error` from /callback (already sanitized by the server). */
  linkError?: string | null;
};

const ALREADY_EXISTS = "identity_already_exists";

const isAlreadyExists = (e: { code?: string; message?: string }) =>
  e.code === ALREADY_EXISTS || /already (been )?(linked|exists|registered)/i.test(e.message ?? "");

function GoogleMark() {
  return (
    <span
      aria-hidden
      className="flex size-6 items-center justify-center rounded-full border border-card-line bg-white text-label font-bold text-ink"
    >
      G
    </span>
  );
}

/** "שמרו את הפרופיל שלכם": link the anonymous profile to a Google account (supabase.auth.linkIdentity). */
export function GoogleLinkCard({ linkError = null }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [linked, setLinked] = useState<boolean | null>(null); // null = checking
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError && linkError !== ALREADY_EXISTS ? "החיבור עם Google לא הושלם. נסו שוב" : null
  );
  const [conflict, setConflict] = useState(linkError === ALREADY_EXISTS);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  // The error came from the redirect URL: clean it so a refresh does not show it again.
  useEffect(() => {
    if (linkError) window.history.replaceState(null, "", "/profile");
  }, [linkError]);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUserIdentities()
      .then(({ data }) => {
        if (cancelled) return;
        const google = data?.identities.find((i) => i.provider === "google");
        setLinked(!!google);
        const mail = google?.identity_data?.email;
        setEmail(typeof mail === "string" ? mail : null);
      })
      .catch(() => {
        if (!cancelled) setLinked(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function connect() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setConflict(false);
    try {
      const { error: err } = await createClient().auth.linkIdentity({
        provider: "google",
        options: { redirectTo: `${location.origin}/callback?next=/profile` },
      });
      if (err) {
        setBusy(false);
        if (isAlreadyExists(err)) setConflict(true);
        else setError("לא הצלחנו להתחיל את החיבור עם Google. נסו שוב");
      }
      // On success the browser is redirected to Google: keep the spinner.
    } catch {
      setBusy(false);
      setError(typeof navigator !== "undefined" && !navigator.onLine ? "אין חיבור. נסו שוב" : "משהו השתבש. נסו שוב");
    }
  }

  async function switchAccount() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/callback?next=/` },
      });
      if (err) {
        setBusy(false);
        setConfirmSwitch(false);
        setError("לא הצלחנו להתחבר עם Google. נסו שוב");
      }
    } catch {
      setBusy(false);
      setConfirmSwitch(false);
      setError("משהו השתבש. נסו שוב");
    }
  }

  if (linked) {
    return (
      <section aria-labelledby="google-heading" className="card-coast flex items-center gap-3 border-brand bg-brand-soft">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="google-heading" className="flex items-center gap-1.5 text-heading font-bold text-ink">
            מחובר עם Google
            <Check className="size-4 text-good-text" aria-hidden />
          </h2>
          {email ? (
            <p className="truncate text-body-sm text-copy">
              <bdi>{email}</bdi>
            </p>
          ) : null}
          <p className="text-caption text-muted-text">הפרופיל והדיווחים שלכם נשמרים בכל מכשיר.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="google-heading" className="card-coast flex flex-col gap-3 border-brand bg-brand-soft">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="google-heading" className="text-heading font-bold text-ink">
            שמרו את הפרופיל שלכם
          </h2>
          <p className="text-body-sm text-copy prose-he">
            התחברו עם Google כדי לשמור את השם, הדיווחים והחופים המועדפים גם אם תחליפו מכשיר או תנקו את הדפדפן.
          </p>
        </div>
      </div>

      {conflict ? (
        <div role="alert" className="alert-coast flex flex-col gap-2">
          <p className="text-body-sm font-bold">חשבון ה-Google הזה כבר רשום ב-surFriends</p>
          <p className="text-body-sm">
            אי אפשר לחבר אותו לפרופיל הנוכחי. אפשר לעבור לחשבון הקיים, אבל הפרופיל האנונימי הנוכחי והדיווחים שלו
            לא יועברו אליו.
          </p>
          <Button variant="secondary" onClick={() => setConfirmSwitch(true)} disabled={busy} className="self-start">
            עברו לחשבון הזה
          </Button>
        </div>
      ) : null}

      <p role="alert" className="text-body-sm text-danger empty:hidden">
        {error ? `⚠ ${error}` : null}
      </p>

      <Button
        variant="secondary"
        onClick={() => void connect()}
        disabled={busy || linked === null}
        aria-busy={busy}
        className="w-full"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <GoogleMark />}
        {busy ? "מעבירים ל-Google..." : "התחברו עם Google"}
      </Button>

      <ConfirmDialog
        open={confirmSwitch}
        title="לעבור לחשבון הקיים?"
        description="הפרופיל האנונימי הנוכחי, הדיווחים והחופים המועדפים שלו לא יועברו לחשבון ה-Google. הם יישארו רק במכשיר הזה, בלי דרך לחזור אליהם."
        confirmLabel="עברו לחשבון"
        busy={busy}
        error={error}
        onConfirm={() => void switchAccount()}
        onCancel={() => setConfirmSwitch(false)}
      />
    </section>
  );
}
