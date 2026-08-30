import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import {
  Compass,
  Heart,
  MessageSquare,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load user profile & photos
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      display_name,
      department,
      academic_year,
      bio,
      profile_completed,
      ghost_mode,
      profile_photos (
        storage_path,
        is_primary,
        display_order
      )
    `)
    .eq("id", user.id)
    .maybeSingle();

  // Load match count
  const { count: matchCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  // Load unread / recent message matches
  const isProfileComplete = Boolean(profile?.profile_completed);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";

  const photos = [...(profile?.profile_photos ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const photoPath = photos[0]?.storage_path;
  const photoUrl = getProfilePhotoUrl(photoPath, 160);

  const isVerifiedUser = isUniversityEmail(user.email);

  const quickActions = [
    {
      href: routes.discover,
      icon: Compass,
      title: "Discover",
      description: "Browse campus profiles from your university",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      href: routes.matches,
      icon: Heart,
      title: "Matches",
      description: `${matchCount ?? 0} active student connections`,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      href: routes.messages,
      icon: MessageSquare,
      title: "Chat",
      description: "Continue campus conversations",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      href: routes.profile,
      icon: User,
      title: "Profile",
      description: isProfileComplete ? "View & manage your profile" : "Complete your profile",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Welcome header */}
      <section className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isVerifiedUser && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Email verified
            </div>
          )}
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Your {universityConfig.appName} campus dashboard
          </p>
        </div>

        {isProfileComplete && (
          <Link href={routes.discover}>
            <Button variant="primary" size="md" className="gap-2">
              <Compass className="w-4 h-4" /> Start Swiping
            </Button>
          </Link>
        )}
      </section>

      {/* Profile completion / Status Card */}
      {!isProfileComplete ? (
        <section className="mb-8">
          <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-background p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-foreground">
                    Complete your profile to start matching
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up your {universityConfig.appName} profile to start discovering people at{" "}
                  {universityConfig.name}. Add your interests, photos, and bio to connect.
                </p>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-emerald-600 transition-all"
                      style={{ width: "30%" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-700">
                    Step 1 of 3
                  </span>
                </div>
              </div>

              <Link href={routes.profileSetup}>
                <Button variant="primary" size="md" className="gap-1.5 shrink-0">
                  Set Up Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      ) : (
        <section className="mb-8">
          <Card className="border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500 bg-muted">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={displayName}
                    fill
                    className="object-contain bg-white p-1"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-700 bg-emerald-100">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                  {profile?.ghost_mode && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      👻 Ghost Mode Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile?.department} • {profile?.academic_year}
                </p>
                {profile?.bio && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Link href={routes.profile}>
                  <Button variant="secondary" size="sm">
                    View Profile
                  </Button>
                </Link>
                <Link href={routes.profileSetup}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Quick actions grid */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Quick Navigation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <Card className="h-full transition-all duration-200 group-hover:border-emerald-300 group-hover:shadow-md p-5 flex flex-col justify-between">
                  <div>
                    <div
                      className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${action.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-base">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                    Open {action.title} →
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
