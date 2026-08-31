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

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: photo, error } = await supabase
      .from("profile_photos")
      .select("storage_path")
      .eq("profile_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (error || !photo?.storage_path) {
      return new NextResponse("Primary profile photo not found", { status: 404 });
    }

    const sourceUrl = getProfilePhotoUrl(photo.storage_path, 640);
    if (!sourceUrl) return new NextResponse("Profile photo unavailable", { status: 404 });

    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok || !response.body) {
      return new NextResponse("Profile photo unavailable", { status: 502 });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Face reference image failed:", error);
    return new NextResponse("Unable to load profile photo", { status: 500 });
  }
}
