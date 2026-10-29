"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";

/** One-shot "פורסם!" notice driven by ?posted=1. Dismissible, auto-hides, cleans the URL. */
export function PostedNotice() {
  const router = useRouter();
  const params = useSearchParams();
  const posted = params.get("posted") === "1";
  const [open, setOpen] = useState(posted);

  useEffect(() => {
    if (!posted) return;
    setOpen(true);
    router.replace("/", { scroll: false });
  }, [posted, router]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 4000);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="status"
      className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-success px-4 py-2 text-body-sm font-semibold text-success-foreground animate-toast-in"
    >
      <span className="flex items-center gap-2">
        <Check className="size-4" aria-hidden /> פורסם!
      </span>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="סגירה"
        className="flex min-h-touch min-w-touch items-center justify-center"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
