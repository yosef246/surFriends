import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { TopBar } from "@/components/layout/TopBar";
import { DEFAULT_DISPLAY_NAME } from "@/lib/profile";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  const displayName =
    profile?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    DEFAULT_DISPLAY_NAME;
  const avatarUrl =
    profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div className="min-h-dvh">
      <TopBar displayName={displayName} avatarUrl={avatarUrl} />
      <OfflineBanner />
      <main className="motion-page mx-auto w-full max-w-feed px-4 pt-2 pb-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+5rem)]">
        {children}
        <p className="mt-8 text-center text-caption text-muted-text">
          <Link href="/credits" className="inline-flex min-h-touch items-center underline underline-offset-4">
            קרדיט לתמונות החופים
          </Link>
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
