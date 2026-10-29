"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Accessible confirm built on the native <dialog> (focus trap, Escape, backdrop come from the browser). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onCancel={(e) => {
        e.preventDefault(); // Escape: let the parent drive state
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel(); // backdrop click
      }}
      className="card-coast m-auto w-[min(92vw,24rem)] p-6 text-copy backdrop:bg-abyss/50"
    >
      <h2 id="confirm-title" className="text-heading font-bold text-ink">
        {title}
      </h2>
      <p id="confirm-desc" className="mt-2 text-body text-copy">
        {description}
      </p>
      <p role="alert" className="mt-2 text-body-sm text-danger empty:hidden">
        {error ? `⚠ ${error}` : null}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={cn(buttonVariants({ variant: "secondary" }), "min-h-touch")}
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={cn(buttonVariants({ variant: "destructive" }), "min-h-touch")}
        >
          {busy ? "מוחקים..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
