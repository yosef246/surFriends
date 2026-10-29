import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { beachPhotoSrc, creditLabel } from "@/lib/beach-photo";
import type { ProfileView } from "@/lib/profile-data";
import { SKILL_LABELS } from "@/lib/profile";

const memberSince = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
};

type Props = {
  profile: Pick<ProfileView, "display_name" | "avatar_url" | "skill_level" | "bio" | "created_at">;
  /** Own profile: shows a nudge to add a bio. */
  isMe?: boolean;
  /** Cover photo (first favorite beach). Null = brand gradient. */
  cover?: { path: string | null; credit: string | null } | null;
  reportCount: number;
  /** Own profile only (favorites are private). */
  favoriteCount?: number;
  action?: ReactNode;
};

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 py-3">
      <span className="data-value text-section">{value}</span>
      <span className="data-label">{label}</span>
    </div>
  );
}

/** ProfileHero (DESIGN_SYSTEM 5j): cover, overlapping avatar, display name, skill chip, bio, stats row. */
export function ProfileHero({ profile, isMe = false, cover, reportCount, favoriteCount, action }: Props) {
  const since = memberSince(profile.created_at);
  const coverSrc = beachPhotoSrc(cover?.path);
  const credit = coverSrc ? creditLabel(cover?.credit) : null;
  return (
    <header className="card-coast flex flex-col p-0">
      <div className="cover-brand relative h-28 overflow-hidden rounded-t-[inherit]">
        {coverSrc ? (
          <>
            <Image src={coverSrc} alt="" fill priority sizes="(max-width: 576px) 100vw, 576px" className="object-cover" />
            <div className="photo-overlay" aria-hidden />
          </>
        ) : null}
        {credit ? (
          <Link href="/credits" className="credit pointer-events-auto max-w-[70%] truncate">
            {credit}
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-2 px-4 pb-4">
        <UserAvatar
          name={profile.display_name}
          src={profile.avatar_url}
          className="relative z-10 -mt-10 size-20 shrink-0 text-title ring-4 ring-white"
        />
        <h1 className="max-w-full font-display text-display font-normal break-words text-ink">{profile.display_name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {profile.skill_level ? <span className="chip-link">רמה: {SKILL_LABELS[profile.skill_level]}</span> : null}
          {since ? <span className="text-caption text-muted-text">חבר/ה מאז {since}</span> : null}
        </div>
        {profile.bio ? (
          <p className="max-w-sm text-body text-copy prose-he break-words">{profile.bio}</p>
        ) : isMe ? (
          <p className="text-body-sm text-muted-text">עוד לא הוספתם כמה מילים על עצמכם</p>
        ) : null}
        <div
          role="group"
          aria-label="סטטיסטיקה"
          className="mt-1 flex w-full divide-x divide-card-line rounded-xl border border-card-line rtl:divide-x-reverse"
        >
          <Stat value={reportCount} label="דיווחים פעילים" />
          {favoriteCount !== undefined ? <Stat value={favoriteCount} label="חופים מועדפים" /> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
