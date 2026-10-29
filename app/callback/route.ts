import { NextResponse } from "next/server";
import { safeErrorCode, safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth return for Google: linkIdentity (from the profile) and signInWithOAuth ("switch to that account").
 * Exchanges the PKCE code for a session, then redirects to a SAFE relative `next` (default /profile).
 * Failures go to /profile?link_error=<code> (the profile page explains identity_already_exists).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"), "/profile");
  const fail = (code: string) =>
    NextResponse.redirect(`${origin}/profile?link_error=${encodeURIComponent(safeErrorCode(code, "unknown"))}`);

  // Supabase reports provider/linking failures on the redirect URL itself.
  const providerError = searchParams.get("error_code") ?? searchParams.get("error");
  if (providerError) return fail(providerError);

  const code = searchParams.get("code");
  if (!code) return fail("missing_code");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.code ?? "exchange_failed");

  return NextResponse.redirect(`${origin}${next}`);
}
