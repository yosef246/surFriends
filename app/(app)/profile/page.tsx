import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ReportList } from "@/components/feed/ReportList";
import { FavoriteBeaches } from "@/components/profile/FavoriteBeaches";
import { GoogleLinkCard } from "@/components/profile/GoogleLinkCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { countActiveReports, fetchReports } from "@/lib/feed";
import { PreparingProfile } from "@/components/session/PreparingProfile";
import { DEFAULT_DISPLAY_NAME } from "@/lib/profile";
import { fetchFavoriteBeaches, getProfileById } from "@/lib/profile-data";
import { REPORT_TTL_HOURS, reportCutoffIso } from "@/lib/reports";
import { safeErrorCode } from "@/lib/safe-next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "הפרופיל שלי | surFriends" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ link_error?: string }> }) {
  const [supabase, user, { link_error }] = await Promise.all([getSupabase(), getCurrentUser(), searchParams]);
  if (!user) return <PreparingProfile />;

  const cutoff = reportCutoffIso();
  const [profile, favorites, reports, reportCount] = await Promise.all([
    getProfileById(user.id),
    fetchFavoriteBeaches(user.id),
    fetchReports(supabase, cutoff, null, user.id, null, user.id),
    countActiveReports(supabase, cutoff, user.id),
  ]);

  const displayName =
    profile?.display_name ?? (user.user_metadata?.full_name as string | undefined) ?? DEFAULT_DISPLAY_NAME;
  const avatarUrl = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;
  const cover = favorites[0] ? { path: favorites[0].imagePath, credit: favorites[0].imageCredit } : null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileHero
        isMe
        cover={cover}
        reportCount={reportCount}
        favoriteCount={favorites.length}
        profile={{
          display_name: displayName,
          avatar_url: avatarUrl,
          skill_level: profile?.skill_level ?? null,
          bio: profile?.bio ?? null,
          created_at: profile?.created_at ?? null,
        }}
        action={
          <Link href="/settings" className={cn(buttonVariants({ variant: "secondary" }), "mt-1 w-full")}>
            <Pencil aria-hidden className="size-4" />
            עריכת פרופיל
          </Link>
        }
      />

      <GoogleLinkCard linkError={link_error ? safeErrorCode(link_error) : null} />

      <FavoriteBeaches beaches={favorites} />

      <ReportList
        initialReports={reports}
        currentUserId={user.id}
        currentUserName={displayName}
        currentUserAvatar={avatarUrl}
        authorId={user.id}
        heading={
          <>
            <h2 className="section-title">הדיווחים שלי</h2>
            <p className="text-label text-muted-text">מה-{REPORT_TTL_HOURS} השעות האחרונות</p>
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
