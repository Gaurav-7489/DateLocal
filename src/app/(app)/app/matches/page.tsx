import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare, Heart, ShieldCheck, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Matches",
};

export const dynamic = "force-dynamic";

function getPhotoUrl(storagePath: string | null) {
  if (!storagePath) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${storagePath}`;
}

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load blocked user IDs to filter out
  const { data: blocksCreated } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);

  const { data: blocksReceived } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocked_id", user.id);

  const blockedUserIds = new Set<string>([
    ...(blocksCreated ?? []).map((b) => b.blocked_id),
    ...(blocksReceived ?? []).map((b) => b.blocker_id),
  ]);

  // Load matches
  const { data: rawMatches, error: matchesError } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (matchesError) {
    console.error("Failed to load matches:", matchesError);
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load your matches right now.
        </p>
      </div>
    );
  }

  // Filter out any matches involving blocked users
  const matches = (rawMatches ?? []).filter((m) => {
    const otherId = m.user_a === user.id ? m.user_b : m.user_a;
    return !blockedUserIds.has(otherId);
  });

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon="💚"
          title="No matches yet"
          description="Your connections will appear here once you and another student swipe right on each other."
        >
          <Link href={routes.discover}>
            <Button variant="primary" size="md">
              Start Discovering
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const otherUserIds = matches.map((match) =>
    match.user_a === user.id ? match.user_b : match.user_a,
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      department,
      academic_year,
      bio,
      profile_photos (
        storage_path,
        display_order,
        is_primary
      )
    `)
    .in("id", otherUserIds);

  if (profilesError) {
    console.error("Failed to load matched profiles:", profilesError);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-current" />
            Your Matches
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {matches.length} {matches.length === 1 ? "student" : "students"} connected with you
          </p>
        </div>

        <Link href={routes.discover}>
          <Button variant="outline" size="sm">
            Keep Swiping
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.map((match) => {
          const otherUserId =
            match.user_a === user.id ? match.user_b : match.user_a;
          const profile = profileMap.get(otherUserId);

          if (!profile) return null;

          const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          });

          const photoUrl = getPhotoUrl(photos[0]?.storage_path ?? null);

          return (
            <div
              key={match.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-muted overflow-hidden">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={profile.display_name ?? "Matched student"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                    <User className="h-16 w-16 stroke-1" />
                    <span className="text-xs mt-1">No photo</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-700 shadow-xs border border-zinc-200">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {profile.display_name || "DateBu Student"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profile.department || "Student"}
                    {profile.academic_year ? ` • ${profile.academic_year}` : ""}
                  </p>

                  {profile.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  )}
                </div>

                <Link
                  href={`${routes.messages}/${match.id}`}
                  className="block w-full pt-2"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full gap-2 text-xs font-bold"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}