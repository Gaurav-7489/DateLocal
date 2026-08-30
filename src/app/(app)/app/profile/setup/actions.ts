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
const YEAR_OPTIONS = ["1st-year", "2nd-year", "3rd-year", "4th-year", "5th-year", "postgraduate"] as const;
const INTERESTED_IN_OPTIONS = ["men", "women", "everyone"] as const;

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save your profile." };
  }

  // ---- Extract fields ----
  const displayName = (formData.get("display_name") as string)?.trim() ?? "";
  const dateOfBirth = formData.get("date_of_birth") as string;
  const gender = formData.get("gender") as string;
  const department = (formData.get("department") as string)?.trim() ?? "";
  const academicYear = formData.get("academic_year") as string;
  const bio = (formData.get("bio") as string)?.trim() ?? "";
  const photoPaths = formData
    .getAll("photo_paths")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const interestIds = formData.getAll("interests") as string[];
  const interestedIn = formData.get("interested_in") as string;
  const minAge = parseInt(formData.get("min_age") as string, 10);
  const maxAge = parseInt(formData.get("max_age") as string, 10);
  const preferredDepartment = (formData.get("preferred_department") as string)?.trim() ?? "";

  // ---- Server-Side Validation ----
  const fieldErrors: Record<string, string> = {};

  if (!displayName) {
    fieldErrors.display_name = "Display name is required.";
  } else if (displayName.length > 50) {
    fieldErrors.display_name = "Display name must be 50 characters or less.";
  }

  if (!dateOfBirth) {
    fieldErrors.date_of_birth = "Date of birth is required.";
  } else {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      fieldErrors.date_of_birth = "Invalid date format.";
    } else {
      const age = calculateAge(dob);
      if (age !== null && age < 14) {
        fieldErrors.date_of_birth = "You must be at least 14 years old to use DateBu.";
      } else if (age !== null && age > 60) {
        fieldErrors.date_of_birth = "Please enter a valid date of birth.";
      } else if (age === null) {
        fieldErrors.date_of_birth = "Invalid date of birth.";
      }
    }
  }

  if (!gender || !GENDER_OPTIONS.includes(gender as typeof GENDER_OPTIONS[number])) {
    fieldErrors.gender = "Please select your gender.";
  }

  if (!department) {
    fieldErrors.department = "Department is required.";
  } else if (department.length > 100) {
    fieldErrors.department = "Department name is too long (max 100 characters).";
  }

  if (!academicYear || !YEAR_OPTIONS.includes(academicYear as typeof YEAR_OPTIONS[number])) {
    fieldErrors.academic_year = "Please select your academic year.";
  }

  if (bio.length > 500) {
    fieldErrors.bio = "Bio must be 500 characters or less.";
  }

  if (photoPaths.length > 6 || new Set(photoPaths).size !== photoPaths.length) {
    fieldErrors.photo_paths = "You can save up to 6 unique photos.";
  }

  if (interestIds.some((interestId) => !isUuid(interestId))) {
    fieldErrors.interests = "One or more selected interests are invalid.";
  }

  if (interestIds.length === 0) {
    fieldErrors.interests = "Select at least one interest.";
  }

  if (!interestedIn || !INTERESTED_IN_OPTIONS.includes(interestedIn as typeof INTERESTED_IN_OPTIONS[number])) {
    fieldErrors.interested_in = "Please select who you are interested in.";
  }

  if (isNaN(minAge) || minAge < 14 || minAge > 60) {
    fieldErrors.min_age = "Minimum age must be between 14 and 60.";
  }
  if (isNaN(maxAge) || maxAge < 14 || maxAge > 60) {
    fieldErrors.max_age = "Maximum age must be between 14 and 60.";
  }
  if (!isNaN(minAge) && !isNaN(maxAge) && minAge > maxAge) {
    fieldErrors.min_age = "Minimum age cannot be greater than maximum age.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // ---- Convert interested_in to array for DB ----
  const interestedInArray =
    interestedIn === "everyone" ? ["men", "women", "everyone"] : [interestedIn];

  // ---- Save profile ----
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      date_of_birth: dateOfBirth,
      gender,
      department,
      academic_year: academicYear,
      bio: bio || null,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Profile save error:", profileError);
    return { error: "Failed to save profile. Please try again." };
  }

  // ---- Save profile photos ----
  // Only accept paths belonging to the currently authenticated user.
  const safePhotoPaths = photoPaths.filter((path) =>
    path.startsWith(`${user.id}/`),
  );

  const { error: photoDeleteError } = await supabase
    .from("profile_photos")
    .delete()
    .eq("profile_id", user.id);

  if (photoDeleteError) {
    console.error("Profile photo delete error:", photoDeleteError);
    return {
      error: "Failed to update profile photos. Please try again.",
    };
  }

  if (safePhotoPaths.length > 0) {
    const photoRows = safePhotoPaths.map((storage_path, index) => ({
      profile_id: user.id,
      storage_path,
      display_order: index,
      is_primary: index === 0,
    }));

    const { error: photoInsertError } = await supabase
      .from("profile_photos")
      .insert(photoRows);

    if (photoInsertError) {
      console.error("Profile photo insert error:", photoInsertError);
      return {
        error: "Failed to save profile photos. Please try again.",
      };
    }
  }

  // ---- Save interests ----
  const { error: deleteInterestsError } = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", user.id);

  if (deleteInterestsError) {
    console.error("Interest delete error:", deleteInterestsError);
  }

  if (interestIds.length > 0) {
    const rows = interestIds.map((interest_id) => ({
      profile_id: user.id,
      interest_id,
    }));

    const { error: insertInterestsError } = await supabase
      .from("profile_interests")
      .insert(rows);

    if (insertInterestsError) {
      console.error("Interest insert error:", insertInterestsError);
      return { error: "Failed to save interests. Please try again." };
    }
  }

  // ---- Save dating preferences ----
  const { error: prefError } = await supabase.from("dating_preferences").upsert(
    {
      user_id: user.id,
      interested_in: interestedInArray,
      min_age: minAge,
      max_age: maxAge,
      preferred_department: preferredDepartment || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (prefError) {
    console.error("Preferences save error:", prefError);
    return { error: "Failed to save preferences. Please try again." };
  }

  revalidatePath(routes.app);
  revalidatePath(routes.profile);
  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.settings);

  redirect(routes.profile);
}
