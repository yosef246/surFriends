import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { isAllowedPushEndpoint, validateSubscription } from "@/lib/push";
import { saveSubscription } from "@/lib/push-send";

export const dynamic = "force-dynamic";

/** Called by the service worker on `pushsubscriptionchange`. Session cookie auth (not public in the middleware). */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { subscription?: unknown; oldEndpoint?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const v = validateSubscription(body.subscription);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  try {
    const err = await saveSubscription(user.id, v.value, request.headers.get("user-agent"));
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    if (isAllowedPushEndpoint(body.oldEndpoint) && body.oldEndpoint !== v.value.endpoint) {
      const supabase = await getSupabase();
      await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", body.oldEndpoint);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
