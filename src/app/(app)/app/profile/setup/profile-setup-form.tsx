"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileFormState } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePhotoUploader } from "./components/profile-photo-uploader";

const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
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
  existingPhotoUrl: string | null;
  existingPhotoPath: string | null;
  existingInterestIds: string[];
  existingPreferences: ExistingPreferences | null;
}

function deriveInterestedIn(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "everyone";
  if (arr.includes("everyone") || (arr.includes("men") && arr.includes("women"))) return "everyone";
  return arr[0] ?? "everyone";
}

export function ProfileSetupForm({
  userId,
  interests,
  existingProfile,
  existingPhotoUrl,
  existingPhotoPath,
  existingInterestIds,
  existingPreferences,
}: ProfileSetupFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    {},
  );

  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(existingInterestIds),
  );

  const [bioLength, setBioLength] = useState(existingProfile?.bio?.length ?? 0);
  const [photoPath, setPhotoPath] = useState<string | null>(existingPhotoPath);

  function toggleInterest(id: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {/* Form-level error */}
      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {state.error}
        </div>
      )}

      {/* ===== BASIC INFO ===== */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-bold text-foreground">
          Basic Information
        </h2>
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="mb-1 block text-xs font-semibold text-foreground">
              Display name <span className="text-destructive">*</span>
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={existingProfile?.display_name ?? ""}
              maxLength={50}
              required
              placeholder="How others will see you (e.g. Alex Sharma)"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {fe.display_name && <p className="mt-1 text-xs text-destructive">{fe.display_name}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="date_of_birth" className="mb-1 block text-xs font-semibold text-foreground">
              Date of birth <span className="text-destructive">*</span>
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={existingProfile?.date_of_birth ?? ""}
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">You must be at least 18 years old.</p>
            {fe.date_of_birth && <p className="mt-1 text-xs text-destructive">{fe.date_of_birth}</p>}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-semibold text-foreground">
              Gender <span className="text-destructive">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={existingProfile?.gender ?? ""}
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            {fe.gender && <p className="mt-1 text-xs text-destructive">{fe.gender}</p>}
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="mb-1 block text-xs font-semibold text-foreground">
              Department <span className="text-destructive">*</span>
            </label>
            <input
              id="department"
              name="department"
              type="text"
              defaultValue={existingProfile?.department ?? ""}
              maxLength={100}
              required
              placeholder="e.g. Computer Science & Engineering"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {fe.department && <p className="mt-1 text-xs text-destructive">{fe.department}</p>}
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academic_year" className="mb-1 block text-xs font-semibold text-foreground">
              Academic year <span className="text-destructive">*</span>
            </label>
            <select
              id="academic_year"
              name="academic_year"
              defaultValue={existingProfile?.academic_year ?? ""}
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select academic year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
            {fe.academic_year && <p className="mt-1 text-xs text-destructive">{fe.academic_year}</p>}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="mb-1 block text-xs font-semibold text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={existingProfile?.bio ?? ""}
              maxLength={500}
              rows={3}
              placeholder="Tell other students about yourself, your hobbies, favorite campus spots..."
              onChange={(e) => setBioLength(e.target.value.length)}
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Optional</span>
              <span>{bioLength}/500</span>
            </div>
            {fe.bio && <p className="mt-1 text-xs text-destructive">{fe.bio}</p>}
          </div>
        </div>
      </Card>

      {/* ===== PROFILE PHOTO ===== */}
      <Card className="p-6">
        <ProfilePhotoUploader
          userId={userId}
          existingPhotoUrl={existingPhotoUrl}
          onPhotoUploaded={(path) => setPhotoPath(path)}
        />

        {photoPath && (
          <input
            type="hidden"
            name="photo_path"
            value={photoPath}
          />
        )}
      </Card>

      {/* ===== INTERESTS ===== */}
      <Card className="p-6">
        <h2 className="mb-1 text-base font-bold text-foreground">Interests</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Select at least one interest to help discover like-minded campus peers.
        </p>

        {interests.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No interests listed yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => {
              const isSelected = selectedInterests.has(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-border bg-background text-foreground hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Hidden inputs for selected interests */}
        {Array.from(selectedInterests).map((id) => (
          <input key={id} type="hidden" name="interests" value={id} />
        ))}

        {fe.interests && <p className="mt-2 text-xs text-destructive">{fe.interests}</p>}
      </Card>

      {/* ===== DATING PREFERENCES ===== */}
      <Card className="p-6">
        <h2 className="mb-1 text-base font-bold text-foreground">Dating & Matching Preferences</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Control who appears in your discovery deck.
        </p>
        <div className="space-y-4">
          {/* Interested In */}
          <div>
            <label htmlFor="interested_in" className="mb-1 block text-xs font-semibold text-foreground">
              Interested in <span className="text-destructive">*</span>
            </label>
            <select
              id="interested_in"
              name="interested_in"
              defaultValue={deriveInterestedIn(existingPreferences?.interested_in)}
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select preference</option>
              {INTERESTED_IN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {fe.interested_in && <p className="mt-1 text-xs text-destructive">{fe.interested_in}</p>}
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min_age" className="mb-1 block text-xs font-semibold text-foreground">
                Min age <span className="text-destructive">*</span>
              </label>
              <input
                id="min_age"
                name="min_age"
                type="number"
                min={18}
                max={99}
                defaultValue={existingPreferences?.min_age ?? 18}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {fe.min_age && <p className="mt-1 text-xs text-destructive">{fe.min_age}</p>}
            </div>
            <div>
              <label htmlFor="max_age" className="mb-1 block text-xs font-semibold text-foreground">
                Max age <span className="text-destructive">*</span>
              </label>
              <input
                id="max_age"
                name="max_age"
                type="number"
                min={18}
                max={99}
                defaultValue={existingPreferences?.max_age ?? 25}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {fe.max_age && <p className="mt-1 text-xs text-destructive">{fe.max_age}</p>}
            </div>
          </div>

          {/* Preferred Department */}
          <div>
            <label htmlFor="preferred_department" className="mb-1 block text-xs font-semibold text-foreground">
              Preferred department
            </label>
            <input
              id="preferred_department"
              name="preferred_department"
              type="text"
              defaultValue={existingPreferences?.preferred_department ?? ""}
              placeholder="Any department (or specific like BCA, B.Tech)"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Leave blank for all departments.</p>
          </div>
        </div>
      </Card>

      {/* ===== SUBMIT ===== */}
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="lg" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving Profile..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
