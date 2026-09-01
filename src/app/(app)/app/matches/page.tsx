import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";
import {
  MessageCircle,
  Compass,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Your Matches | DateBu",
};

export const dynamic = "force-dynamic";

type MatchProfile = {
  id: string;
  display_name: string;
  date_of_birth: string;
  gender: string;
  department: string;
  academic_year: string;
  bio: string | null;
  campus_residency: string | null;
  relationship_goal: string | null;
  zodiac: string | null;
  profile_photos: Array<{
    storage_path: string;
    display_order: number;
    is_primary: boolean;
  }> | null;
};

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  const [
    { data: blocksCreated },
    { data: blocksReceived },
    { data: rawMatches, error: matchesError },
  ] = await Promise.all([
    supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id),
    supabase.from("blocks").select("blocker_id").eq("blocked_id", user.id),
    supabase
      .from("matches")
      .select("id, user_a, user_b, created_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false }),
  ]);

  const blockedUserIds = new Set<string>([
    ...(blocksCreated ?? []).map((b) => b.blocked_id),
    ...(blocksReceived ?? []).map((b) => b.blocker_id),
  ]);

  if (matchesError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center font-sans">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          We couldn&apos;t load your matches right now.
        </p>
      </div>
    );
  }

  const matches = (rawMatches ?? []).filter((m) => {
    const otherId = m.user_a === user.id ? m.user_b : m.user_a;
    return !blockedUserIds.has(otherId);
  });

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 font-sans">
        <EmptyState
          icon="💖"
          title="No matches yet"
          description="Keep swiping in Discover! When you and another student match, they will appear right here."
        >
          <Link href={routes.discover}>
            <Button variant="primary" size="md" className="gap-2 rounded-2xl">
              <Compass className="w-4 h-4" /> Start Swiping
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const otherUserIds = matches.map((match) =>
    match.user_a === user.id ? match.user_b : match.user_a,
  );

  // Profiles are private and cannot be queried directly by other users.
  // Use the server-side RPC, which only exposes profiles belonging to an
  // actual match with the current user and excludes blocked users.
  const { data: profiles, error: profilesError } = await supabase.rpc(
    "get_match_profiles",
    { p_user_ids: otherUserIds },
  );

  if (profilesError) {
    console.error("Failed to load match profiles:", profilesError);
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center font-sans">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          We found your matches, but couldn&apos;t load their profiles. Please try again.
        </p>
      </div>
    );
  }

  const typedProfiles = (profiles ?? []) as MatchProfile[];
  const profileMap = new Map(
    typedProfiles.map((profile) => [profile.id, profile]),
  );

  return (
    <div className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Your Matches
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium">
            {matches.length} student{matches.length === 1 ? "" : "s"} connected with you
          </p>
        </div>

        <Link
          href={routes.discover}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors shadow-2xs active:scale-95"
        >
          Keep Swiping
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {matches.map((match, idx) => {
          const otherUserId =
            match.user_a === user.id ? match.user_b : match.user_a;
          const profile = profileMap.get(otherUserId);
          if (!profile) return null;

          const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          });

          const photoUrl = getProfilePhotoUrl(photos[0]?.storage_path, 320);
          const age = calculateAge(profile.date_of_birth);

          return (
            <div
              key={match.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={profile.display_name ?? "Student"}
                    fill
                    priority={idx < 4}
                    decoding="async"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-2xl">
                    {profile.display_name?.charAt(0) ?? "?"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-emerald-400 backdrop-blur-xs border border-white/10 shadow-xs pointer-events-none">
                  <ShieldCheck className="w-2.5 h-2.5" /> Student
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                  <h2 className="text-sm font-black truncate leading-tight">
                    {profile.display_name || "Student"}
                    {age !== null && <span className="font-light text-xs opacity-90">, {age}</span>}
                  </h2>

                  <p className="text-[10px] text-zinc-300 font-medium truncate mt-0.5">
                    {profile.department?.split("&")[0]?.trim()} • {profile.academic_year}
                  </p>

                  {profile.campus_residency && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-zinc-300 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {profile.campus_residency}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2 bg-card">
                <Link
                  href={`${routes.messages}/${match.id}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
