import { redirect } from "next/navigation";
import { Waves } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next";
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-8 px-6 py-10 text-foreground">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Waves className="size-8" aria-hidden />
        </span>
        <h1 className="text-display font-bold text-sea-deep">surFriends</h1>
        <p className="text-body text-mist-text">קהילת הגולשים של ישראל</p>
      </div>
      <LoginButton next={target} hasError={Boolean(error)} />
      <p className="text-caption text-mist-text">בהמשך אתם מסכימים לתנאים</p>
    </main>
  );
}
