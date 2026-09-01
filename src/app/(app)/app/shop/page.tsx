import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Heart, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { routes } from "@/config/routes";
import { DateBuShop } from "@/components/payments/datebu-shop";
import { DateBuExtrovertCheckout } from "@/components/payments/datebu-extrovert-checkout";

export const metadata: Metadata = { title: "Shop | DateBu" };
export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-4 pb-28 font-sans sm:px-6">
      <header className="flex items-center gap-3">
        <Link href={routes.extrovert} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-transform active:scale-95" aria-label="Back to Extrovert"><ArrowLeft className="h-4 w-4" /></Link>
        <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">DateBu</p><h1 className="text-xl font-black tracking-tight text-foreground">Shop</h1></div>
      </header>

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-5 sm:p-6">
          <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm"><Zap className="h-5 w-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black tracking-tight text-foreground">Choose your boost</h2><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">UPI only</span></div><p className="mt-1.5 max-w-lg text-[11px] leading-5 text-muted-foreground">Small one-time packs are right up front. Extrovert is below when you want the full premium experience.</p></div></div>
          <nav className="mt-5 grid grid-cols-3 gap-2" aria-label="Shop sections"><a href="#shop-likes" className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center transition-transform active:scale-95"><Heart className="mx-auto h-4 w-4 text-rose-500"/><p className="mt-1 text-[9px] font-black text-foreground">Likes</p><p className="text-[8px] text-muted-foreground">One-time</p></a><a href="#shop-superlikes" className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center transition-transform active:scale-95"><Sparkles className="mx-auto h-4 w-4 text-violet-600"/><p className="mt-1 text-[9px] font-black text-foreground">Super Likes</p><p className="text-[8px] text-muted-foreground">One-time</p></a><a href="#shop-superchats" className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center transition-transform active:scale-95"><MessageCircle className="mx-auto h-4 w-4 text-emerald-600"/><p className="mt-1 text-[9px] font-black text-foreground">SuperChats</p><p className="text-[8px] text-muted-foreground">One-time</p></a></nav>
        </div>
      </section>

      <div className="mt-7"><DateBuShop /></div>

      <section id="extrovert" className="mt-10 scroll-mt-20 overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-sm">
        <div className="p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm"><Sparkles className="h-5 w-5" /></div><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-600">Premium access</p><h2 className="text-xl font-black tracking-tight text-foreground">DateBu Extrovert</h2><p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">Unlock the premium side of DateBu with a weekly or monthly subscription.</p></div></div><div className="mt-5 rounded-2xl border border-violet-100 bg-white/75 p-3"><div className="grid gap-2 sm:grid-cols-2"><div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-700"><Check className="h-3.5 w-3.5 text-emerald-600"/>Personal tracker</div><div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-700"><Check className="h-3.5 w-3.5 text-emerald-600"/>See who likes you</div><div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-700"><Check className="h-3.5 w-3.5 text-emerald-600"/>Premium discovery tools</div><div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-700"><Check className="h-3.5 w-3.5 text-emerald-600"/>Extrovert-only features</div></div></div><div className="mt-5"><DateBuExtrovertCheckout /></div></div>
      </section>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600"/> UPI-only payments secured by Razorpay</div>
    </main>
  );
}
