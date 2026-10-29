"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { deleteReport } from "@/app/actions/reports";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

/** Owner-only "⋯" menu with a single item: delete the report (after a confirm dialog). */
export function ReportMenu({ reportId, onDeleted }: { reportId: string; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteReport(reportId);
        if ("error" in res) {
          setError(res.error);
          return;
        }
        setConfirm(false);
        onDeleted(reportId);
      } catch {
        setError(typeof navigator !== "undefined" && !navigator.onLine ? "אין חיבור. נסו שוב" : "המחיקה נכשלה. נסו שוב");
      }
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label="אפשרויות דיווח"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="bubble-ghost inline-flex size-touch items-center justify-center rounded-pill text-heading leading-none text-muted-text"
      >
        <span aria-hidden>⋯</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="card-coast shadow-raised motion-pop-in absolute end-0 top-full z-10 mt-1 min-w-40 p-1!"
        >
          <button
            type="button"
            role="menuitem"
            autoFocus
            onClick={() => {
              setOpen(false);
              setError(null);
              setConfirm(true);
            }}
            className="flex min-h-touch w-full items-center rounded-xl px-3 text-start text-body-sm font-medium text-danger hover:bg-surface"
          >
            מחקו דיווח
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirm}
        title="למחוק את הדיווח?"
        description="הדיווח וכל התגובות אליו יימחקו. אי אפשר לשחזר."
        confirmLabel="מחקו"
        busy={busy}
        error={error}
        onConfirm={doDelete}
        onCancel={() => {
          setConfirm(false);
          btnRef.current?.focus();
        }}
      />
    </div>
  );
}
