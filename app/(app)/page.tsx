import { Suspense } from "react";
import { BeachCircleRow } from "@/components/feed/BeachCircleRow";
import { HeroSummary } from "@/components/feed/HeroSummary";
import { PostedNotice } from "@/components/feed/PostedNotice";
import { ReportList } from "@/components/feed/ReportList";
import { FeedHeader, greetingFor } from "@/components/layout/FeedHeader";
import { fetchBeachCircles, fetchHeroSummary, fetchReports } from "@/lib/feed";
import { REPORT_TTL_HOURS, reportCutoffIso } from "@/lib/reports";
import { getCurrentProfile, getCurrentUser, getSupabase } from "@/lib/auth";

export default async function FeedPage() {
  const supabase = await getSupabase();
  const user = await getCurrentUser();
  const userId = user?.id ?? "";

  const cutoff = reportCutoffIso();
  const [reports, summary, beaches, profile] = await Promise.all([
    fetchReports(supabase, cutoff),
    fetchHeroSummary(supabase, cutoff),
    fetchBeachCircles(supabase, userId),
    getCurrentProfile(),
  ]);

  const displayName =
    profile?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "משתמש";
  const avatarUrl =
    profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const firstName = displayName.trim().split(/\s+/)[0] ?? "";

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
