import { Suspense } from "react";
import { BeachCircleRow } from "@/components/feed/BeachCircleRow";
import { HeroSummary } from "@/components/feed/HeroSummary";
import { PostedNotice } from "@/components/feed/PostedNotice";
import { ReportList } from "@/components/feed/ReportList";
import { FeedHeader, greetingFor } from "@/components/layout/FeedHeader";
import { fetchBeachCircles, fetchHeroSummary, fetchReports } from "@/lib/feed";
import { DEFAULT_DISPLAY_NAME, firstNameOf } from "@/lib/profile";
import { REPORT_TTL_HOURS, reportCutoffIso } from "@/lib/reports";
import { getCurrentProfile, getCurrentUser, getSupabase } from "@/lib/auth";

export default async function FeedPage() {
  const [supabase, user] = await Promise.all([getSupabase(), getCurrentUser()]);
  const userId = user?.id ?? "";

  const cutoff = reportCutoffIso();
  const [reports, summary, beaches, profile] = await Promise.all([
    fetchReports(supabase, cutoff, null, userId),
    fetchHeroSummary(supabase, cutoff),
    fetchBeachCircles(supabase, userId),
    getCurrentProfile(),
  ]);

  const displayName =
    profile?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    DEFAULT_DISPLAY_NAME;
  const avatarUrl =
    profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const firstName = firstNameOf(displayName);

  return (
    <div className="flex flex-col gap-5">
      <FeedHeader
        greeting={greetingFor()}
        firstName={firstName}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
      <Suspense fallback={null}>
        <PostedNotice />
      </Suspense>
      <HeroSummary summary={summary} />
      <BeachCircleRow beaches={beaches} />
      <ReportList
        initialReports={reports}
        currentUserId={userId}
        currentUserName={displayName}
        currentUserAvatar={avatarUrl}
        heading={
          <>
            <p className="eyebrow eyebrow-coral">חופי ישראל · עכשיו</p>
            <h2 className="text-title heading-tight font-display font-normal text-ink">דיווחים אחרונים</h2>
            <p className="mt-1 text-caption text-muted-text">דיווחים נעלמים אחרי {REPORT_TTL_HOURS} שעות ⏳</p>
          </>
        }
      />
    </div>
  );
}
