import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Newspaper, Sparkles, MessageSquareHeart, Calendar, ArrowLeft, Instagram, ExternalLink } from "lucide-react";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = { title: "News & Feedback | DateBu" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: posts, error } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-md overflow-y-auto px-3.5 py-4 font-sans select-none pb-28">
      <div className="flex items-center gap-3 px-1">
        <Link href={routes.discover} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs transition-all hover:text-foreground active:scale-95" aria-label="Back to discover"><ArrowLeft className="h-4 w-4" /></Link>
        <div><div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><Newspaper className="h-3 w-3" /> Campus Updates</div><h1 className="text-xl font-black tracking-tight text-foreground">News &amp; Feedback</h1></div>
      </div>

      <section className="mt-4 space-y-3">
        {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-5 text-center"><p className="text-xs font-bold text-rose-700">Updates couldn&apos;t load</p><p className="mt-1 text-[10px] text-rose-600">Please try again in a moment.</p></div> : (posts ?? []).length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center space-y-2"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Sparkles className="h-5 w-5" /></div><p className="text-xs font-bold text-foreground">No announcements yet</p><p className="text-[11px] text-muted-foreground">Check back soon for new feature rollouts.</p></div> : posts?.map((post) => <article key={post.id} className="rounded-3xl border border-border/80 bg-card p-4 space-y-2 shadow-xs"><div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"><Calendar className="w-3 h-3" /><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time></div><h2 className="text-sm font-black text-foreground leading-snug">{post.title}</h2><p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p></article>)}
      </section>

      <section className="mt-4 rounded-3xl border border-violet-200 bg-violet-50/60 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100"><Instagram className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">Follow DateBu</p>
            <h2 className="mt-0.5 text-sm font-black text-foreground">@datebu.in</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Follow the DateBu Instagram page for product updates, campus content, launches, and what&apos;s happening next.</p>
            <a href="https://www.instagram.com/datebu.in/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2.5 text-[11px] font-black text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95"><Instagram className="h-3.5 w-3.5" /> Open Instagram <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs"><div className="space-y-0.5"><h2 className="text-sm font-black text-foreground flex items-center gap-1.5"><MessageSquareHeart className="w-4 h-4 text-emerald-600" /> Send Feedback</h2><p className="text-[11px] text-muted-foreground">Feature requests, bug reports, or suggestions for the team.</p></div><FeedbackForm /></section>
    </main>
  );
}
