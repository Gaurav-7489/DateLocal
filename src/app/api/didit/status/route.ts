import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DIDIT_API_BASE = "https://verification.didit.me";

async function getDiditDecision(sessionId: string) {
  const apiKey = process.env.DIDIT_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `${DIDIT_API_BASE}/v3/session/${encodeURIComponent(sessionId)}/decision/`,
    {
      method: "GET",
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    },
  );

  if (!response.ok) return null;

  return (await response.json()) as { status?: string };
}

function mapDiditStatus(status: string | undefined) {
  switch (status) {
    case "Approved":
      return "verified" as const;
    case "Declined":
      return "rejected" as const;
    default:
      return "pending" as const;
  }
}

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

    const { data: record, error: recordError } = await supabase
      .from("face_verifications")
      .select("status, didit_session_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (recordError) {
      return NextResponse.json(
        { error: "Failed to load verification status." },
        { status: 500 },
      );
    }

    let status = record?.status ?? "pending";

    // Webhooks are the primary source of truth. Poll Didit as a fallback so a
    // delayed/missed webhook cannot leave the user stuck on "pending".
    if (status === "pending" && record?.didit_session_id) {
      const decision = await getDiditDecision(record.didit_session_id);
      const diditStatus = mapDiditStatus(decision?.status);

      if (decision?.status && diditStatus !== "pending") {
        status = diditStatus;

        await supabase
          .from("face_verifications")
          .update({
            status,
            verified_at:
              status === "verified"
                ? new Date().toISOString()
                : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({ status });
  } catch {
    return NextResponse.json(
      { error: "Failed to load verification status." },
      { status: 500 },
    );
  }
}
