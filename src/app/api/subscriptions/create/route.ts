import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createRazorpayClient,
  getRazorpayKeyId,
  getRazorpayPlanId,
} from "@/lib/razorpay/server";

export const dynamic = "force-dynamic";

type BillingPlan = "weekly" | "monthly";

const PLAN_CONFIG: Record<
  BillingPlan,
  {
    planId: "weekly" | "monthly";
    label: string;
    totalCycles: number;
  }
> = {
  weekly: {
    planId: "weekly",
    label: "DateBu Extrovert — Weekly",
    totalCycles: 52,
  },
  monthly: {
    planId: "monthly",
    label: "DateBu Extrovert — Monthly",
    totalCycles: 12,
  },
};

export async function POST(request: Request) {
  try {
    // 1. Authenticate DateBu user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    // 2. Parse & validate requested billing plan
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const billingPlan =
      typeof body === "object" &&
      body !== null &&
      "plan" in body &&
      typeof body.plan === "string"
        ? (body.plan as BillingPlan)
        : null;

    if (billingPlan !== "weekly" && billingPlan !== "monthly") {
      return NextResponse.json(
        { error: "Invalid billing plan selected." },
        { status: 400 },
      );
    }

    const config = PLAN_CONFIG[billingPlan];

    // 3. Guard against duplicate active Pro subscriptions
    const { data: existingSubscription, error: subscriptionError } =
      await admin
        .from("subscriptions")
        .select("id, plan, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subscriptionError) {
      console.error("Failed to read subscription:", subscriptionError);
      return NextResponse.json(
        { error: "Unable to verify subscription status." },
        { status: 500 },
      );
    }

    const isCurrentlyActive =
      existingSubscription?.plan === "pro" &&
      (existingSubscription.status === "active" ||
        existingSubscription.status === "trialing") &&
      Boolean(
        existingSubscription.current_period_end &&
          new Date(existingSubscription.current_period_end).getTime() > Date.now(),
      );

    if (isCurrentlyActive) {
      return NextResponse.json(
        { error: "You already have an active DateBu Extrovert subscription." },
        { status: 409 },
      );
    }

    // 4. Create Razorpay recurring subscription
    const razorpay = createRazorpayClient();
    const planId = getRazorpayPlanId(config.planId);

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: config.totalCycles,
      customer_notify: 1,
      notes: {
        user_id: user.id,
        product: "DateBu Extrovert",
        billing_plan: billingPlan,
      },
    });

    const subscriptionId = razorpaySubscription.id;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Payment gateway failed to issue a subscription ID." },
        { status: 502 },
      );
    }

    // 5. Upsert subscription linkage atomically
    const { error: upsertError } = await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "free",
          status: "inactive",
          razorpay_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.error("Failed to store subscription record:", upsertError);
      return NextResponse.json(
        { error: "Subscription created but failed to link to account." },
        { status: 500 },
      );
    }

    // 6. Return client-safe checkout parameters
    return NextResponse.json({
      success: true,
      keyId: getRazorpayKeyId(),
      subscriptionId,
      plan: billingPlan,
      label: config.label,
    });
  } catch (error) {
    console.error("Subscription endpoint error:", error);
    return NextResponse.json(
      { error: "Unable to initialize checkout. Please try again." },
      { status: 500 },
    );
  }
}
