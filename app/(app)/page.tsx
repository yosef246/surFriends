import { Suspense } from "react";
import { BeachSlider } from "@/components/feed/BeachSlider";
import { FeedGreeting, greetingFor } from "@/components/feed/FeedGreeting";
import { HeroSummary } from "@/components/feed/HeroSummary";
import { PostedNotice } from "@/components/feed/PostedNotice";
import { ReportList } from "@/components/feed/ReportList";
import { fetchBeachCircles, fetchHeroSummary, fetchReports } from "@/lib/feed";
import { DEFAULT_DISPLAY_NAME, firstNameOf } from "@/lib/profile";
import { reportCutoffIso } from "@/lib/reports";
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
    <div className="flex flex-col gap-6">
      <FeedGreeting greeting={greetingFor()} firstName={firstName} />
      <Suspense fallback={null}>
        <PostedNotice />
      </Suspense>
      <HeroSummary summary={summary} />
      <BeachSlider beaches={beaches} />
      <ReportList
        initialReports={reports}
        currentUserId={userId}
        currentUserName={displayName}
        currentUserAvatar={avatarUrl}
        heading={<h2 className="section-title">דיווחים אחרונים</h2>}
      />
    </div>
  );
}
