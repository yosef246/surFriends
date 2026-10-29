import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { NotificationsCard } from "@/components/settings/NotificationsCard";
import { ProfileEditForm } from "@/components/settings/ProfileEditForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { fetchFavoriteBeaches, getProfileById } from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import pkg from "../../../package.json";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "הגדרות | surFriends" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await getSupabase();
  const [profile, favorites, { data: pushRow }] = await Promise.all([
    getProfileById(user.id),
    fetchFavoriteBeaches(user.id),
    supabase.from("profiles").select("push_enabled").eq("id", user.id).maybeSingle(),
  ]);

  const initial = {
    display_name:
      profile?.display_name ?? (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "",
    skill_level: profile?.skill_level ?? null,
    bio: profile?.bio ?? null,
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <Link
          href="/profile"
          aria-label="חזרה לפרופיל"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "-ms-2 size-touch shrink-0")}
        >
          <ArrowRight aria-hidden />
        </Link>
        <h1 className="text-title heading-tight font-display font-normal text-ink">הגדרות</h1>
      </header>

      <section aria-labelledby="edit-heading" className="glass-card flex flex-col gap-4 rounded-card p-5">
        <h2 id="edit-heading" className="text-heading heading-tight font-display font-normal text-ink">
          הפרופיל שלי
        </h2>
        <ProfileEditForm initial={initial} />
      </section>

      <NotificationsCard accountEnabled={pushRow?.push_enabled ?? true} favorites={favorites} />

      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          <LogOut aria-hidden />
          התנתקות
        </Button>
      </form>

      <p className="text-center text-caption text-muted-text">
        <span dir="ltr">surFriends v{pkg.version}</span>
      </p>
    </div>
  );
}
