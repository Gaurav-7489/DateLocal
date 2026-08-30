"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

type BillingPlan = "weekly" | "monthly";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on?: (
    event: string,
    callback: (response: unknown) => void,
  ) => void;
}

interface CreateSubscriptionResponse {
  success?: boolean;
  error?: string;
  keyId?: string;
  subscriptionId?: string;
  plan?: BillingPlan;
  label?: string;
}

const PLANS: Record<
  BillingPlan,
  {
    name: string;
    price: number;
    description: string;
  }
> = {
  weekly: {
    name: "Weekly",
    price: 39,
    description: "DateBu Extrovert for 7 days",
  },
  monthly: {
    name: "Monthly",
    price: 99,
    description: "DateBu Extrovert for a month",
  },
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

interface DateBuExtrovertCheckoutProps {
  email?: string;
  name?: string;
  phone?: string;
}

export function DateBuExtrovertCheckout({
  email,
  name,
  phone,
}: DateBuExtrovertCheckoutProps) {
  const [loadingPlan, setLoadingPlan] =
    useState<BillingPlan | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: BillingPlan) {
    try {
      setError(null);
      setLoadingPlan(plan);

      // --------------------------------------------------------
      // 1. Load Razorpay Checkout
      // --------------------------------------------------------

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection.",
        );
      }

      // --------------------------------------------------------
      // 2. Ask our server to create the subscription
      // --------------------------------------------------------

      const response = await fetch(
        "/api/razorpay/create-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
          }),
        },
      );

      const data =
        (await response.json()) as CreateSubscriptionResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to create your DateBu Extrovert subscription.",
        );
      }

      if (!data.keyId || !data.subscriptionId) {
        throw new Error(
          "Razorpay returned an incomplete subscription.",
        );
      }

      // --------------------------------------------------------
      // 3. Open Razorpay Checkout
      // --------------------------------------------------------

      const selectedPlan = PLANS[plan];

      const options: RazorpayOptions = {
        key: data.keyId,
        subscription_id: data.subscriptionId,

        name: "DateBu",
        description: `${selectedPlan.name} — DateBu Extrovert`,

     prefill: {
  name: name || "DateBu Student",
  email,
  contact: phone,
},

        notes: {
          product: "DateBu Extrovert",
          billing_plan: plan,
        },

        theme: {
          color: "#18181b",
        },

        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },

        handler: () => {
          // IMPORTANT:
          // We do NOT mark the user as Pro here.
          //
          // The server-side Razorpay webhook is responsible
          // for activating DateBu Extrovert.
          //
          // This prevents users from unlocking Pro by
          // manipulating browser-side JavaScript.

          window.location.href =
            "/app/settings?subscription=processing";
        },
      };

      const razorpay = new window.Razorpay(options);

      if (razorpay.on) {
        razorpay.on("payment.failed", (response) => {
          console.error(
            "Razorpay payment failed:",
            response,
          );

          setError(
            "Payment failed. No worries — your DateBu account was not upgraded.",
          );

          setLoadingPlan(null);
        });
      }

      razorpay.open();
    } catch (checkoutError) {
      console.error(
        "DateBu Extrovert checkout failed:",
        checkoutError,
      );

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong while starting checkout.",
      );

      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(PLANS) as BillingPlan[]).map((plan) => {
          const config = PLANS[plan];
          const isLoading = loadingPlan === plan;

          return (
            <button
              key={plan}
              type="button"
              onClick={() => startCheckout(plan)}
              disabled={loadingPlan !== null}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {plan === "monthly" && (
                <div className="absolute right-4 top-4 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">
                  Best value
                </div>
              )}

              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-zinc-900" />

                <span className="text-sm font-bold uppercase tracking-wide text-zinc-500">
                  {config.name}
                </span>
              </div>

              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-black tracking-tight text-zinc-950">
                  ₹{config.price}
                </span>

                <span className="pb-1 text-sm text-zinc-500">
                  /{plan === "weekly" ? "week" : "month"}
                </span>
              </div>

              <p className="mb-6 text-sm text-zinc-500">
                {config.description}
              </p>

              <div className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-zinc-800">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting checkout...
                  </>
                ) : (
                  <>Get DateBu Extrovert</>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4" />
        Secure payments powered by Razorpay
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
