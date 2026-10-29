import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReportList } from "@/components/feed/ReportList";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { getCurrentProfile, getCurrentUser, getSupabase } from "@/lib/auth";
import { fetchReports } from "@/lib/feed";
import { getProfileById } from "@/lib/profile-data";
import { REPORT_TTL_HOURS, isUuid, reportCutoffIso } from "@/lib/reports";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const profile = await getProfileById((await params).id);
  return { title: profile ? `${profile.display_name} | surFriends` : "פרופיל | surFriends" };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (id.toLowerCase() === user.id.toLowerCase()) redirect("/profile");

  if (!isUuid(id)) notFound();

  const supabase = await getSupabase();
  const [profile, reports, me] = await Promise.all([
    getProfileById(id),
    fetchReports(supabase, reportCutoffIso(), null, user.id, null, id),
    getCurrentProfile(),
  ]);
  if (!profile) notFound();
  const myName = me?.display_name ?? (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "משתמש";
  const myAvatar = me?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;

  // Favorites are private (RLS): intentionally not shown here.
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader profile={profile} />
      <ReportList
        initialReports={reports}
        currentUserId={user.id}
        currentUserName={myName}
        currentUserAvatar={myAvatar}
        authorId={profile.id}
        heading={
          <>
            <p className="eyebrow eyebrow-coral">דיווחים</p>
            <h2 className="text-title heading-tight font-display font-normal text-ink">
              הדיווחים מה-{REPORT_TTL_HOURS} השעות האחרונות
            </h2>
          </>
        }
        emptyState={<EmptyState title={`אין דיווחים מ${profile.display_name} ב-${REPORT_TTL_HOURS} השעות האחרונות`} />}
      />
    </div>
  );
}
