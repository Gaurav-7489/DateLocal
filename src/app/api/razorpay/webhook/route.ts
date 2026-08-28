import { NextResponse } from "next/server";
import crypto from "crypto";

import { getRazorpayWebhookSecret } from "@/lib/razorpay/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        current_start?: number;
        current_end?: number;
      };
    };
    payment?: {
      entity?: {
        id?: string;
        subscription_id?: string;
      };
    };
  };
};

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  try {
    // ----------------------------------------------------------
    // 1. Read the RAW request body.
    // ----------------------------------------------------------

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty webhook body." },
        { status: 400 },
      );
    }

    // ----------------------------------------------------------
    // 2. Verify Razorpay signature.
    // ----------------------------------------------------------

    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 401 },
      );
    }

    const webhookSecret = getRazorpayWebhookSecret();

    const validSignature = verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret,
    );

    if (!validSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 },
      );
    }

    // ----------------------------------------------------------
    // 3. Parse verified payload.
    // ----------------------------------------------------------

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;

    const eventType = payload.event;

    if (!eventType) {
      return NextResponse.json(
        { error: "Missing event type." },
        { status: 400 },
      );
    }

    // Razorpay does not provide a universal event ID in every
    // webhook payload/version, so use the signature + body hash
    // as an idempotency key.
    const eventId = crypto
      .createHash("sha256")
      .update(`${signature}:${rawBody}`)
      .digest("hex");

    const admin = createAdminClient();

    // ----------------------------------------------------------
    // 4. Idempotency check.
    // ----------------------------------------------------------

    const { data: existingEvent, error: existingEventError } =
      await admin
        .from("razorpay_webhook_events")
        .select("id")
        .eq("razorpay_event_id", eventId)
        .maybeSingle();

    if (existingEventError) {
      console.error(
        "Failed to check webhook idempotency:",
        existingEventError,
      );

      return NextResponse.json(
        { error: "Unable to process webhook." },
        { status: 500 },
      );
    }

    if (existingEvent) {
      return NextResponse.json({
        success: true,
        duplicate: true,
      });
    }

    // ----------------------------------------------------------
    // 5. Extract subscription/payment information.
    // ----------------------------------------------------------

    const subscriptionEntity =
      payload.payload?.subscription?.entity;

    const paymentEntity = payload.payload?.payment?.entity;

    const razorpaySubscriptionId = subscriptionEntity?.id;
    const paymentId = paymentEntity?.id;

    // ----------------------------------------------------------
    // 6. Find DateBu user by Razorpay subscription ID.
    // ----------------------------------------------------------

    let userId: string | null = null;

    if (razorpaySubscriptionId) {
      const { data: subscriptionRow } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq(
          "razorpay_subscription_id",
          razorpaySubscriptionId,
        )
        .maybeSingle();

      userId = subscriptionRow?.user_id ?? null;
    }

    // ----------------------------------------------------------
    // 7. Handle subscription lifecycle events.
    // ----------------------------------------------------------

    if (userId && razorpaySubscriptionId) {
      const razorpayStatus = subscriptionEntity?.status;

      let status:
        | "inactive"
        | "trialing"
        | "active"
        | "cancelled"
        | "expired"
        | null = null;

      if (
        eventType === "subscription.activated" ||
        eventType === "subscription.charged"
      ) {
        status = "active";
      } else if (
        eventType === "subscription.cancelled"
      ) {
        status = "cancelled";
      } else if (
        eventType === "subscription.completed"
      ) {
        status = "expired";
      } else if (
        eventType === "subscription.halted"
      ) {
        status = "expired";
      } else if (razorpayStatus === "active") {
        status = "active";
      }

      if (status) {
        const currentPeriodStart =
          subscriptionEntity?.current_start
            ? new Date(
                subscriptionEntity.current_start * 1000,
              ).toISOString()
            : null;

        const currentPeriodEnd =
          subscriptionEntity?.current_end
            ? new Date(
                subscriptionEntity.current_end * 1000,
              ).toISOString()
            : null;

        const { error: updateError } = await admin
          .from("subscriptions")
          .update({
            plan: status === "expired" || status === "cancelled"
              ? "free"
              : "pro",
            status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            last_payment_id: paymentId ?? undefined,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "Failed to update DateBu subscription:",
            updateError,
          );

          return NextResponse.json(
            { error: "Unable to update subscription." },
            { status: 500 },
          );
        }
      }
    }

    // ----------------------------------------------------------
    // 8. Record webhook as processed.
    // ----------------------------------------------------------

    const { error: eventInsertError } = await admin
      .from("razorpay_webhook_events")
      .insert({
        razorpay_event_id: eventId,
        event_type: eventType,
      });

    if (eventInsertError) {
      console.error(
        "Failed to record webhook event:",
        eventInsertError,
      );

      return NextResponse.json(
        { error: "Webhook processing incomplete." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
