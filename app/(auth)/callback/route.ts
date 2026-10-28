import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();

  let cookieNext = "";
  try {
    cookieNext = decodeURIComponent(cookieStore.get("sf_next")?.value ?? "");
  } catch {
    cookieNext = "";
  }
  const next = safeNextPath(searchParams.get("next") ?? cookieNext);

  if (code && !searchParams.get("error")) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(`${origin}${next}`);
      res.cookies.delete("sf_next");
      return res;
    }
  }

  const res = NextResponse.redirect(`${origin}/login?error=auth_failed`);
  res.cookies.delete("sf_next");
  return res;
}
