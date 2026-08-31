import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized session. Please log in again." },
        { status: 401 },
      );
    }

    const { data: record } = await supabase
      .from("face_verifications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    const status = record?.status ?? "pending";

    return NextResponse.json({ status });
  } catch {
    return NextResponse.json(
      { error: "Failed to load verification status." },
      { status: 500 },
    );
  }
}
