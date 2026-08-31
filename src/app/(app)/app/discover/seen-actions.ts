"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

export async function markProfileSeen(profileId: string) {
  if (!isUuid(profileId)) return;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id === profileId) return;

  const { error } = await supabase.from("discover_views").upsert(
    {
      user_id: user.id,
      profile_id: profileId,
    },
    {
      onConflict: "user_id,profile_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    console.error("Failed to record Discover view:", error);
  }
}
