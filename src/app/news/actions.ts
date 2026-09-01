"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export async function submitFeedback(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in before sending feedback." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Please write some feedback first." };
  if (message.length > 2000) return { error: "Feedback must be 2000 characters or less." };

  const email = user.email ?? "";
  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    email,
    message,
  });

  if (error) {
    console.error("Feedback submission failed:", error);
    return { error: "Couldn't send feedback right now. Please try again." };
  }

  revalidatePath(routes.news);
  return { success: true };
}
