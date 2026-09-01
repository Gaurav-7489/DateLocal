import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function validSubscription(value: unknown): value is {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return (
    typeof candidate.endpoint === "string" &&
    candidate.endpoint.length > 0 &&
    candidate.endpoint.length <= 2048 &&
    typeof candidate.keys?.p256dh === "string" &&
    typeof candidate.keys?.auth === "string"
  );
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!validSubscription(body)) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const subscription = body;
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: request.headers.get("user-agent"),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[DateBu] Saving push subscription failed", error);
    return NextResponse.json({ error: "Couldn't save notification subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
