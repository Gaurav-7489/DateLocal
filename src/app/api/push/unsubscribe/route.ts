import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { endpoint?: unknown } = {};
  try {
    body = await request.json();
  } catch {}

  if (typeof body.endpoint !== "string" || body.endpoint.length === 0) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint);

  if (error) {
    console.error("[DateBu] Removing push subscription failed", error);
    return NextResponse.json({ error: "Couldn't disable notifications." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
