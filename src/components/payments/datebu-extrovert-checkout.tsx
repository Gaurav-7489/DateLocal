"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { routes } from "@/config/routes";

type BillingPlan = "weekly" | "monthly";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions { key: string; subscription_id: string; name: string; description: string; prefill?: { name?: string; email?: string; contact?: string }; notes?: Record<string, string>; theme?: { color?: string }; modal?: { ondismiss?: () => void }; handler?: (response: RazorpayResponse) => void; }
interface RazorpayResponse { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string; }
interface RazorpayInstance { open: () => void; on?: (event: string, callback: (response: unknown) => void) => void; }
interface CreateSubscriptionResponse { success?: boolean; error?: string; keyId?: string; subscriptionId?: string; plan?: BillingPlan; label?: string; }

const PLANS: Record<BillingPlan, { name: string; price: number; description: string; badge?: string }> = {
  weekly: { name: "Weekly Pass", price: 39, description: "Full DateBu Extrovert perks for 7 days" },
  monthly: { name: "Monthly Pass", price: 99, description: "Uncapped visibility & Ghost Mode for 30 days", badge: "Most Popular" },
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
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

interface DateBuExtrovertCheckoutProps { email?: string; name?: string; phone?: string; }

export const DateBuExtrovertCheckout = memo(function DateBuExtrovertCheckout({ email, name, phone }: DateBuExtrovertCheckoutProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: BillingPlan) {
    try {
      setError(null);
      setLoadingPlan(plan);
      if (!(await loadRazorpayScript())) throw new Error("Unable to load Razorpay Checkout. Please check your network connection.");

      // This matches the actual Next.js route: /api/razorpay/create-subscription
      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as CreateSubscriptionResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to initialize checkout. Please try again.");
      if (!data.keyId || !data.subscriptionId) throw new Error("Gateway issued an incomplete subscription parameter.");

      const selectedPlan = PLANS[plan];
      const razorpay = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "DateBu",
        description: `${selectedPlan.name} — Extrovert Access`,
        prefill: { name: name || "DateBu Student", email, contact: phone },
        notes: { product: "DateBu Extrovert", billing_plan: plan },
        theme: { color: "#10b981" },
        modal: { ondismiss: () => setLoadingPlan(null) },
        handler: () => {
          setLoadingPlan(null);
          router.push(`${routes.settings}?subscription=processing`);
          router.refresh();
        },
      });
      razorpay.on?.("payment.failed", () => {
        setError("Payment was declined. Your account was not charged.");
        setLoadingPlan(null);
      });
      razorpay.open();
    } catch (checkoutError) {
      console.error("DateBu Extrovert checkout failed:", checkoutError);
      setError(checkoutError instanceof Error ? checkoutError.message : "Something went wrong while starting checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-5 font-sans">
      <div className="grid gap-3.5 sm:grid-cols-2">
        {(Object.keys(PLANS) as BillingPlan[]).map((plan) => {
          const config = PLANS[plan];
          const isLoading = loadingPlan === plan;
          return (
            <button key={plan} type="button" onClick={() => void startCheckout(plan)} disabled={loadingPlan !== null} className="group relative rounded-3xl border border-zinc-200/90 bg-white p-5 text-left shadow-2xs transform-gpu transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer overflow-hidden">
              {config.badge && <div className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">{config.badge}</div>}
              <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100"><Zap className="h-4 w-4" /></div><span className="text-xs font-black uppercase tracking-wider text-zinc-600">{config.name}</span></div>
              <div className="mb-1 flex items-baseline gap-1"><span className="text-3xl font-black tracking-tight text-zinc-950">₹{config.price}</span><span className="text-xs font-semibold text-zinc-400">/{plan === "weekly" ? "wk" : "mo"}</span></div>
              <p className="mb-5 text-xs text-zinc-500 leading-relaxed">{config.description}</p>
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-3 px-4 text-xs font-bold text-white transition-all group-hover:bg-emerald-600 shadow-sm">{isLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Initializing Checkout...</> : <><Sparkles className="h-3.5 w-3.5" /> Get Extrovert</>}</div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-500"><ShieldCheck className="h-4 w-4 text-emerald-600" />Encrypted payments processed securely via Razorpay</div>
      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div>}
    </div>
  );
});
DateBuExtrovertCheckout.displayName = "DateBuExtrovertCheckout";
