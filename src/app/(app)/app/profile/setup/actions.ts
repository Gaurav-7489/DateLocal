"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";
import { calculateAge } from "@/lib/utils";
import { featureFlags } from "@/config/features";

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const GENDER_OPTIONS = ["man", "woman", "other"] as const;

const YEAR_OPTIONS = [
  "1st-year",
  "2nd-year",
  "3rd-year",
  "4th-year",
  "5th-year",
  "postgraduate",
] as const;

const INTERESTED_IN_OPTIONS = [
  "men",
  "women",
  "everyone",
] as const;

const MINIMUM_AGE = 17;
const MAXIMUM_AGE = 60;
const MAX_PHOTOS = 6;
const MAX_INTERESTS = 20;

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient();

  // ---------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Your session has expired. Please sign in again.",
    };
  }

  // ---------------------------------------------------------
  // EXTRACT FORM DATA
  // ---------------------------------------------------------

  const displayName = String(formData.get("display_name") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const academicYear = String(formData.get("academic_year") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  // Campus Identity & Badges
  const campusResidency = String(formData.get("campus_residency") ?? "").trim();
  const campusHangout = String(formData.get("campus_hangout") ?? "").trim();
  const relationshipGoal = String(formData.get("relationship_goal") ?? "").trim();
  const zodiac = String(formData.get("zodiac") ?? "").trim();
  const sleepHabit = String(formData.get("sleep_habit") ?? "").trim();
  const caffeinePref = String(formData.get("caffeine_pref") ?? "").trim();
  const weekendVibe = String(formData.get("weekend_vibe") ?? "").trim();
  const promptQuestion = String(formData.get("prompt_question") ?? "").trim();
  const promptAnswer = String(formData.get("prompt_answer") ?? "").trim();

  const photoPaths = Array.from(
    new Set(
      formData
        .getAll("photo_paths")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  const interestIds = Array.from(
    new Set(
      formData
        .getAll("interests")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  const interestedIn = String(formData.get("interested_in") ?? "").trim();
  const minAge = Number.parseInt(String(formData.get("min_age") ?? ""), 10);
  const maxAge = Number.parseInt(String(formData.get("max_age") ?? ""), 10);

  // ---------------------------------------------------------
  // SERVER-SIDE VALIDATION
  // ---------------------------------------------------------

  const fieldErrors: Record<string, string> = {};

  // Display name
  if (!displayName) {
    fieldErrors.display_name = "Display name is required.";
  } else if (displayName.length > 50) {
    fieldErrors.display_name = "Display name must be 50 characters or less.";
  }

  // Timezone-safe Date of birth calculation
  if (!dateOfBirth) {
    fieldErrors.date_of_birth = "Date of birth is required.";
  } else {
    const parts = dateOfBirth.split("-").map((p) => Number.parseInt(p, 10));
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      fieldErrors.date_of_birth = "Invalid date format.";
    } else {
      const [year, month, day] = parts as [number, number, number];
      const dob = new Date(year, month - 1, day);

      if (Number.isNaN(dob.getTime())) {
        fieldErrors.date_of_birth = "Invalid date format.";
      } else {
        const age = calculateAge(dob);

        if (age === null) {
          fieldErrors.date_of_birth = "Invalid date of birth.";
        } else if (age < MINIMUM_AGE) {
          fieldErrors.date_of_birth = `You must be at least ${MINIMUM_AGE} years old to use DateBu.`;
        } else if (age > MAXIMUM_AGE) {
          fieldErrors.date_of_birth = "Please enter a valid date of birth.";
        }
      }
    }
  }

  // Gender
  if (
    !gender ||
    !GENDER_OPTIONS.includes(gender as (typeof GENDER_OPTIONS)[number])
  ) {
    fieldErrors.gender = "Please select your gender.";
  }

  // Department
  if (!department) {
    fieldErrors.department = "Department is required.";
  }

  // Academic year
  if (
    !academicYear ||
    !YEAR_OPTIONS.includes(academicYear as (typeof YEAR_OPTIONS)[number])
  ) {
    fieldErrors.academic_year = "Please select your academic year.";
  }

  // Bio
  if (bio.length > 500) {
    fieldErrors.bio = "Bio must be 500 characters or less.";
  }

  // Campus Prompt length check
  if (promptAnswer.length > 300) {
    fieldErrors.prompt_answer = "Prompt answer must be 300 characters or less.";
  }

  // Photos: Must contain at least 1 photo for Slot 1 (Primary)
  const safePhotoPaths = photoPaths.filter((path) =>
    path.startsWith(`${user.id}/`),
  );

  if (safePhotoPaths.length === 0) {
    fieldErrors.photo_paths = "Add your main profile photo (Slot 1) to continue.";
  } else if (safePhotoPaths.length > MAX_PHOTOS) {
    fieldErrors.photo_paths = `You can save up to ${MAX_PHOTOS} photos.`;
  }

  // Interests
  if (interestIds.length === 0) {
    fieldErrors.interests = "Select at least one interest.";
  } else if (interestIds.length > MAX_INTERESTS) {
    fieldErrors.interests = "Too many interests selected.";
  } else if (interestIds.some((interestId) => !isUuid(interestId))) {
    fieldErrors.interests = "One or more selected interests are invalid.";
  }

  // Interested in
  if (
    !interestedIn ||
    !INTERESTED_IN_OPTIONS.includes(
      interestedIn as (typeof INTERESTED_IN_OPTIONS)[number],
    )
  ) {
    fieldErrors.interested_in = "Please select who you are interested in.";
  }

  // Dating preference age range
  if (
    Number.isNaN(minAge) ||
    minAge < MINIMUM_AGE ||
    minAge > MAXIMUM_AGE
  ) {
    fieldErrors.min_age = `Minimum age must be between ${MINIMUM_AGE} and ${MAXIMUM_AGE}.`;
  }

  if (
    Number.isNaN(maxAge) ||
    maxAge < MINIMUM_AGE ||
    maxAge > MAXIMUM_AGE
  ) {
    fieldErrors.max_age = `Maximum age must be between ${MINIMUM_AGE} and ${MAXIMUM_AGE}.`;
  }

  if (!Number.isNaN(minAge) && !Number.isNaN(maxAge) && minAge > maxAge) {
    fieldErrors.min_age = "Minimum age cannot be greater than maximum age.";
    fieldErrors.max_age = "Maximum age cannot be less than minimum age.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
    };
  }

  // ---------------------------------------------------------
  // CONVERT INTERESTED_IN FOR DATABASE
  // ---------------------------------------------------------

  const interestedInArray =
    interestedIn === "everyone"
      ? ["men", "women", "everyone"]
      : [interestedIn];

  // ---------------------------------------------------------
  // SAVE PROFILE
  // ---------------------------------------------------------

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      date_of_birth: dateOfBirth,
      gender,
      department,
      academic_year: academicYear,
      bio: bio || null,
      campus_residency: campusResidency || null,
      campus_hangout: campusHangout || null,
      relationship_goal: relationshipGoal || null,
      zodiac: zodiac || null,
      sleep_habit: sleepHabit || null,
      caffeine_pref: caffeinePref || null,
      weekend_vibe: weekendVibe || null,
      prompt_question: promptQuestion || null,
      prompt_answer: promptAnswer || null,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    console.error("Profile save error:", profileError);
    return {
      error: "Failed to save your profile. Please try again.",
    };
  }

  // ---------------------------------------------------------
  // SYNC PROFILE PHOTOS — DIFF ONLY
  // ---------------------------------------------------------
  //
  // Do NOT delete/reinsert every photo on every profile edit.
  // This keeps unchanged photos stable and prevents unnecessary
  // face-verification invalidation.
  //

  const { data: existingPhotoRows, error: existingPhotosError } =
    await supabase
      .from("profile_photos")
      .select("id, storage_path, display_order, is_primary")
      .eq("profile_id", user.id)
      .order("display_order", { ascending: true });

  if (existingPhotosError) {
    console.error("Existing profile photos fetch error:", existingPhotosError);
    return {
      error: "Failed to load your existing profile photos. Please try again.",
    };
  }

  const existingRows = existingPhotoRows ?? [];
  const existingByPath = new Map(
    existingRows.map((row) => [row.storage_path, row]),
  );

  const desiredPaths = safePhotoPaths;

  // Photos that no longer exist in the submitted deck.
  const removedRows = existingRows.filter(
    (row) => !desiredPaths.includes(row.storage_path),
  );

  // Delete only removed photo metadata.
  if (removedRows.length > 0) {
    const removedIds = removedRows.map((row) => row.id);

    const { error: photoDeleteError } = await supabase
      .from("profile_photos")
      .delete()
      .in("id", removedIds);

    if (photoDeleteError) {
      console.error("Profile photo delete error:", photoDeleteError);
      return {
        error: "Failed to remove old profile photos. Please try again.",
      };
    }

    // Best-effort cleanup of the corresponding storage objects.
    const removedPaths = removedRows.map((row) => row.storage_path);

    const { error: storageDeleteError } = await supabase.storage
      .from("profile-photos")
      .remove(removedPaths);

    if (storageDeleteError) {
      // The database is already correct. Do not fail the profile save
      // because an old storage object could not be cleaned up.
      console.warn(
        "Profile photo storage cleanup warning:",
        storageDeleteError.message,
      );
    }
  }

  // Insert only genuinely new photos.
  const newPaths = desiredPaths.filter(
    (path) => !existingByPath.has(path),
  );

  if (newPaths.length > 0) {
    const newRows = newPaths.map((storage_path) => {
      const displayOrder = desiredPaths.indexOf(storage_path);

      return {
        profile_id: user.id,
        storage_path,
        display_order: displayOrder,
        is_primary: displayOrder === 0,
      };
    });

    const { error: photoInsertError } = await supabase
      .from("profile_photos")
      .insert(newRows);

    if (photoInsertError) {
      console.error("Profile photo insert error:", photoInsertError);
      return {
        error: "Failed to save new profile photos. Please try again.",
      };
    }
  }

  // Update ordering / primary status only when it actually changed.
  // This avoids unnecessary UPDATE triggers for untouched photos.
  for (let index = 0; index < desiredPaths.length; index++) {
    const path = desiredPaths[index];
    const existing = existingByPath.get(path);

    if (!existing) continue;

    const nextIsPrimary = index === 0;

    if (
      existing.display_order !== index ||
      existing.is_primary !== nextIsPrimary
    ) {
      const { error: photoUpdateError } = await supabase
        .from("profile_photos")
        .update({
          display_order: index,
          is_primary: nextIsPrimary,
        })
        .eq("id", existing.id);

      if (photoUpdateError) {
        console.error("Profile photo order update error:", photoUpdateError);
        return {
          error: "Failed to update your photo order. Please try again.",
        };
      }
    }
  }

  // ---------------------------------------------------------
  // SAVE INTERESTS
  // ---------------------------------------------------------

  const { error: deleteInterestsError } = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", user.id);

  if (deleteInterestsError) {
    console.error("Interest delete error:", deleteInterestsError);
    return {
      error: "Failed to update your interests. Please try again.",
    };
  }

  if (interestIds.length > 0) {
    const interestRows = interestIds.map((interest_id) => ({
      profile_id: user.id,
      interest_id,
    }));

    const { error: insertInterestsError } = await supabase
      .from("profile_interests")
      .insert(interestRows);

    if (insertInterestsError) {
      console.error("Interest insert error:", insertInterestsError);
      return {
        error: "Failed to save your interests. Please try again.",
      };
    }
  }

  // ---------------------------------------------------------
  // SAVE DATING PREFERENCES
  // ---------------------------------------------------------

  const { error: prefError } = await supabase
    .from("dating_preferences")
    .upsert(
      {
        user_id: user.id,
        interested_in: interestedInArray,
        min_age: minAge,
        max_age: maxAge,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (prefError) {
    console.error("Preferences save error:", prefError);
    return {
      error: "Failed to save your dating preferences. Please try again.",
    };
  }

  // ---------------------------------------------------------
  // COMPLETE PROFILE SETUP
  // ---------------------------------------------------------

  const { error: completionError } = await supabase
    .from("profiles")
    .update({
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (completionError) {
    console.error("Profile completion error:", completionError);
    return {
      error: "Your profile was saved, but we could not finish onboarding. Please try again.",
    };
  }

  revalidatePath(routes.app);
  revalidatePath(routes.profile);
  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);
  revalidatePath(routes.settings);
  revalidatePath(routes.verifyFace);

  // If camera verification is enabled, send user to face match
  if (featureFlags.ENABLE_CAMERA_VERIFICATION) {
    redirect(routes.verifyFace);
  }

  redirect(routes.profile);
}