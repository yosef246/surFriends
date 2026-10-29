import { Suspense } from "react";
import { BeachCircleRow } from "@/components/feed/BeachCircleRow";
import { HeroSummary } from "@/components/feed/HeroSummary";
import { PostedNotice } from "@/components/feed/PostedNotice";
import { ReportList } from "@/components/feed/ReportList";
import { FeedHeader, greetingFor } from "@/components/layout/FeedHeader";
import { fetchBeachCircles, fetchHeroSummary, fetchReports } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  const [reports, summary, beaches, profile] = await Promise.all([
    fetchReports(supabase),
    fetchHeroSummary(supabase),
    fetchBeachCircles(supabase, userId),
    supabase.from("profiles").select("display_name, avatar_url").eq("id", userId).maybeSingle(),
  ]);

  const displayName =
    profile.data?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "משתמש";
  const avatarUrl =
    profile.data?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;
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
      <div>
        <p className="eyebrow">מהחופים</p>
        <h2 className="text-heading heading-tight font-medium text-ink">דיווחים אחרונים</h2>
      </div>
      <ReportList initialReports={reports} />
    </div>
  );
}
