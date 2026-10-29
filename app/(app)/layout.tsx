import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { TopBar } from "@/components/layout/TopBar";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) redirect("/login");

  const displayName =
    profile?.display_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "משתמש";
  const avatarUrl =
    profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div className="min-h-dvh">
      <TopBar displayName={displayName} avatarUrl={avatarUrl} />
      <OfflineBanner />
      <main className="motion-page mx-auto w-full max-w-feed px-4 pt-2 pb-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+5rem)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
