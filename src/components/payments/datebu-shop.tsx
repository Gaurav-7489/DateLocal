"use client";

import { memo, useState } from "react";
import { Heart, Loader2, MessageCircle, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop";

type RazorpayConfig = { display: { blocks: { upi: { name: string; instruments: { method: "upi" }[] } }; sequence: string[]; preferences: { show_default_blocks: boolean } } };
type RazorpayOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; theme?: { color?: string }; config?: RazorpayConfig; handler?: (response: RazorpayResponse) => void; modal?: { ondismiss?: () => void } };
type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on?: (event: string, callback: (response: unknown) => void) => void };
type RazorpayWindow = Window & { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance };

const UPI_ONLY_CONFIG: RazorpayConfig = { display: { blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] } }, sequence: ["block.upi"], preferences: { show_default_blocks: false } } };

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const win = window as RazorpayWindow;
    if (win.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(true), { once: true }); existing.addEventListener("error", () => resolve(false), { once: true }); return; }
    const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script);
  });
}

const LIKE_PRODUCTS: ShopProduct[] = ["extra_likes_5", "extra_likes_15", "extra_likes_30"];
const SUPERLIKE_PRODUCTS: ShopProduct[] = ["superlike_1", "superlike_5"];
const SUPERCHAT_PRODUCTS: ShopProduct[] = ["superchat_credit_1", "superchat_credit_3"];

function ProductIcon({ product }: { product: ShopProduct }) {
  if (product.startsWith("superchat")) return <MessageCircle className="h-5 w-5" />;
  if (product.startsWith("superlike")) return <Sparkles className="h-5 w-5" />;
  return <Heart className="h-5 w-5 fill-current" />;
}

function ProductCard({ product, loading, onBuy, featured = false }: { product: ShopProduct; loading: ShopProduct | null; onBuy: (product: ShopProduct) => void; featured?: boolean }) {
  const config = SHOP_PRODUCTS[product];
  const busy = loading === product;
  return (
    <article className={`relative flex min-h-[174px] flex-col rounded-[1.6rem] border bg-card p-4 shadow-xs transition-transform duration-150 hover:-translate-y-0.5 ${featured ? "border-emerald-300 ring-1 ring-emerald-100" : "border-border"}`}>
      {featured && <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">Best value</span>}
      <div className="flex items-start gap-3 pr-12"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground"><ProductIcon product={product} /></div><div className="min-w-0"><h3 className="text-sm font-black text-foreground">{config.label}</h3><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{config.description}</p></div></div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4"><div><span className="text-2xl font-black tracking-tight text-foreground">₹{config.amountPaise / 100}</span><p className="text-[9px] font-medium text-muted-foreground">one-time purchase</p></div><button type="button" onClick={() => onBuy(product)} disabled={loading !== null} className="flex min-h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-[10px] font-black text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy with UPI"}</button></div>
    </article>
  );
}

function Section({ id, icon, title, eyebrow, description, products, loading, onBuy }: { id: string; icon: React.ReactNode; title: string; eyebrow: string; description: string; products: ShopProduct[]; loading: ShopProduct | null; onBuy: (product: ShopProduct) => void }) {
  return <section id={id} className="scroll-mt-20 space-y-3"><div className="flex items-start gap-3 px-1"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">{icon}</div><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600">{eyebrow}</p><h2 className="text-lg font-black tracking-tight text-foreground">{title}</h2><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{description}</p></div></div><div className="grid gap-3 sm:grid-cols-2">{products.map((product, index) => <ProductCard key={product} product={product} loading={loading} onBuy={onBuy} featured={products.length > 1 && index === products.length - 1} />)}</div></section>;
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
      const instance = new Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId, name: "DateBu", description: SHOP_PRODUCTS[product].description, theme: { color: "#10b981" }, config: UPI_ONLY_CONFIG, modal: { ondismiss: () => setLoading(null) }, handler: async (payment) => {
        try {
          const verify = await fetch("/api/razorpay/verify-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopOrderId: data.shopOrderId, ...payment }) });
          const result = await verify.json();
          if (!verify.ok && verify.status !== 202) throw new Error(result.error || "Payment verification failed.");
          window.location.reload();
        } catch (err) { setError(err instanceof Error ? err.message : "Payment verification failed."); } finally { setLoading(null); }
      }});
      instance.on?.("payment.failed", () => { setError("UPI payment failed. Your account was not charged."); setLoading(null); });
      instance.open();
    } catch (err) { console.error("Shop checkout failed:", err); setError(err instanceof Error ? err.message : "Unable to start payment."); setLoading(null); }
  }

  return <div className="space-y-8">
    <Section id="shop-likes" eyebrow="One-time · Likes" title="Extra Likes" description="More chances to say yes today." icon={<Heart className="h-4 w-4 text-rose-500" />} products={LIKE_PRODUCTS} loading={loading} onBuy={(p) => void buy(p)} />
    <Section id="shop-superlikes" eyebrow="One-time · Super Likes" title="Super Likes" description="Make one profile stand out from the crowd." icon={<Sparkles className="h-4 w-4 text-violet-600" />} products={SUPERLIKE_PRODUCTS} loading={loading} onBuy={(p) => void buy(p)} />
    <Section id="shop-superchats" eyebrow="One-time · SuperChats" title="SuperChats" description="Send a direct message before a match." icon={<MessageCircle className="h-4 w-4 text-emerald-600" />} products={SUPERCHAT_PRODUCTS} loading={loading} onBuy={(p) => void buy(p)} />
    {error && <div role="alert" className="sticky bottom-3 z-30 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 shadow-lg">{error}</div>}
    <div className="flex items-center justify-center gap-1.5 border-t border-border pt-5 text-[9px] font-semibold text-muted-foreground"><WalletCards className="h-3.5 w-3.5 text-emerald-600" /> UPI-only checkout · payments secured by Razorpay <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /></div>
  </div>;
});
DateBuShop.displayName = "DateBuShop";
