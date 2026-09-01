import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient, } from "@/lib/supabase/admin";
import { createRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay/server";
import { getShopProduct, type ShopProduct } from "@/lib/shop";
import { isUuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const product = String(body.product) as ShopProduct;
    const config = getShopProduct(product);
    if (!config) return NextResponse.json({ error: "Unknown shop product." }, { status: 400 });

    const targetUserId = body.targetUserId ? String(body.targetUserId) : null;
    const content = body.content ? String(body.content).trim() : "";

    if (product === "superchat") {
      if (!targetUserId || !isUuid(targetUserId) || targetUserId === user.id) return NextResponse.json({ error: "Choose a valid student first." }, { status: 400 });
      if (!content || content.length > 500) return NextResponse.json({ error: "SuperChat must be 1–500 characters." }, { status: 400 });

      const { data: blocked } = await supabase.from("blocks").select("id").or(`and(blocker_id.eq.${user.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${user.id})`).maybeSingle();
      if (blocked) return NextResponse.json({ error: "You can't message this student." }, { status: 400 });
      const { data: target } = await supabase.from("profiles").select("id").eq("id", targetUserId).eq("profile_completed", true).eq("ghost_mode", false).maybeSingle();
      if (!target) return NextResponse.json({ error: "That profile is no longer available." }, { status: 404 });
    }

    const admin = createAdminClient();
    const shopOrderId = crypto.randomUUID();
    const { error: insertError } = await admin.from("shop_orders").insert({
      id: shopOrderId,
      user_id: user.id,
      product,
      amount_paise: config.amountPaise,
      quantity: config.quantity,
      target_user_id: targetUserId,
      payload: product === "superchat" ? { content } : {},
      status: "created",
    });
    if (insertError) throw insertError;

    const razorpay = createRazorpayClient();
    const order = await razorpay.orders.create({
      amount: config.amountPaise,
      currency: "INR",
      receipt: `db_${shopOrderId.replaceAll("-", "").slice(0, 32)}`,
      notes: { product, shop_order_id: shopOrderId },
    });

    await admin.from("shop_orders").update({ razorpay_order_id: order.id, updated_at: new Date().toISOString() }).eq("id", shopOrderId);

    return NextResponse.json({ success: true, keyId: getRazorpayKeyId(), orderId: order.id, amount: config.amountPaise, currency: "INR", shopOrderId, product });
  } catch (error) {
    console.error("Shop order creation failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: 500 });
  }
}
