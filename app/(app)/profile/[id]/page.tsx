import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReportList } from "@/components/feed/ReportList";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { getCurrentProfile, getCurrentUser, getSupabase } from "@/lib/auth";
import { countActiveReports, fetchReports } from "@/lib/feed";
import { DEFAULT_DISPLAY_NAME } from "@/lib/profile";
import { getProfileById } from "@/lib/profile-data";
import { REPORT_TTL_HOURS, isUuid, reportCutoffIso } from "@/lib/reports";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const profile = await getProfileById((await params).id);
  return { title: profile ? `${profile.display_name} | surFriends` : "פרופיל | surFriends" };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user && id.toLowerCase() === user.id.toLowerCase()) redirect("/profile");

  if (!isUuid(id)) notFound();

  const supabase = await getSupabase();
  const cutoff = reportCutoffIso();
  const [profile, reports, me, reportCount] = await Promise.all([
    getProfileById(id),
    fetchReports(supabase, cutoff, null, user?.id ?? "", null, id),
    getCurrentProfile(),
    countActiveReports(supabase, cutoff, id),
  ]);
  if (!profile) notFound();
  const myName = me?.display_name ?? (user?.user_metadata?.full_name as string | undefined) ?? DEFAULT_DISPLAY_NAME;
  const myAvatar = me?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  // Favorites are private (RLS): intentionally not shown here.
  return (
    <div className="flex flex-col gap-6">
      <ProfileHero profile={profile} reportCount={reportCount} />
      <ReportList
        initialReports={reports}
        currentUserId={user?.id ?? ""}
        currentUserName={myName}
        currentUserAvatar={myAvatar}
        authorId={profile.id}
        heading={
          <>
            <h2 className="section-title">דיווחים</h2>
            <p className="text-label text-muted-text">מה-{REPORT_TTL_HOURS} השעות האחרונות</p>
          </>
        }
        emptyState={<EmptyState title={`אין דיווחים מ${profile.display_name} ב-${REPORT_TTL_HOURS} השעות האחרונות`} />}
      />
    </div>
  );
}
