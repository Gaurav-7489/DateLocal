import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Matches",
};

function getPhotoUrl(storagePath: string | null) {
  if (!storagePath) return null;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${storagePath}`;
}

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load matches:", error);

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your matches right now.
        </p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon="💚"
          title="No matches yet"
          description="Your matches will appear here once you and someone else like each other."
        >
          <Link href={routes.discover}>
            <Button variant="primary" size="md">
              Start discovering
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

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your matched profiles.
        </p>
      </div>
    );
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Your Matches
        </h1>

        <p className="mt-2 text-muted-foreground">
          People who liked you back.
        </p>
      </div>

     <div className="grid grid-cols-1 gap-5">
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

          const photoUrl = getPhotoUrl(
            photos[0]?.storage_path ?? null,
          );

          return (
            <div
              key={match.id}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card"
            >
              <div className="aspect-square bg-muted">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${profile.display_name ?? "Profile"} profile photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-5xl">👤</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {profile.display_name || "DateBu student"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.department || "Student"}
                    {profile.academic_year
                      ? ` • ${profile.academic_year}`
                      : ""}
                  </p>
                </div>

                {profile.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {profile.bio}
                  </p>
                )}

              <Link
  href={`${routes.messages}/${match.id}`}
  className="block w-full"
>
  <Button
    variant="primary"
    size="md"
    className="w-full"
  >
    Message
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