"use client";

import { useState } from "react";
import { likeProfile } from "./actions";
import { Button } from "@/components/ui/button";

type Interest = {
  id: string;
  name: string;
};

type ProfileInterest = {
  interests: Interest | Interest[] | null;
};

type ProfilePhoto = {
  storage_path: string;
  display_order: number;
  is_primary: boolean;
};

type Profile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
  profile_photos: ProfilePhoto[] | null;
  profile_interests: ProfileInterest[] | null;
  profile_photo_url: string | null;
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference = today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

export default function DiscoverClient({
  profiles,
}: {
  profiles: Profile[];
}) {
  const [remainingProfiles, setRemainingProfiles] = useState(profiles);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLike(profileId: string) {
    setLoading(true);
    setMessage(null);

    const result = await likeProfile(profileId);

    if (result.error) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    setRemainingProfiles((current) =>
      current.filter((profile) => profile.id !== profileId),
    );

    setMessage(result.matched ? "It's a match!" : "Liked!");

    setLoading(false);
  }

function handlePass(profileId: string) {
  setRemainingProfiles((current) =>
    current.filter((profile) => profile.id !== profileId),
  );

  setMessage(null);
}

  if (remainingProfiles.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-10">
          <div className="text-4xl">🔍</div>

          <h1 className="mt-4 text-2xl font-bold text-foreground">
            No more profiles right now
          </h1>

          <p className="mt-2 text-muted-foreground">
            Check back later when more students join DateBu.
          </p>
        </div>
      </div>
    );
  }

  const profile = remainingProfiles[0];

  if (!profile) {
    return null;
  }

  const age = calculateAge(profile.date_of_birth);

  const interests =
    profile.profile_interests?.flatMap((item) => {
      if (!item.interests) return [];

      return Array.isArray(item.interests)
        ? item.interests
        : [item.interests];
    }) ?? [];

  const photoUrl = profile.profile_photo_url;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Discover
        </h1>

        <p className="mt-2 text-muted-foreground">
          Find someone from your university.
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
        <div className="flex aspect-[4/3] items-center justify-center bg-muted">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${profile.display_name ?? "Profile"} profile photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-5xl">👤</div>

              <p className="mt-2 text-sm text-muted-foreground">
                No profile photo yet
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.display_name || "DateBu student"}

              {age !== null && (
                <span className="ml-2 font-normal text-muted-foreground">
                  {age}
                </span>
              )}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.department || "Student"}

              {profile.academic_year
                ? ` • ${profile.academic_year}`
                : ""}
            </p>
          </div>

          {profile.bio && (
            <p className="text-sm leading-6 text-foreground">
              {profile.bio}
            </p>
          )}

          {interests.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Interests
              </h3>

              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest.id}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {interest.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-md border border-border bg-muted px-4 py-3 text-center text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="lg"
              disabled={loading}
              onClick={() => handlePass(profile.id)}
            >
              {loading ? "..." : "Pass"}
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={loading}
              onClick={() => handleLike(profile.id)}
            >
              {loading ? "..." : "Like"}
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Your choices are private.
      </p>
    </div>
  );
}