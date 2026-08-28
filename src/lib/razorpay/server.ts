import "server-only";

import Razorpay from "razorpay";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createRazorpayClient() {
  return new Razorpay({
    key_id: getRequiredEnv("RAZORPAY_KEY_ID"),
    key_secret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
  });
}

export function getRazorpayKeyId(): string {
  return getRequiredEnv("RAZORPAY_KEY_ID");
}

export function getRazorpayWebhookSecret(): string {
  return getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
}

export function getRazorpayPlanId(
  plan: "weekly" | "monthly",
): string {
  return getRequiredEnv(
    plan === "weekly"
      ? "RAZORPAY_WEEKLY_PLAN_ID"
      : "RAZORPAY_MONTHLY_PLAN_ID",
  );
}
