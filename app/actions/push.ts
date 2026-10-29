"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { isAllowedPushEndpoint, validateSubscription } from "@/lib/push";
import { saveSubscription, sendTestPush } from "@/lib/push-send";
import type { ActionResult } from "@/lib/reports";

const SESSION_EXPIRED = "רעננו את הדף ונסו שוב";
const GENERIC = "לא הצלחנו להפעיל התראות. נסו שוב";

/**
 * Registers this device for the session user. Upsert by endpoint with the admin client: if the same browser
 * endpoint was registered by another account (shared device), it moves to the current user. Ownership always
 * comes from the session, never from the client.
 */
export async function subscribeToPush(subscriptionJSON: unknown, userAgent?: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };
  const v = validateSubscription(subscriptionJSON);
  if (!v.ok) return { error: v.error, rejected: true };

  try {
    const err = await saveSubscription(user.id, v.value, typeof userAgent === "string" ? userAgent : null);
    if (err) return { error: err };

    // Subscribing is an explicit opt-in: make sure the account-wide switch is on too.
    const supabase = await getSupabase();
    await supabase.from("profiles").update({ push_enabled: true }).eq("id", user.id);
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { error: GENERIC };
  }
}

/** Removes this device's subscription (own rows only, enforced by the filter and by RLS). */
export async function unsubscribeFromPush(endpoint: string): Promise<ActionResult> {
  if (!isAllowedPushEndpoint(endpoint)) return { error: "כתובת ההתראות לא תקינה", rejected: true };
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };
  const supabase = await getSupabase();
  const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  if (error) return { error: "הכיבוי נכשל, נסו שוב" };
  return { ok: true };
}

/** Account-wide pause / resume (all devices). Favorites still decide which beaches. */
export async function setPushEnabled(enabled: boolean): Promise<ActionResult> {
  if (typeof enabled !== "boolean") return { error: "בקשה לא תקינה", rejected: true };
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("profiles").update({ push_enabled: enabled }).eq("id", user.id).select("id");
  if (error || !data || data.length === 0) return { error: "השמירה נכשלה, נסו שוב" };
  revalidatePath("/settings");
  return { ok: true };
}

export type TestPushResult = { ok: true; sent: number } | { error: string };

export async function sendTestPushAction(): Promise<TestPushResult> {
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };
  const res = await sendTestPush(user.id);
  if (res.rateLimited) return { error: "אפשר לשלוח התראת בדיקה פעם בדקה. נסו שוב בעוד רגע" };
  if (res.skipped === "no-subscriptions") return { error: "אין מכשיר רשום להתראות. הפעילו התראות קודם" };
  if (res.skipped) return { error: "שליחת ההתראה נכשלה, נסו שוב" };
  if (res.sent === 0) return { error: "ההתראה לא נשלחה. נסו לכבות ולהפעיל התראות מחדש" };
  return { ok: true, sent: res.sent };
}
