import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import DiscoverClient from "./discover-client";

export const metadata: Metadata = {
  title: "Discover",
};

export default async function DiscoverPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      date_of_birth,
      gender,
      department,
      academic_year,
      bio,
      profile_photos (
        storage_path,
        display_order,
        is_primary
      ),
      profile_interests (
        interests (
          id,
          name
        )
      )
    `)
    .eq("profile_completed", true)
    .neq("id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load discover profiles:", error);

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load profiles right now. Please try again.
        </p>
      </div>
    );
  }

  return <DiscoverClient profiles={profiles ?? []} />;
}