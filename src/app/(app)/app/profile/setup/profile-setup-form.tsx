"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileFormState } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePhotoUploader } from "./components/profile-photo-uploader";

const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "other", label: "Other" },
];

const YEAR_OPTIONS = [
  { value: "1st-year", label: "1st Year" },
  { value: "2nd-year", label: "2nd Year" },
  { value: "3rd-year", label: "3rd Year" },
  { value: "4th-year", label: "4th Year" },
  { value: "5th-year", label: "5th Year" },
  { value: "postgraduate", label: "Postgraduate" },
];

const INTERESTED_IN_OPTIONS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

interface Interest {
  id: string;
  name: string;
}

interface ExistingProfile {
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
}

interface ExistingPreferences {
  interested_in: string[] | null;
  min_age: number | null;
  max_age: number | null;
  preferred_department: string | null;
}

interface ProfileSetupFormProps {
  userId: string;
  interests: Interest[];
  existingProfile: ExistingProfile | null;
  existingPhotoUrls: string[];
  existingPhotoPaths: string[];
  existingInterestIds: string[];
  existingPreferences: ExistingPreferences | null;
}

function deriveInterestedIn(
  arr: string[] | null | undefined,
): string {
  if (!arr || arr.length === 0) return "";

  if (
    arr.includes("everyone") ||
    (arr.includes("men") && arr.includes("women"))
  ) {
    return "everyone";
  }

  return arr[0] ?? "";
}

export function ProfileSetupForm({
  userId,
  interests,
  existingProfile,
  existingPhotoUrls,
  existingPhotoPaths,
  existingInterestIds,
  existingPreferences,
}: ProfileSetupFormProps) {
  const [state, formAction, isPending] =
    useActionState<ProfileFormState, FormData>(
      saveProfile,
      {},
    );

  const [selectedInterests, setSelectedInterests] =
    useState<Set<string>>(
      new Set(existingInterestIds),
    );

  const [photoPaths, setPhotoPaths] =
    useState<string[]>(existingPhotoPaths);

  const [bioLength, setBioLength] = useState(
    existingProfile?.bio?.length ?? 0,
  );

  function toggleInterest(id: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function handlePhotosUploaded(paths: string[]) {
    setPhotoPaths(paths);
  }

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* BASIC INFORMATION */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Basic Information
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="display_name"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Display name{" "}
              <span className="text-destructive">*</span>
            </label>

            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={
                existingProfile?.display_name ?? ""
              }
              maxLength={50}
              required
              placeholder="How others will see you"
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            />

            {fieldErrors.display_name && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.display_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="date_of_birth"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Date of birth{" "}
              <span className="text-destructive">*</span>
            </label>

            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={
                existingProfile?.date_of_birth ?? ""
              }
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              You must be at least 14 years old.
            </p>

            {fieldErrors.date_of_birth && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.date_of_birth}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gender"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Gender{" "}
              <span className="text-destructive">*</span>
            </label>

            <select
              id="gender"
              name="gender"
              defaultValue={existingProfile?.gender ?? ""}
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            >
              <option value="">Select gender</option>

              {GENDER_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.gender && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.gender}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="department"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Department{" "}
              <span className="text-destructive">*</span>
            </label>

            <input
              id="department"
              name="department"
              type="text"
              defaultValue={
                existingProfile?.department ?? ""
              }
              maxLength={100}
              required
              placeholder="e.g. Computer Science"
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            />

            {fieldErrors.department && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.department}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="academic_year"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Academic year{" "}
              <span className="text-destructive">*</span>
            </label>

            <select
              id="academic_year"
              name="academic_year"
              defaultValue={
                existingProfile?.academic_year ?? ""
              }
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            >
              <option value="">Select year</option>

              {YEAR_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.academic_year && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.academic_year}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              defaultValue={existingProfile?.bio ?? ""}
              maxLength={500}
              rows={3}
              placeholder="Tell people a little about yourself..."
              onChange={(event) =>
                setBioLength(event.target.value.length)
              }
              className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            />

            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Optional</span>
              <span>{bioLength}/500</span>
            </div>

            {fieldErrors.bio && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.bio}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* PROFILE PHOTOS */}
      <Card>
        <ProfilePhotoUploader
          userId={userId}
          existingPhotoUrls={existingPhotoUrls}
          existingPhotoPaths={existingPhotoPaths}
          onPhotosUploaded={handlePhotosUploaded}
        />

        {photoPaths.map((path) => (
          <input
            key={path}
            type="hidden"
            name="photo_paths"
            value={path}
          />
        ))}
      </Card>

      {/* INTERESTS */}
      <Card>
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          Interests
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Select at least one interest to help find
          like-minded people.
        </p>

        {interests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No interests available yet. An admin needs to
            add interests to the database.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => {
              const selected =
                selectedInterests.has(interest.id);

              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() =>
                    toggleInterest(interest.id)
                  }
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                    selected
                      ? "border-uni-primary bg-uni-primary text-white"
                      : "border-border bg-background text-foreground hover:border-uni-primary-200 hover:bg-uni-primary-50"
                  }`}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>
        )}

        {Array.from(selectedInterests).map((id) => (
          <input
            key={id}
            type="hidden"
            name="interests"
            value={id}
          />
        ))}

        {fieldErrors.interests && (
          <p className="mt-2 text-xs text-destructive">
            {fieldErrors.interests}
          </p>
        )}
      </Card>

      {/* DATING PREFERENCES */}
      <Card>
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          Dating Preferences
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Help us show you the right people.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="interested_in"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Interested in{" "}
              <span className="text-destructive">*</span>
            </label>

            <select
              id="interested_in"
              name="interested_in"
              defaultValue={deriveInterestedIn(
                existingPreferences?.interested_in,
              )}
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            >
              <option value="">Select preference</option>

              {INTERESTED_IN_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.interested_in && (
              <p className="mt-1 text-xs text-destructive">
                {fieldErrors.interested_in}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="min_age"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Min age{" "}
                <span className="text-destructive">*</span>
              </label>

              <input
                id="min_age"
                name="min_age"
                type="number"
                min={14}
                max={60}
                defaultValue={
                  existingPreferences?.min_age ?? 14
                }
                required
                className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
              />

              {fieldErrors.min_age && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.min_age}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="max_age"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Max age{" "}
                <span className="text-destructive">*</span>
              </label>

              <input
                id="max_age"
                name="max_age"
                type="number"
                min={14}
                max={60}
                defaultValue={
                  existingPreferences?.max_age ?? 60
                }
                required
                className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
              />

              {fieldErrors.max_age && (
                <p className="mt-1 text-xs text-destructive">
                  {fieldErrors.max_age}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="preferred_department"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Preferred department
            </label>

            <input
              id="preferred_department"
              name="preferred_department"
              type="text"
              defaultValue={
                existingPreferences?.preferred_department ?? ""
              }
              placeholder="Any department"
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-uni-primary"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Leave blank for no preference.
            </p>
          </div>
        </div>
      </Card>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}