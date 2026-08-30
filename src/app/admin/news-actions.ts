"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/config/routes";

export async function publishNews(formData: FormData) {
  const admin = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) throw new Error("A headline and announcement body are required.");
  const { error } = await createAdminClient().from("news_posts").insert({ title, body, created_by: admin.id });
  if (error) throw new Error(`Unable to publish news: ${error.message}`);
  revalidatePath(routes.news);
  revalidatePath(routes.admin.root);
}
