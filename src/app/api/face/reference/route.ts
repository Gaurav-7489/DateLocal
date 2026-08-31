import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfilePhotoUrl } from "@/lib/profile-photo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: photo, error } = await supabase
      .from("profile_photos")
      .select("storage_path")
      .eq("profile_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (error) {
      console.error("Face reference lookup failed:", error);
      return NextResponse.json(
        { error: "Could not load your profile photo." },
        { status: 500 },
      );
    }

    const url = getProfilePhotoUrl(photo?.storage_path, 640);

    if (!url) {
      return NextResponse.json(
        { error: "Add a clear primary profile photo before verification." },
        { status: 400 },
      );
    }

    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Face reference endpoint failed:", error);
    return NextResponse.json(
      { error: "Unable to load face verification." },
      { status: 500 },
    );
  }
}
