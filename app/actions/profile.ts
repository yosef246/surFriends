"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, getSupabase } from "@/lib/auth";
import { isBeachId, validateProfileInput, type ProfileInput } from "@/lib/profile";
import type { ActionResult } from "@/lib/reports";

const SESSION_EXPIRED = "רעננו את הדף ונסו שוב";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };

  const v = validateProfileInput(input);
  if (!v.ok) return { error: v.error, rejected: true };

  const supabase = await getSupabase();
  // Only these three columns, only the session user's row (RLS + the column grant enforce it too).
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: v.value.display_name, skill_level: v.value.skill_level, bio: v.value.bio, name_chosen: true })
    .eq("id", user.id)
    .select("id");
  if (error) {
    if (error.code === "23514") return { error: "הפרטים לא תקינים. בדקו ונסו שוב", rejected: true };
    return { error: "השמירה נכשלה, נסו שוב" };
  }
  if (!data || data.length === 0) return { error: "הפרופיל לא נמצא" };

  revalidatePath("/profile");
  revalidatePath("/profile/[id]", "page");
  revalidatePath("/");
  return { ok: true };
}

export type FavoriteResult = { ok: true; isFavorite: boolean } | { error: string };

/** `on` = the wanted end state (idempotent, safe for double taps); omitted = flip the current state. */
export async function toggleFavoriteBeach(beachId: number, on?: boolean): Promise<FavoriteResult> {
  if (!isBeachId(beachId)) return { error: "החוף לא נמצא" };
  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };
  const supabase = await getSupabase();

  const { data: beach } = await supabase.from("beaches").select("id").eq("id", beachId).maybeSingle();
  if (!beach) return { error: "החוף לא נמצא" };

  let want = on;
  if (typeof want !== "boolean") {
    const { data: existing } = await supabase
      .from("user_favorites")
      .select("beach_id")
      .eq("user_id", user.id)
      .eq("beach_id", beachId)
      .maybeSingle();
    want = !existing;
  }

  if (want) {
    const { error } = await supabase.from("user_favorites").insert({ user_id: user.id, beach_id: beachId });
    // 23505 = already a favorite: the wanted state holds.
    if (error && error.code !== "23505") return { error: "לא הצלחנו לעדכן. נסו שוב" };
  } else {
    const { error } = await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("beach_id", beachId);
    if (error) return { error: "לא הצלחנו לעדכן. נסו שוב" };
  }

  revalidatePath("/");
  revalidatePath(`/beach/${beachId}`);
  revalidatePath("/profile");
  return { ok: true, isFavorite: want };
}
