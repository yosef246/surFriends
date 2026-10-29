import type { ReactNode } from "react";
import { UserAvatar } from "@/components/layout/UserAvatar";
import type { ProfileView } from "@/lib/profile-data";
import { SkillBadge } from "./SkillBadge";

const memberSince = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
};

type Props = {
  profile: Pick<ProfileView, "display_name" | "avatar_url" | "skill_level" | "bio" | "created_at">;
  /** Own profile: shows a nudge to add a bio and the edit action. */
  isMe?: boolean;
  action?: ReactNode;
};

export function ProfileHeader({ profile, isMe = false, action }: Props) {
  const since = memberSince(profile.created_at);
  return (
    <header className="glass-card motion-pop-in flex flex-col items-center gap-3 rounded-card p-6 text-center">
      <UserAvatar
        name={profile.display_name}
        src={profile.avatar_url}
        className="size-24 text-title ring-4 ring-signature"
      />
      <h1 className="max-w-full text-title heading-tight font-display font-normal break-words text-ink">
        {profile.display_name}
      </h1>
      <SkillBadge level={profile.skill_level} />
      {profile.bio ? (
        <p className="max-w-sm text-body text-copy prose-he break-words">{profile.bio}</p>
      ) : isMe ? (
        <p className="text-body-sm text-muted-text">עוד לא הוספתם כמה מילים על עצמכם</p>
      ) : null}
      {since ? <p className="text-caption text-muted-text">חבר/ה מאז {since}</p> : null}
      {action}
    </header>
  );
}
