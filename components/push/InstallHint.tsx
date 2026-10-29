import { Share } from "lucide-react";

/** iOS Safari (not installed): push only works from the Home Screen app, so explain instead of asking. */
export function InstallHint({ className }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 rounded-card bg-signature-soft p-3 text-body-sm text-ink ${className ?? ""}`}>
      <Share aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>כדי לקבל התראות באייפון: לחצו על שיתוף ⬆️ ואז &quot;הוספה למסך הבית&quot;, ופתחו את האפליקציה משם</span>
    </p>
  );
}
