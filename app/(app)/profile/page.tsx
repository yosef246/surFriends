import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ReportList } from "@/components/feed/ReportList";
import { FavoriteBeachesList } from "@/components/profile/FavoriteBeachesList";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { fetchReports } from "@/lib/feed";
import { PreparingProfile } from "@/components/session/PreparingProfile";
import { DEFAULT_DISPLAY_NAME } from "@/lib/profile";
import { fetchFavoriteBeaches, getProfileById } from "@/lib/profile-data";
import { REPORT_TTL_HOURS, reportCutoffIso } from "@/lib/reports";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "הפרופיל שלי | surFriends" };

export default async function ProfilePage() {
  const [supabase, user] = await Promise.all([getSupabase(), getCurrentUser()]);
  if (!user) return <PreparingProfile />;

  const [profile, favorites, reports] = await Promise.all([
    getProfileById(user.id),
    fetchFavoriteBeaches(user.id),
    fetchReports(supabase, reportCutoffIso(), null, user.id, null, user.id),
  ]);

  const displayName =
    profile?.display_name ?? (user.user_metadata?.full_name as string | undefined) ?? DEFAULT_DISPLAY_NAME;
  const avatarUrl = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        isMe
        profile={{
          display_name: displayName,
          avatar_url: avatarUrl,
          skill_level: profile?.skill_level ?? null,
          bio: profile?.bio ?? null,
          created_at: profile?.created_at ?? null,
        }}
        action={
          <Link href="/settings" className={cn(buttonVariants({ variant: "ocean" }), "mt-1 min-h-touch")}>
            <Pencil aria-hidden className="size-4" />
            ערכו פרופיל
          </Link>
        }
      />

      <FavoriteBeachesList beaches={favorites} />

      <ReportList
        initialReports={reports}
        currentUserId={user.id}
        currentUserName={displayName}
        currentUserAvatar={avatarUrl}
        authorId={user.id}
        heading={
          <>
            <p className="eyebrow eyebrow-coral">הדיווחים שלי</p>
            <h2 className="text-title heading-tight font-display font-normal text-ink">
              הדיווחים שלי מה-{REPORT_TTL_HOURS} השעות האחרונות
            </h2>
          </>
        }
        emptyState={
          <EmptyState title={`לא דיווחתם ב-${REPORT_TTL_HOURS} השעות האחרונות`}>
            <Link href="/new" className={cn(buttonVariants({ variant: "ocean" }), "min-h-touch")}>
              דווחו עכשיו
            </Link>
          </EmptyState>
        }
      />
    </div>
  );
}
