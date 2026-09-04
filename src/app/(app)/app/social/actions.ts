"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";

export async function requestSocialConnection(targetId: string) {
  if (!isUuid(targetId)) return { error: "Invalid profile." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in first." };
  if (user.id === targetId) return { error: "You cannot connect with yourself." };

  const { data: existing } = await supabase
    .from("extrovert_connections")
    .select("id,status")
    .or(`and(requester_id.eq.${user.id},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${user.id})`)
    .maybeSingle();

  if (existing?.status === "accepted") return { error: "Already connected." };
  if (existing?.status === "pending") return { error: "Request already sent." };
  if (existing) {
    const { error } = await supabase.from("extrovert_connections").update({ requester_id: user.id, target_id: targetId, status: "pending" }).eq("id", existing.id);
    if (error) return { error: "Could not send connection request." };
  } else {
    const { error } = await supabase.from("extrovert_connections").insert({ requester_id: user.id, target_id: targetId, status: "pending" });
    if (error) return { error: "Could not send connection request." };
  }
  revalidatePath(routes.social);
  return { error: null, success: true };
}

export async function acceptSocialConnection(connectionId: string) {
  if (!isUuid(connectionId)) return { error: "Invalid connection." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in first." };
  const { error } = await supabase.from("extrovert_connections").update({ status: "accepted" }).eq("id", connectionId).eq("target_id", user.id).eq("status", "pending");
  if (error) return { error: "Could not accept connection." };
  revalidatePath(routes.social);
  revalidatePath(routes.messages);
  return { error: null, success: true };
}
