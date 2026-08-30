import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Send, Newspaper, Sparkles, MessageSquareHeart, Calendar, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { 
  title: "News & Feedback | DateBu" 
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: posts } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  return (
    <main className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 px-1">
        <Link
          href={routes.discover}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-2xs active:scale-95 transition-all"
          aria-label="Back to discover"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <Newspaper className="h-3 w-3" /> Campus Updates
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            News &amp; Feedback
          </h1>
        </div>
      </div>

      {/* Announcements Feed */}
      <section className="space-y-3">
        {(posts ?? []).length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-foreground">No announcements yet</p>
            <p className="text-[11px] text-muted-foreground">Check back soon for new feature rollouts.</p>
          </div>
        ) : (
          posts?.map((post) => (
            <div 
              key={post.id} 
              className="rounded-3xl border border-border/80 bg-card p-4 space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-sm font-black text-foreground leading-snug">
                {post.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {post.body}
              </p>
            </div>
          ))
        )}
      </section>

      {/* Feedback Form Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <MessageSquareHeart className="w-4 h-4 text-emerald-600" /> Send Feedback
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Feature requests, bug reports, or suggestions for the team.
          </p>
        </div>

        {endpoint ? (
          <form action={endpoint} method="POST" className="space-y-2.5 pt-1">
            <input
              name="email"
              type="email"
              required
              placeholder="Your student email"
              className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
            />
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Tell us what you want to see next..."
              className="w-full resize-none rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Feedback</span>
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-center text-xs font-medium text-amber-800">
            Feedback inbox is being configured. Check back shortly.
          </div>
        )}
      </div>
    </main>
  );
}
