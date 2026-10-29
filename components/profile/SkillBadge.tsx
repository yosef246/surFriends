import type { SkillLevel } from "@/lib/database.types";
import { SKILL_LABELS } from "@/lib/profile";

export function SkillBadge({ level }: { level: SkillLevel | null }) {
  if (!level) return null;
  return (
    <span className="inline-flex h-7 items-center rounded-pill bg-signature-soft px-3 text-body-sm font-medium text-ink ring-1 ring-line">
      רמה: {SKILL_LABELS[level]}
    </span>
  );
}
