"use client";

import { memo, useState } from "react";
import { Loader2, Heart, MessageCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop";

type RazorpayOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; theme?: { color?: string }; handler?: (response: RazorpayResponse) => void; modal?: { ondismiss?: () => void } };
type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on?: (event: string, callback: (response: unknown) => void) => void };
type RazorpayWindow = Window & { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance };

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const win = window as RazorpayWindow;
    if (win.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(true), { once: true }); existing.addEventListener("error", () => resolve(false), { once: true }); return; }
    const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script);
  });
}

const PRODUCTS: ShopProduct[] = ["extra_likes_5", "extra_likes_15", "extra_likes_30", "superlike_1", "superlike_5", "superchat_credit_1", "superchat_credit_3"];

function ProductIcon({ product }: { product: ShopProduct }) {
  if (product.startsWith("superchat")) return <MessageCircle className="h-4 w-4" />;
  if (product.startsWith("superlike")) return <Sparkles className="h-4 w-4" />;
  return <Heart className="h-4 w-4 fill-current" />;
}

export const DateBuShop = memo(function DateBuShop() {
  const [loading, setLoading] = useState<ShopProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(product: ShopProduct) {
    try {
      setLoading(product); setError(null);
      if (!(await loadRazorpayScript())) throw new Error("Payment checkout could not load. Please try again.");
      const response = await fetch("/api/razorpay/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to start payment.");
      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const instance = new Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId, name: "DateBu", description: SHOP_PRODUCTS[product].description, theme: { color: "#10b981" }, modal: { ondismiss: () => setLoading(null) }, handler: async (payment) => {
        const verify = await fetch("/api/razorpay/verify-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopOrderId: data.shopOrderId, ...payment }) });
        const result = await verify.json();
        if (!verify.ok && verify.status !== 202) throw new Error(result.error || "Payment verification failed.");
        setLoading(null);
        window.location.reload();
      }});
      instance.on?.("payment.failed", () => { setError("Payment was declined. Your account was not charged."); setLoading(null); });
      instance.open();
    } catch (err) {
      console.error("Shop checkout failed:", err); setError(err instanceof Error ? err.message : "Unable to start payment."); setLoading(null);
    }
  }

  return <section className="rounded-[2rem] border border-border bg-card p-4 shadow-xs"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><ShoppingBag className="h-4 w-4" /></div><div><h2 className="text-sm font-black text-foreground">DateBu Shop</h2><p className="text-[10px] text-muted-foreground">One-time extras. No subscription required.</p></div></div><span className="rounded-full bg-muted px-2 py-1 text-[9px] font-bold text-muted-foreground">Pay once</span></div><div className="mt-3 grid gap-2">{PRODUCTS.map((product) => { const config = SHOP_PRODUCTS[product]; const busy = loading === product; return <button key={product} type="button" onClick={() => void buy(product)} disabled={loading !== null} className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background p-3 text-left transition-transform active:scale-[.99] disabled:opacity-60"><div className="flex min-w-0 items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><ProductIcon product={product} /></div><div className="min-w-0"><p className="text-xs font-black text-foreground">{config.label}</p><p className="truncate text-[9px] text-muted-foreground">{config.description}</p></div></div><span className="flex h-8 min-w-12 shrink-0 items-center justify-center rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-black text-white">{busy ? <Loader2 className="h-3 w-3 animate-spin" /> : `₹${config.amountPaise / 100}`}</span></button>; })}</div><div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure one-time payment via Razorpay</div>{error && <p role="alert" className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">{error}</p>}</section>;
});
DateBuShop.displayName = "DateBuShop";
