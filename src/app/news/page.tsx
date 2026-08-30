import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Send, Newspaper } from "lucide-react";

export const metadata: Metadata = { title: "News & Feedback" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: posts } = await supabase.from("news_posts").select("id, title, body, created_at").order("created_at", { ascending: false });
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><Newspaper className="h-4 w-4" /> DateBu updates</div>
        <h1 className="mt-3 text-3xl font-black text-foreground">News &amp; Feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">New features, announcements, and a direct line to the DateBu team.</p>
      </header>
      <section className="space-y-4">
        {(posts ?? []).length === 0 ? <Card className="p-6 text-sm text-muted-foreground">No news yet. Check back soon.</Card> : posts?.map((post) => (
          <Card key={post.id} className="p-6">
            <p className="text-xs font-semibold text-emerald-700">{new Date(post.created_at).toLocaleDateString()}</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{post.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{post.body}</p>
          </Card>
        ))}
      </section>
      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground">Send feedback</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us what is working, what is broken, or what you want next.</p>
        {endpoint ? (
          <form action={endpoint} method="POST" className="mt-4 space-y-3">
            <input name="email" type="email" required placeholder="Your email" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            <textarea name="message" required rows={5} placeholder="Your feedback..." className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><Send className="h-4 w-4" /> Send feedback</button>
          </form>
        ) : <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Feedback form is being configured. Please check back soon.</p>}
      </Card>
    </main>
  );
}
