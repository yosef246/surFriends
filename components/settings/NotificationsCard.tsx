import { Bell } from "lucide-react";

/**
 * Boundary for Day 12 (Web Push opt-in). Today: a disabled, read-only card.
 * Replace the body with the real switch + permission flow; keep the section/heading.
 */
export function NotificationsCard() {
  return (
    <section aria-labelledby="notifications-heading" className="glass-card flex items-center gap-4 rounded-card p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-signature-soft text-ink ring-1 ring-line">
        <Bell className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="notifications-heading" className="text-heading heading-tight font-display font-normal text-ink">
          התראות — בקרוב
        </h2>
        <p id="notifications-desc" className="mt-1 text-body-sm text-muted-text">
          נעדכן אתכם כשיש דיווח חדש מהחופים המועדפים
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={false}
        aria-labelledby="notifications-heading"
        aria-describedby="notifications-desc"
        disabled
        className="relative h-7 w-12 shrink-0 rounded-pill bg-surface opacity-60 ring-1 ring-line"
      >
        <span aria-hidden className="absolute start-1 top-1 size-5 rounded-full bg-white shadow-card" />
      </button>
    </section>
  );
}
