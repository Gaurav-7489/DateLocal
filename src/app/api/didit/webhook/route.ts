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
  if (typeof data === "number" && Number.isInteger(data)) {
    return data;
  }
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
  const shortened = shortenFloats(body);
  const sorted = sortKeys(shortened);
  return JSON.stringify(sorted);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA.readUInt8(i) ^ bufB.readUInt8(i);
  }
  return result === 0;
}

function verifySignatureV2(
  body: unknown,
  signatureHeader: string,
  timestampHeader: string,
  secret: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number.parseInt(timestampHeader, 10)) > 300) {
    return false;
  }
  const canonical = canonicalize(body);
  const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  return timingSafeEqual(expected, signatureHeader);
}

function verifySignatureSimple(
  body: Record<string, unknown>,
  signatureHeader: string,
  timestampHeader: string,
  secret: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number.parseInt(timestampHeader, 10)) > 300) {
    return false;
  }
  const canonical = [
    String(body.timestamp ?? ""),
    String(body.session_id ?? ""),
    String(body.status ?? ""),
    String(body.webhook_type ?? ""),
  ].join(":");
  const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  return timingSafeEqual(expected, signatureHeader);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("DIDIT_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signatureV2 = request.headers.get("x-signature-v2");
  const signatureSimple = request.headers.get("x-signature-simple");
  const timestampHeader = request.headers.get("x-timestamp");

  if (!timestampHeader) {
    return NextResponse.json({ error: "Missing X-Timestamp header." }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  let verified = false;
  if (signatureV2 && verifySignatureV2(body, signatureV2, timestampHeader, webhookSecret)) {
    verified = true;
  } else if (
    signatureSimple &&
    verifySignatureSimple(body as Record<string, unknown>, signatureSimple, timestampHeader, webhookSecret)
  ) {
    verified = true;
  }

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // Dispatch asynchronously; return 200 quickly.
  const event = body as Record<string, unknown>;
  const webhookType = String(event.webhook_type ?? "");

  if (webhookType === "status.updated" || webhookType === "data.updated") {
    const sessionId = String(event.session_id ?? "");
    const vendorData = String(event.vendor_data ?? "");
    const status = String(event.status ?? "");

    if (!sessionId || !vendorData) {
      return NextResponse.json({ ok: true });
    }

    handleVerificationStatusUpdate({
      diditSessionId: sessionId,
      diditStatus: status,
    }).catch((err) => {
      console.error("Didit webhook processing error:", err);
    });
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
    .select("status, didit_session_id")
    .eq("didit_session_id", diditSessionId)
    .maybeSingle();

  if (existing?.status === status) {
    return;
  }

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

  if (error) {
    console.error("Failed to update face_verifications from webhook:", error);
  }
}
