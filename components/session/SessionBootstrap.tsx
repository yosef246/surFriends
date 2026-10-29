"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Outcome = { ok: boolean; created: boolean; needsProfile: boolean };

// Module-level so StrictMode double mounts / remounts never create two anonymous users.
let inflight: Promise<Outcome> | null = null;

async function ensureSession(): Promise<Outcome> {
  const supabase = createClient();
  try {
    const { data } = await supabase.auth.getSession();
    let uid = data.session?.user.id ?? null;
    let created = false;
    if (!uid) {
      const res = await supabase.auth.signInAnonymously();
      if (res.error || !res.data.user) return { ok: false, created: false, needsProfile: false };
      uid = res.data.user.id;
      created = true;
    }
    const { data: profile } = await supabase.from("profiles").select("name_chosen").eq("id", uid).maybeSingle();
    return { ok: true, created, needsProfile: profile?.name_chosen === false };
  } catch {
    return { ok: false, created: false, needsProfile: false };
  }
}

/**
 * Client-side on purpose (not middleware): crawlers and prefetches never create junk users.
 * Ensures an anonymous Supabase session exists, then refreshes server components so they see the cookie.
 */
export function SessionBootstrap({ onSettled }: { onSettled: (needsProfile: boolean) => void }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const settledRef = useRef(onSettled);
  useEffect(() => {
    settledRef.current = onSettled;
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      inflight ??= ensureSession().finally(() => {
        inflight = null;
      });
      const out = await inflight;
      if (cancelled) return;
      setFailed(!out.ok);
      if (out.created) router.refresh();
      settledRef.current(out.needsProfile);
    }
    void run();
    const retry = () => {
      if (navigator.onLine) void run();
    };
    window.addEventListener("online", retry);
    return () => {
      cancelled = true;
      window.removeEventListener("online", retry);
    };
  }, [router]);

  if (!failed) return null;
  return (
    <p
      role="status"
      className="fixed inset-x-4 bottom-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+1rem)] z-40 mx-auto max-w-feed rounded-lg border border-danger bg-card p-3 text-center text-body-sm text-danger shadow-raised"
    >
      לא הצלחנו להתחבר לשרת. נסו לרענן
    </p>
  );
}
