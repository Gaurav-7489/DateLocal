import { createClient } from "supabase";
import { sendPushNotification } from "web-push-send";
import { generateVapidKeys } from "web-push-vapid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getJwtRole(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

async function getOrCreateVapidKeys() {
  const { data: existing, error: readError } = await admin
    .from("push_vapid_keys")
    .select("public_key, private_key")
    .eq("id", true)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const keys = await generateVapidKeys();
  const { error: insertError } = await admin.from("push_vapid_keys").insert({
    id: true,
    public_key: keys.publicKey,
    private_key: keys.privateKey,
  });

  if (insertError) {
    const { data: raced } = await admin
      .from("push_vapid_keys")
      .select("public_key, private_key")
      .eq("id", true)
      .maybeSingle();
    if (raced) return raced;
    throw insertError;
  }

  return { public_key: keys.publicKey, private_key: keys.privateKey };
}

async function sendToUser(userId: string, payload: Record<string, unknown>) {
  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) throw error;
  if (!subscriptions?.length) return { delivered: 0, removed: 0, failed: 0 };

  const vapid = await getOrCreateVapidKeys();
  let delivered = 0;
  let removed = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        {
          publicKey: vapid.public_key,
          privateKey: vapid.private_key,
          subject: "mailto:hello@datebu.app",
        },
      );
      delivered += 1;
    } catch (error) {
      const status = Number((error as { statusCode?: number })?.statusCode ?? 0);
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", subscription.id);
        removed += 1;
      } else {
        failed += 1;
        console.error("[datebu-push] send failed", status, error);
      }
    }
  }

  return { delivered, removed, failed };
}

export default {
  async fetch(req: Request) {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
      const url = new URL(req.url);

      if (req.method === "GET" && url.pathname.endsWith("/vapid-public-key")) {
        const keys = await getOrCreateVapidKeys();
        return json({ publicKey: keys.public_key });
      }

      if (req.method === "POST" && url.pathname.endsWith("/send")) {
        if (getJwtRole(req) !== "service_role") return json({ error: "Forbidden" }, 403);

        const body = await req.json();
        const userId = typeof body.userId === "string" ? body.userId : "";
        if (!userId) return json({ error: "Missing userId" }, 400);

        const payload = {
          title: String(body.title ?? "DateBu"),
          body: String(body.body ?? "You have a new update."),
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: typeof body.tag === "string" ? body.tag : undefined,
          data: { url: typeof body.url === "string" ? body.url : "/app" },
        };

        const result = await sendToUser(userId, payload);
        return json(result);
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      console.error("[datebu-push] request failed", error);
      return json({ error: "Push service failed" }, 500);
    }
  },
};
