import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, WalletCards } from "lucide-react";
import { routes } from "@/config/routes";
import { DateBuShop } from "@/components/payments/datebu-shop";

export const metadata: Metadata = { title: "DateBu Shop" };
export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-md px-3.5 py-4 pb-28 font-sans">
      <header className="flex items-center gap-3 px-1">
        <Link href={routes.extrovert} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs active:scale-95" aria-label="Back to Extrovert">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">DateBu</p>
          <h1 className="text-xl font-black tracking-tight text-foreground">Shop</h1>
        </div>
      </header>

      <section className="mt-4 overflow-hidden rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-sm">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm"><ShoppingBag className="h-5 w-5" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5"><h2 className="text-xl font-black tracking-tight text-foreground">Small boosts. Your choice.</h2><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">UPI only</span></div>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">No subscription. Pick exactly what you need, pay once, and the credit lands in your DateBu wallet.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white bg-white/85 p-3 text-center"><Heart className="mx-auto h-4 w-4 text-rose-500" /><p className="mt-1.5 text-[9px] font-black text-foreground">Extra Likes</p><p className="mt-0.5 text-[8px] text-muted-foreground">More chances</p></div>
            <div className="rounded-2xl border border-white bg-white/85 p-3 text-center"><Sparkles className="mx-auto h-4 w-4 text-violet-600" /><p className="mt-1.5 text-[9px] font-black text-foreground">Super Likes</p><p className="mt-0.5 text-[8px] text-muted-foreground">Stand out</p></div>
            <div className="rounded-2xl border border-white bg-white/85 p-3 text-center"><MessageCircle className="mx-auto h-4 w-4 text-emerald-600" /><p className="mt-1.5 text-[9px] font-black text-foreground">SuperChats</p><p className="mt-0.5 text-[8px] text-muted-foreground">Message first</p></div>
          </div>
        </div>
      </section>

      <div className="mt-4"><DateBuShop /></div>

      <section className="mt-4 rounded-[2rem] border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><WalletCards className="h-4 w-4" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">How it works</p><h2 className="text-base font-black text-foreground">Simple and one-time</h2></div></div>
        <div className="mt-3 grid gap-2.5">
          <div className="rounded-2xl bg-muted/25 p-3"><p className="text-xs font-black text-foreground">1. Pick a boost</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Open a category and choose the pack that fits you.</p></div>
          <div className="rounded-2xl bg-muted/25 p-3"><p className="text-xs font-black text-foreground">2. Pay with UPI</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Razorpay opens a UPI-only checkout. No cards or netbanking.</p></div>
          <div className="rounded-2xl bg-muted/25 p-3"><p className="text-xs font-black text-foreground">3. Use it in DateBu</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Successful payments are verified server-side and the credit is delivered to your wallet.</p></div>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure UPI payments processed by Razorpay</div>
    </main>
  );
}
