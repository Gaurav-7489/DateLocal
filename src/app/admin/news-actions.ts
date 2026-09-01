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

    if (!title || !content) return { error: "Title and content are required." };
    if (title.length > 160) return { error: "Title must be 160 characters or less." };
    if (content.length > 5000) return { error: "Content must be 5000 characters or less." };

    // The public news page reads news_posts. Keep admin publishing on that
    // same source of truth so announcements actually appear to students.
    const { error } = await supabase.from("news_posts").insert({
      title,
      body: content,
      created_by: admin.id,
    });

    if (error) return { error: `Unable to publish news: ${error.message}` };

    revalidatePath(routes.news);
    revalidatePath(routes.admin.root);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to publish announcement." };
  }
}
