import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Newspaper, Sparkles, MessageSquareHeart, Calendar, ArrowLeft } from "lucide-react";
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
    <main className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
      <div className="flex items-center gap-3 px-1">
        <Link href={routes.discover} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-2xs active:scale-95 transition-all" aria-label="Back to discover"><ArrowLeft className="h-4 w-4" /></Link>
        <div><div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200"><Newspaper className="h-3 w-3" /> Campus Updates</div><h1 className="text-xl font-black tracking-tight text-foreground">News &amp; Feedback</h1></div>
      </div>

      <section className="space-y-3">
        {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-5 text-center"><p className="text-xs font-bold text-rose-700">Updates couldn&apos;t load</p><p className="mt-1 text-[10px] text-rose-600">Please try again in a moment.</p></div> : (posts ?? []).length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center space-y-2"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Sparkles className="h-5 w-5" /></div><p className="text-xs font-bold text-foreground">No announcements yet</p><p className="text-[11px] text-muted-foreground">Check back soon for new feature rollouts.</p></div> : posts?.map((post) => <article key={post.id} className="rounded-3xl border border-border/80 bg-card p-4 space-y-2 shadow-xs"><div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"><Calendar className="w-3 h-3" /><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time></div><h2 className="text-sm font-black text-foreground leading-snug">{post.title}</h2><p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p></article>)}
      </section>

      <section className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs"><div className="space-y-0.5"><h2 className="text-sm font-black text-foreground flex items-center gap-1.5"><MessageSquareHeart className="w-4 h-4 text-emerald-600" /> Send Feedback</h2><p className="text-[11px] text-muted-foreground">Feature requests, bug reports, or suggestions for the team.</p></div><FeedbackForm /></section>
    </main>
  );
}
