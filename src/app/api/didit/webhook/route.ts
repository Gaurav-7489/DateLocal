import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

function shortenFloats(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(shortenFloats);
  if (data !== null && typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      out[key] = shortenFloats(value);
    }
    return out;
  }
  if (typeof data === "number" && Number.isInteger(data)) return data;
  return data;
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

function canonicalize(body: unknown): string {
  return JSON.stringify(sortKeys(shortenFloats(body)));
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function timestampIsFresh(timestampHeader: string): boolean {
  const timestamp = Number.parseInt(timestampHeader, 10);
  return Number.isFinite(timestamp) && Math.abs(Math.floor(Date.now() / 1000) - timestamp) <= 300;
}

function verifySignatureV2(body: unknown, signature: string, timestamp: string, secret: string): boolean {
  if (!timestampIsFresh(timestamp)) return false;
  const canonical = canonicalize(body);
  const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  return timingSafeEqual(expected, signature);
}

function verifySignatureRaw(rawBody: string, signature: string, timestamp: string, secret: string): boolean {
  if (!timestampIsFresh(timestamp)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(expected, signature);
}

function verifySignatureSimple(
  body: Record<string, unknown>,
  signature: string,
  timestamp: string,
  secret: string,
): boolean {
  if (!timestampIsFresh(timestamp)) return false;
  const canonical = [
    String(body.timestamp ?? ""),
    String(body.session_id ?? ""),
    String(body.status ?? ""),
    String(body.webhook_type ?? ""),
  ].join(":");
  const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  return timingSafeEqual(expected, signature);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("DIDIT_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureV2 = request.headers.get("x-signature-v2");
  const signatureRaw = request.headers.get("x-signature");
  const signatureSimple = request.headers.get("x-signature-simple");
  const timestampHeader = request.headers.get("x-timestamp");

  if (!timestampHeader) {
    return NextResponse.json({ error: "Missing X-Timestamp header." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // Didit recommends V2 first, then raw-body X-Signature, then Simple as a fallback.
  const verified =
    (signatureV2 && verifySignatureV2(body, signatureV2, timestampHeader, webhookSecret)) ||
    (signatureRaw && verifySignatureRaw(rawBody, signatureRaw, timestampHeader, webhookSecret)) ||
    (signatureSimple && verifySignatureSimple(body as Record<string, unknown>, signatureSimple, timestampHeader, webhookSecret));

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = body as Record<string, unknown>;
  const webhookType = String(event.webhook_type ?? "");

  if (webhookType === "status.updated" || webhookType === "data.updated") {
    const sessionId = String(event.session_id ?? "");
    const status = String(event.status ?? "");

    if (sessionId) {
      handleVerificationStatusUpdate({
        diditSessionId: sessionId,
        diditStatus: status,
      }).catch((err) => console.error("Didit webhook processing error:", err));
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleVerificationStatusUpdate(params: {
  diditSessionId: string;
  diditStatus: string;
}) {
  const { diditSessionId, diditStatus } = params;

  let status: string;
  switch (diditStatus) {
    case "Approved":
      status = "verified";
      break;
    case "Declined":
      status = "rejected";
      break;
    default:
      status = "pending";
  }

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("face_verifications")
    .select("status")
    .eq("didit_session_id", diditSessionId)
    .maybeSingle();

  if (existing?.status === status) return;

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "verified") {
    updatePayload.verified_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("face_verifications")
    .update(updatePayload)
    .eq("didit_session_id", diditSessionId);

  if (error) console.error("Failed to update face_verifications from webhook:", error);
}
