"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { routes } from "@/config/routes";

export async function publishNews(formData: FormData) {
  try {
    const admin = await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const category = ((formData.get("category") as string) || "general").trim();
    const isPinned = formData.get("isPinned") === "true" || formData.get("isPinned") === "on";

    if (!title || !content) {
      return { error: "Title and content are required." };
    }

    const { error } = await supabase.from("news").insert({
      title,
      content,
      category,
      is_pinned: isPinned,
      author_id: admin.id,
    });

    if (error) {
      return { error: `Unable to publish news: ${error.message}` };
    }

    revalidatePath(routes.news);
    revalidatePath(routes.admin.root);

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to publish announcement.",
    };
  }
}