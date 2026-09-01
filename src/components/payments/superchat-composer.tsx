"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, X, ShieldCheck, WalletCards } from "lucide-react";
import { SHOP_PRODUCTS } from "@/lib/shop";
import { createClient } from "@/lib/supabase/client";

type Props = { targetUserId: string; targetName: string; onClose: () => void; onComplete?: () => void };
type RazorpayOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; theme?: { color?: string }; handler?: (response: RazorpayResponse) => void; modal?: { ondismiss?: () => void } };
type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on?: (event: string, callback: (response: unknown) => void) => void };
type RazorpayWindow = Window & { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance };

function loadRazorpayScript() { return new Promise<boolean>((resolve) => { const win = window as RazorpayWindow; if (win.Razorpay) return resolve(true); const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]'); if (existing) { existing.addEventListener("load", () => resolve(true), { once: true }); existing.addEventListener("error", () => resolve(false), { once: true }); return; } const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); }); }

export default function SuperChatComposer({ targetUserId, targetName, onClose, onComplete }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const product = SHOP_PRODUCTS.superchat;

  useEffect(() => { const supabase = createClient(); void supabase.from("superchat_wallets").select("purchased_superchats").maybeSingle().then(({ data }) => setCredits(data?.purchased_superchats ?? 0)); }, []);

  async function sendWithCredit(text: string) {
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("send_superchat_with_credit", { p_recipient_id: targetUserId, p_content: text });
    if (rpcError) throw new Error(rpcError.message.includes("SUPERCHAT_EMPTY") ? "Your SuperChat credits are empty." : "Couldn't send the SuperChat. Please try again.");
    setCredits((value) => Math.max(0, value - 1)); onComplete?.(); onClose();
  }

  async function send() {
    const text = content.trim();
    if (!text || text.length > 500 || loading) return;
    try {
      setLoading(true); setError(null);
      if (credits > 0) { await sendWithCredit(text); return; }
      if (!(await loadRazorpayScript())) throw new Error("Payment checkout could not load. Please try again.");
      const response = await fetch("/api/razorpay/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: "superchat", targetUserId, content: text }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to start SuperChat.");
      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const instance = new Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId, name: "DateBu", description: `SuperChat to ${targetName}`, theme: { color: "#10b981" }, modal: { ondismiss: () => setLoading(false) }, handler: async (payment) => {
        const verify = await fetch("/api/razorpay/verify-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopOrderId: data.shopOrderId, ...payment }) });
        const result = await verify.json();
        if (!verify.ok && verify.status !== 202) throw new Error(result.error || "Payment verification failed.");
        setLoading(false); onComplete?.(); onClose();
      }});
      instance.on?.("payment.failed", () => { setError("Payment was declined. Your account was not charged."); setLoading(false); });
      instance.open();
    } catch (err) { console.error("SuperChat checkout failed:", err); setError(err instanceof Error ? err.message : "Unable to send SuperChat."); setLoading(false); }
  }

  return <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"><div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">SuperChat</p><h2 className="mt-1 text-lg font-black text-foreground">Message {targetName}</h2><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">One direct message before matching. They can view your profile and choose whether to connect.</p></div><button type="button" onClick={onClose} className="rounded-full border border-border p-2 text-muted-foreground active:scale-95" aria-label="Close"><X className="h-4 w-4" /></button></div><div className="mt-4 rounded-2xl border border-border bg-background p-3"><textarea value={content} onChange={(e) => setContent(e.target.value.slice(0, 500))} rows={5} autoFocus placeholder="Say something genuine..." className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" /><div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground"><span>{content.length}/500</span><span>Be respectful.</span></div></div>{error && <p role="alert" className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">{error}</p>}<button type="button" onClick={() => void send()} disabled={!content.trim() || loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : credits > 0 ? <><WalletCards className="h-4 w-4" /> Use SuperChat credit · {credits} left</> : <><MessageCircle className="h-4 w-4" /> Send SuperChat · ₹{product.amountPaise / 100}</>}</button><div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {credits > 0 ? "Using your purchased credit" : "Secure payment via Razorpay"}</div></div></div>;
}
