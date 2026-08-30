"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";
import { calculateAge } from "@/lib/utils";

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

const MINIMUM_AGE = 18;
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

  const displayName =
    String(formData.get("display_name") ?? "").trim();

  const dateOfBirth =
    String(formData.get("date_of_birth") ?? "").trim();

  const gender =
    String(formData.get("gender") ?? "").trim();

  const department =
    String(formData.get("department") ?? "").trim();

  const academicYear =
    String(formData.get("academic_year") ?? "").trim();

  const bio =
    String(formData.get("bio") ?? "").trim();

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

  const interestedIn =
    String(formData.get("interested_in") ?? "").trim();

  const minAge = Number.parseInt(
    String(formData.get("min_age") ?? ""),
    10,
  );

  const maxAge = Number.parseInt(
    String(formData.get("max_age") ?? ""),
    10,
  );

  const preferredDepartment =
    String(
      formData.get("preferred_department") ?? "",
    ).trim();

  // ---------------------------------------------------------
  // SERVER-SIDE VALIDATION
  // ---------------------------------------------------------

  const fieldErrors: Record<string, string> = {};

  // Display name
  if (!displayName) {
    fieldErrors.display_name =
      "Display name is required.";
  } else if (displayName.length > 50) {
    fieldErrors.display_name =
      "Display name must be 50 characters or less.";
  }

  // Date of birth
  if (!dateOfBirth) {
    fieldErrors.date_of_birth =
      "Date of birth is required.";
  } else {
    const dob = new Date(`${dateOfBirth}T00:00:00`);

    if (Number.isNaN(dob.getTime())) {
      fieldErrors.date_of_birth =
        "Invalid date format.";
    } else {
      const age = calculateAge(dob);

      if (age === null) {
        fieldErrors.date_of_birth =
          "Invalid date of birth.";
      } else if (age < MINIMUM_AGE) {
        fieldErrors.date_of_birth =
          `You must be at least ${MINIMUM_AGE} years old to use DateBu.`;
      } else if (age > MAXIMUM_AGE) {
        fieldErrors.date_of_birth =
          "Please enter a valid date of birth.";
      }
    }
  }

  // Gender
  if (
    !gender ||
    !GENDER_OPTIONS.includes(
      gender as (typeof GENDER_OPTIONS)[number],
    )
  ) {
    fieldErrors.gender =
      "Please select your gender.";
  }

  // Department
  if (!department) {
    fieldErrors.department =
      "Department is required.";
  } else if (department.length > 100) {
    fieldErrors.department =
      "Department name is too long (max 100 characters).";
  }

  // Academic year
  if (
    !academicYear ||
    !YEAR_OPTIONS.includes(
      academicYear as (typeof YEAR_OPTIONS)[number],
    )
  ) {
    fieldErrors.academic_year =
      "Please select your academic year.";
  }

  // Bio
  if (bio.length > 500) {
    fieldErrors.bio =
      "Bio must be 500 characters or less.";
  }

  // Preferred department
  if (preferredDepartment.length > 100) {
    fieldErrors.preferred_department =
      "Preferred department must be 100 characters or less.";
  }

  // Photos
  if (photoPaths.length > MAX_PHOTOS) {
    fieldErrors.photo_paths =
      `You can save up to ${MAX_PHOTOS} photos.`;
  }

  if (
    new Set(photoPaths).size !==
    photoPaths.length
  ) {
    fieldErrors.photo_paths =
      "Duplicate photos were detected.";
  }

  // Verify every submitted photo belongs to this user.
  const hasInvalidPhotoPath = photoPaths.some(
    (path) =>
      !path.startsWith(`${user.id}/`),
  );

  if (hasInvalidPhotoPath) {
    fieldErrors.photo_paths =
      "One or more photos are invalid.";
  }

  // Interests
  if (interestIds.length === 0) {
    fieldErrors.interests =
      "Select at least one interest.";
  } else if (
    interestIds.length > MAX_INTERESTS
  ) {
    fieldErrors.interests =
      "Too many interests selected.";
  } else if (
    interestIds.some(
      (interestId) => !isUuid(interestId),
    )
  ) {
    fieldErrors.interests =
      "One or more selected interests are invalid.";
  }

  // Interested in
  if (
    !interestedIn ||
    !INTERESTED_IN_OPTIONS.includes(
      interestedIn as (typeof INTERESTED_IN_OPTIONS)[number],
    )
  ) {
    fieldErrors.interested_in =
      "Please select who you are interested in.";
  }

  // Dating preference age range
  if (
    Number.isNaN(minAge) ||
    minAge < MINIMUM_AGE ||
    minAge > MAXIMUM_AGE
  ) {
    fieldErrors.min_age =
      `Minimum age must be between ${MINIMUM_AGE} and ${MAXIMUM_AGE}.`;
  }

  if (
    Number.isNaN(maxAge) ||
    maxAge < MINIMUM_AGE ||
    maxAge > MAXIMUM_AGE
  ) {
    fieldErrors.max_age =
      `Maximum age must be between ${MINIMUM_AGE} and ${MAXIMUM_AGE}.`;
  }

  if (
    !Number.isNaN(minAge) &&
    !Number.isNaN(maxAge) &&
    minAge > maxAge
  ) {
    fieldErrors.min_age =
      "Minimum age cannot be greater than maximum age.";

    fieldErrors.max_age =
      "Maximum age cannot be less than minimum age.";
  }

  // ---------------------------------------------------------
  // STOP BEFORE DATABASE CHANGES
  // ---------------------------------------------------------

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
  //
  // IMPORTANT:
  // Do NOT mark profile_completed=true yet.
  //
  // The profile is only considered complete after every
  // onboarding section has successfully saved.
  // ---------------------------------------------------------

  const { error: profileError } =
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          display_name: displayName,
          date_of_birth: dateOfBirth,
          gender,
          department,
          academic_year: academicYear,
          bio: bio || null,
          profile_completed: false,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

  if (profileError) {
    console.error(
      "Profile save error:",
      profileError,
    );

    return {
      error:
        "Failed to save your profile. Please try again.",
    };
  }

  // ---------------------------------------------------------
  // SAVE PROFILE PHOTOS
  // ---------------------------------------------------------

  const safePhotoPaths =
    photoPaths.filter((path) =>
      path.startsWith(`${user.id}/`),
    );

  if (
    safePhotoPaths.length !==
    photoPaths.length
  ) {
    return {
      error:
        "One or more photos are invalid. Please remove them and upload again.",
    };
  }

  const {
    error: photoDeleteError,
  } = await supabase
    .from("profile_photos")
    .delete()
    .eq("profile_id", user.id);

  if (photoDeleteError) {
    console.error(
      "Profile photo delete error:",
      photoDeleteError,
    );

    return {
      error:
        "Failed to update profile photos. Please try again.",
    };
  }

  if (safePhotoPaths.length > 0) {
    const photoRows =
      safePhotoPaths.map(
        (storage_path, index) => ({
          profile_id: user.id,
          storage_path,
          display_order: index,
          is_primary: index === 0,
        }),
      );

    const {
      error: photoInsertError,
    } = await supabase
      .from("profile_photos")
      .insert(photoRows);

    if (photoInsertError) {
      console.error(
        "Profile photo insert error:",
        photoInsertError,
      );

      return {
        error:
          "Failed to save profile photos. Please try again.",
      };
    }
  }

  // ---------------------------------------------------------
  // SAVE INTERESTS
  // ---------------------------------------------------------

  const {
    error: deleteInterestsError,
  } = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", user.id);

  if (deleteInterestsError) {
    console.error(
      "Interest delete error:",
      deleteInterestsError,
    );

    return {
      error:
        "Failed to update your interests. Please try again.",
    };
  }

  if (interestIds.length > 0) {
    const interestRows =
      interestIds.map(
        (interest_id) => ({
          profile_id: user.id,
          interest_id,
        }),
      );

    const {
      error: insertInterestsError,
    } = await supabase
      .from("profile_interests")
      .insert(interestRows);

    if (insertInterestsError) {
      console.error(
        "Interest insert error:",
        insertInterestsError,
      );

      return {
        error:
          "Failed to save your interests. Please try again.",
      };
    }
  }

  // ---------------------------------------------------------
  // SAVE DATING PREFERENCES
  // ---------------------------------------------------------

  const {
    error: prefError,
  } = await supabase
    .from("dating_preferences")
    .upsert(
      {
        user_id: user.id,
        interested_in:
          interestedInArray,
        min_age: minAge,
        max_age: maxAge,
        preferred_department:
          preferredDepartment || null,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (prefError) {
    console.error(
      "Preferences save error:",
      prefError,
    );

    return {
      error:
        "Failed to save your dating preferences. Please try again.",
    };
  }

  // ---------------------------------------------------------
  // EVERYTHING SUCCEEDED
  //
  // Only NOW mark the profile as completed.
  // ---------------------------------------------------------

  const {
    error: completionError,
  } = await supabase
    .from("profiles")
    .update({
      profile_completed: true,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", user.id);

  if (completionError) {
    console.error(
      "Profile completion error:",
      completionError,
    );

    return {
      error:
        "Your profile was saved, but we could not finish onboarding. Please try again.",
    };
  }

  // ---------------------------------------------------------
  // CACHE INVALIDATION
  // ---------------------------------------------------------

  revalidatePath(routes.app);
  revalidatePath(routes.profile);
  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);
  revalidatePath(routes.settings);

  // ---------------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------------

  redirect(routes.profile);
}