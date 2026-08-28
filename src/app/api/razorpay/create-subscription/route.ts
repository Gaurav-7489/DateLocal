import { NextResponse } from "next/server";


import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createRazorpayClient,
  getRazorpayKeyId,
  getRazorpayPlanId,
} from "@/lib/razorpay/server";

type BillingPlan = "weekly" | "monthly";

const PLAN_CONFIG: Record<
  BillingPlan,
  {
    planId: "weekly" | "monthly";
    label: string;
  }
> = {
  weekly: {
    planId: "weekly",
    label: "DateBu Extrovert — Weekly",
  },
  monthly: {
    planId: "monthly",
    label: "DateBu Extrovert — Monthly",
  },
};

export async function POST(request: Request) {
  try {
    // ----------------------------------------------------------
    // 1. Authenticate the DateBu user
    // ----------------------------------------------------------

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
    
    // Trusted server-side client for subscription writes.
    // RLS intentionally blocks normal users from modifying
    // subscription records.
    const admin = createAdminClient();

    // ----------------------------------------------------------
    // 2. Validate requested billing plan
    // ----------------------------------------------------------

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
        ? body.plan
        : null;

    if (billingPlan !== "weekly" && billingPlan !== "monthly") {
      return NextResponse.json(
        { error: "Invalid billing plan." },
        { status: 400 },
      );
    }

    const config = PLAN_CONFIG[billingPlan];

    // ----------------------------------------------------------
    // 3. Check existing DateBu subscription
    // ----------------------------------------------------------

  const { data: existingSubscription, error: subscriptionError } =
  await admin
    .from("subscriptions")
        .select(
          "id, plan, status, razorpay_subscription_id, current_period_end",
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (subscriptionError) {
      console.error(
        "Failed to read existing subscription:",
        subscriptionError,
      );

      return NextResponse.json(
        { error: "Unable to check subscription status." },
        { status: 500 },
      );
    }

    // Don't allow a second active Pro subscription.
    if (
      existingSubscription?.plan === "pro" &&
      (existingSubscription.status === "active" ||
        existingSubscription.status === "trialing")
    ) {
      return NextResponse.json(
        {
          error:
            "You already have an active DateBu Extrovert subscription.",
        },
        { status: 409 },
      );
    }

    // ----------------------------------------------------------
    // 4. Create Razorpay subscription
    // ----------------------------------------------------------

    const razorpay = createRazorpayClient();

    const planId = getRazorpayPlanId(config.planId);

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,

      // Razorpay recurring subscription count.
      // This is deliberately finite rather than unlimited.
      total_count: 12,

      customer_notify: 1,

      notes: {
        user_id: user.id,
        product: "DateBu Extrovert",
        billing_plan: billingPlan,
      },
    });

    // ----------------------------------------------------------
    // 5. Save the Razorpay subscription ID immediately
    //
    // IMPORTANT:
    // The browser NEVER gets permission to modify the
    // subscription database row directly.
    // ----------------------------------------------------------

    const subscriptionId = razorpaySubscription.id;

    if (!subscriptionId) {
      console.error(
        "Razorpay returned no subscription ID.",
      );

      return NextResponse.json(
        { error: "Razorpay did not return a subscription ID." },
        { status: 502 },
      );
    }

    if (existingSubscription) {
      const { error: updateError } = await admin
        .from("subscriptions")
        .update({
          plan: "free",
          status: "inactive",
          razorpay_subscription_id: subscriptionId,
          current_period_start: null,
          current_period_end: null,
          last_payment_id: null,
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error(
          "Failed to store Razorpay subscription:",
          updateError,
        );

        return NextResponse.json(
          {
            error:
              "Subscription was created but could not be linked to your account.",
          },
          { status: 500 },
        );
      }
    } else {
      const { error: insertError } = await admin
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "free",
          status: "inactive",
          razorpay_subscription_id: subscriptionId,
        });

      if (insertError) {
        console.error(
          "Failed to create DateBu subscription record:",
          insertError,
        );

        return NextResponse.json(
          {
            error:
              "Subscription was created but could not be linked to your account.",
          },
          { status: 500 },
        );
      }
    }

    // ----------------------------------------------------------
    // 6. Return ONLY information safe for the browser
    // ----------------------------------------------------------

    return NextResponse.json({
      success: true,
      keyId: getRazorpayKeyId(),
      subscriptionId,
      plan: billingPlan,
      label: config.label,
    });
  } catch (error) {
    console.error(
      "Razorpay subscription creation failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to create the subscription right now.",
      },
      { status: 500 },
    );
  }
}
