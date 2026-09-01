import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

    const body = await request.json();
    const shopOrderId = String(body.shopOrderId || "");
    const paymentId = String(body.razorpay_payment_id || "");
    const signature = String(body.razorpay_signature || "");
    if (!shopOrderId || !paymentId || !signature) return NextResponse.json({ error: "Incomplete payment response." }, { status: 400 });

    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin.from("shop_orders").select("id,user_id,razorpay_order_id,status").eq("id", shopOrderId).maybeSingle();
    if (orderError || !order || order.user_id !== user.id || !order.razorpay_order_id) return NextResponse.json({ error: "Payment order not found." }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ success: true, alreadyFulfilled: true });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!secret || !keyId) return NextResponse.json({ error: "Payment gateway is not configured." }, { status: 503 });
    if (!verifySignature(order.razorpay_order_id, paymentId, signature, secret)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

    const auth = Buffer.from(`${keyId}:${secret}`).toString("base64");
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!paymentResponse.ok) return NextResponse.json({ error: "We couldn't confirm the payment yet. Please try again in a moment." }, { status: 409 });
    const payment = await paymentResponse.json() as { order_id?: string; status?: string };
    if (payment.order_id !== order.razorpay_order_id || payment.status !== "captured") return NextResponse.json({ error: "Payment is not captured yet." }, { status: 409 });

    await admin.from("shop_orders").update({ razorpay_payment_id: paymentId, updated_at: new Date().toISOString() }).eq("id", shopOrderId);
    const { error: fulfillError } = await admin.rpc("fulfill_shop_order", { p_order_id: shopOrderId });
    if (fulfillError) {
      console.error("Shop fulfillment failed:", fulfillError);
      return NextResponse.json({ error: "Payment was verified, but the item is still being delivered. Please refresh shortly." }, { status: 202 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shop payment verification failed:", error);
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
