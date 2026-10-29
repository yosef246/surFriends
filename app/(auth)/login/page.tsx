import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Mascot } from "@/components/mascot";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next";
import { isInAppBrowser } from "@/lib/in-app-browser";
import { InAppBrowserNotice } from "@/components/auth/InAppBrowserNotice";
import { LoginButton } from "./login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNextPath(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(target);

  const inApp = isInAppBrowser((await headers()).get("user-agent"));

  return (
    <div className="min-h-dvh bg-foam">
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-8 px-6 py-10 text-foreground">
      <div className="flex flex-col items-center gap-3 text-center">
        <Mascot.Wave size={180} className="animate-mascot-bob" />
        <h1 className="text-display font-medium text-ink">surFriends</h1>
        <p className="text-body text-muted-text">קהילת הגולשים של ישראל</p>
      </div>
      <div className="flex w-full flex-col gap-4">
        {inApp ? <InAppBrowserNotice /> : null}
        <LoginButton next={target} hasError={Boolean(error)} />
      </div>
      <p className="text-caption text-muted-text">בהמשך אתם מסכימים לתנאים</p>
    </main>
    </div>
  );
}
