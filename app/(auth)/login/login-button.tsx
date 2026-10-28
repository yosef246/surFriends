"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.98h5.35c-.5 2.4-2.55 3.57-5.35 3.57a5.9 5.9 0 1 1 0-11.8c1.4 0 2.6.5 3.55 1.35l2.1-2.1A8.9 8.9 0 0 0 12 3a9 9 0 1 0 0 18c5.2 0 8.65-3.65 8.65-8.8 0-.37-.05-.75-.3-1.1Z"
      />
    </svg>
  );
}

export function LoginButton({ next, hasError }: { next: string; hasError?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(hasError ?? false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Restore the button if the user returns via bfcache from the Google screen.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function signIn() {
    setLoading(true);
    setError(false);
    // Short-lived cookie carries the post-login target through the OAuth round trip.
    document.cookie = `sf_next=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (err) {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {error ? (
        <p role="alert" className="rounded-lg border border-danger bg-card p-3 text-body-sm text-danger">
          משהו השתבש בהתחברות. נסו שוב.
        </p>
      ) : null}
      {offline ? (
        <p role="status" className="text-body-sm text-mist-text">
          אין חיבור לאינטרנט
        </p>
      ) : null}
      <Button type="button" size="lg" className="w-full" onClick={signIn} disabled={loading || offline}>
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : <GoogleMark />}
        {loading ? "מתחברים..." : "המשך עם Google"}
      </Button>
    </div>
  );
}
