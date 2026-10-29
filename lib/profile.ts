/** Shared (client + server) constants and validation for profiles and favorites. Pure: no I/O. */
import type { SkillLevel } from "./database.types";

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;
export const BIO_MAX = 160;

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "pro"] as const satisfies readonly SkillLevel[];
export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "מתחיל",
  intermediate: "בינוני",
  advanced: "מתקדם",
  pro: "מקצוען",
};

export const profileTextLength = (s: string) => Array.from(s).length;
const isBlank = (s: string) => s.replace(/[\s\p{Cf}]/gu, "").length === 0;

export const isSkillLevel = (v: unknown): v is SkillLevel =>
  typeof v === "string" && (SKILL_LEVELS as readonly string[]).includes(v);

export type ProfileInput = { display_name: string; skill_level: SkillLevel | null; bio: string | null };

export function validateProfileInput(
  input: unknown
): { ok: true; value: ProfileInput } | { ok: false; error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fail = (error: string) => ({ ok: false as const, error });

  if (typeof raw.display_name !== "string") return fail("הכניסו שם");
  const name = raw.display_name.trim();
  if (isBlank(name) || profileTextLength(name) < DISPLAY_NAME_MIN) {
    return fail(`השם קצר מדי (לפחות ${DISPLAY_NAME_MIN} תווים)`);
  }
  if (profileTextLength(name) > DISPLAY_NAME_MAX) return fail(`השם ארוך מדי (עד ${DISPLAY_NAME_MAX} תווים)`);

  const skill = raw.skill_level ?? null;
  if (skill !== null && !isSkillLevel(skill)) return fail("רמה לא תקינה");

  if (raw.bio != null && typeof raw.bio !== "string") return fail("הטקסט לא תקין");
  // One-line field: line breaks become single spaces.
  const bio = typeof raw.bio === "string" ? raw.bio.replace(/\s*[\r\n]+\s*/g, " ").trim() : "";
  if (profileTextLength(bio) > BIO_MAX) return fail(`הטקסט ארוך מדי (עד ${BIO_MAX} תווים)`);

  return { ok: true, value: { display_name: name, skill_level: skill, bio: isBlank(bio) ? null : bio } };
}

export const isBeachId = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;

/** Optimistic favorite toggle on a list of beach ids (pure; returns a new array). */
export function setFavorite(ids: readonly number[], beachId: number, on: boolean): number[] {
  const without = ids.filter((i) => i !== beachId);
  return on ? [...without, beachId] : without;
}
