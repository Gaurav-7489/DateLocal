"use client";

import { memo, useState } from "react";
import { ChevronDown, Heart, Loader2, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, WalletCards, Zap } from "lucide-react";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop";

type RazorpayConfig = {
  display: {
    blocks: { upi: { name: string; instruments: { method: "upi" }[] } };
    sequence: string[];
    preferences: { show_default_blocks: boolean };
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  theme?: { color?: string };
  config?: RazorpayConfig;
  handler?: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on?: (event: string, callback: (response: unknown) => void) => void;
};

type RazorpayWindow = Window & { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance };

const UPI_ONLY_CONFIG: RazorpayConfig = {
  display: {
    blocks: {
      upi: {
        name: "Pay via UPI",
        instruments: [{ method: "upi" }],
      },
    },
    sequence: ["block.upi"],
    preferences: { show_default_blocks: false },
  },
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const win = window as RazorpayWindow;
    if (win.Razorpay) return resolve(true);
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

const PRODUCTS: ShopProduct[] = [
  "extra_likes_5",
  "extra_likes_15",
  "extra_likes_30",
  "superlike_1",
  "superlike_5",
  "superchat_credit_1",
  "superchat_credit_3",
];

const LIKE_PRODUCTS: ShopProduct[] = ["extra_likes_5", "extra_likes_15", "extra_likes_30"];
const SUPERLIKE_PRODUCTS: ShopProduct[] = ["superlike_1", "superlike_5"];
const SUPERCHAT_PRODUCTS: ShopProduct[] = ["superchat_credit_1", "superchat_credit_3"];

function ProductIcon({ product }: { product: ShopProduct }) {
  if (product.startsWith("superchat")) return <MessageCircle className="h-4 w-4" />;
  if (product.startsWith("superlike")) return <Sparkles className="h-4 w-4" />;
  return <Heart className="h-4 w-4 fill-current" />;
}

function ProductRow({ product, loading, onBuy }: { product: ShopProduct; loading: ShopProduct | null; onBuy: (product: ShopProduct) => void }) {
  const config = SHOP_PRODUCTS[product];
  const busy = loading === product;
  return (
    <button
      type="button"
      onClick={() => onBuy(product)}
      disabled={loading !== null}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background p-3.5 text-left transition-transform duration-150 active:scale-[.99] disabled:opacity-60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-150 group-hover:scale-105">
          <ProductIcon product={product} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-foreground">{config.label}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{config.description}</p>
        </div>
      </div>
      <span className="flex h-9 min-w-16 shrink-0 items-center justify-center rounded-full bg-zinc-950 px-3 text-[10px] font-black text-white">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `₹${config.amountPaise / 100}`}
      </span>
    </button>
  );
}

function ProductGroup({ title, description, icon, products, loading, onBuy, defaultOpen = false }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  products: ShopProduct[];
  loading: ShopProduct | null;
  onBuy: (product: ShopProduct) => void;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-[1.5rem] border border-border/80 bg-background">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">{icon}</div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground">{title}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-2 border-t border-border/70 p-3.5">
        {products.map((product) => <ProductRow key={product} product={product} loading={loading} onBuy={onBuy} />)}
      </div>
    </details>
  );
}

export const DateBuShop = memo(function DateBuShop() {
  const [loading, setLoading] = useState<ShopProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(product: ShopProduct) {
    try {
      setLoading(product);
      setError(null);
      if (!(await loadRazorpayScript())) throw new Error("Payment checkout could not load. Please try again.");

      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to start payment.");

      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");

      const instance = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "DateBu",
        description: SHOP_PRODUCTS[product].description,
        theme: { color: "#10b981" },
        config: UPI_ONLY_CONFIG,
        modal: { ondismiss: () => setLoading(null) },
        handler: async (payment) => {
          const verify = await fetch("/api/razorpay/verify-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shopOrderId: data.shopOrderId, ...payment }),
          });
          const result = await verify.json();
          if (!verify.ok && verify.status !== 202) throw new Error(result.error || "Payment verification failed.");
          setLoading(null);
          window.location.reload();
        },
      });

      instance.on?.("payment.failed", () => {
        setError("UPI payment failed. Your account was not charged.");
        setLoading(null);
      });
      instance.open();
    } catch (err) {
      console.error("Shop checkout failed:", err);
      setError(err instanceof Error ? err.message : "Unable to start payment.");
      setLoading(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xs">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm"><ShoppingBag className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-lg font-black tracking-tight text-foreground">DateBu Shop</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">UPI only</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Small boosts when you want another chance. Buy once, use whenever.</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5"><Heart className="mx-auto h-4 w-4 text-rose-500" /><p className="mt-1 text-[9px] font-bold text-muted-foreground">Likes</p></div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5"><Sparkles className="mx-auto h-4 w-4 text-violet-600" /><p className="mt-1 text-[9px] font-bold text-muted-foreground">Super Likes</p></div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5"><MessageCircle className="mx-auto h-4 w-4 text-emerald-600" /><p className="mt-1 text-[9px] font-bold text-muted-foreground">SuperChats</p></div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <ProductGroup title="Extra Likes" description="Add more likes to your wallet" icon={<Heart className="h-4 w-4 text-rose-500" />} products={LIKE_PRODUCTS} loading={loading} onBuy={(product) => void buy(product)} defaultOpen />
        <ProductGroup title="Super Likes" description="Stand out from a normal like" icon={<Sparkles className="h-4 w-4 text-violet-600" />} products={SUPERLIKE_PRODUCTS} loading={loading} onBuy={(product) => void buy(product)} />
        <ProductGroup title="SuperChats" description="Send a message before matching" icon={<MessageCircle className="h-4 w-4 text-emerald-600" />} products={SUPERCHAT_PRODUCTS} loading={loading} onBuy={(product) => void buy(product)} />
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><WalletCards className="h-3.5 w-3.5 text-emerald-600" /> UPI checkout only · Razorpay secured</div>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground"><ShieldCheck className="h-3 w-3 text-emerald-600" /> No subscription · pay only for what you choose</div>
      </div>
      {error && <p role="alert" className="mx-4 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[10px] font-semibold text-rose-700">{error}</p>}
    </section>
  );
});
DateBuShop.displayName = "DateBuShop";
