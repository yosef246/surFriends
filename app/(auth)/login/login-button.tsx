"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback`,
      },
    });
  }

  return (
    <Button type="button" size="lg" onClick={signIn}>
      התחברות עם Google
    </Button>
  );
}
