import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) {
    return NextResponse.json({ error: "Push service is not configured." }, { status: 503 });
  }

  const response = await fetch(`${baseUrl}/functions/v1/datebu-push/vapid-public-key`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[DateBu] VAPID public key request failed", response.status);
    return NextResponse.json({ error: "Push service unavailable." }, { status: 503 });
  }

  return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
}
