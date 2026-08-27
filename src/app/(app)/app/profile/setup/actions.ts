"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const GENDER_OPTIONS = ["man", "woman", "non-binary", "other", "prefer-not-to-say"] as const;
const YEAR_OPTIONS = ["1st-year", "2nd-year", "3rd-year", "4th-year", "5th-year", "postgraduate"] as const;
const INTERESTED_IN_OPTIONS = ["men", "women", "everyone"] as const;

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // ---- Extract fields ----
  const displayName = (formData.get("display_name") as string)?.trim() ?? "";
  const dateOfBirth = formData.get("date_of_birth") as string;
  const gender = formData.get("gender") as string;
  const department = (formData.get("department") as string)?.trim() ?? "";
  const academicYear = formData.get("academic_year") as string;
const bio = (formData.get("bio") as string)?.trim() ?? "";
const photoPath = (formData.get("photo_path") as string)?.trim() ?? "";
const interestIds = formData.getAll("interests") as string[];
  const interestedIn = formData.get("interested_in") as string;
  const minAge = parseInt(formData.get("min_age") as string, 10);
  const maxAge = parseInt(formData.get("max_age") as string, 10);
  const preferredDepartment = (formData.get("preferred_department") as string)?.trim() ?? "";

  // ---- Validation ----
  const fieldErrors: Record<string, string> = {};

  if (!displayName) fieldErrors.display_name = "Display name is required.";
  else if (displayName.length > 50) fieldErrors.display_name = "Display name must be 50 characters or less.";

  if (!dateOfBirth) {
    fieldErrors.date_of_birth = "Date of birth is required.";
  } else {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      fieldErrors.date_of_birth = "Invalid date.";
    } else if (calculateAge(dob) < 18) {
      fieldErrors.date_of_birth = "You must be at least 18 years old.";
    }
  }

  if (!gender || !GENDER_OPTIONS.includes(gender as typeof GENDER_OPTIONS[number])) {
    fieldErrors.gender = "Please select your gender.";
  }

  if (!department) fieldErrors.department = "Department is required.";
  else if (department.length > 100) fieldErrors.department = "Department name is too long.";

  if (!academicYear || !YEAR_OPTIONS.includes(academicYear as typeof YEAR_OPTIONS[number])) {
    fieldErrors.academic_year = "Please select your academic year.";
  }

  if (bio.length > 500) fieldErrors.bio = "Bio must be 500 characters or less.";

  if (interestIds.length === 0) fieldErrors.interests = "Select at least one interest.";

  if (!interestedIn || !INTERESTED_IN_OPTIONS.includes(interestedIn as typeof INTERESTED_IN_OPTIONS[number])) {
    fieldErrors.interested_in = "Please select who you're interested in.";
  }

  if (isNaN(minAge) || minAge < 18 || minAge > 99) fieldErrors.min_age = "Minimum age must be 18–99.";
  if (isNaN(maxAge) || maxAge < 18 || maxAge > 99) fieldErrors.max_age = "Maximum age must be 18–99.";
  if (!isNaN(minAge) && !isNaN(maxAge) && minAge > maxAge) {
    fieldErrors.min_age = "Minimum age cannot be greater than maximum age.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // ---- Convert interested_in to array for DB ----
  const interestedInArray =
    interestedIn === "everyone" ? ["men", "women"] : [interestedIn];

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
    // ---- Save profile photo ----
  if (photoPath) {
    const { error: photoDeleteError } = await supabase
      .from("profile_photos")
      .delete()
      .eq("profile_id", user.id);

    if (photoDeleteError) {
      console.error("Profile photo delete error:", photoDeleteError);
      return { error: "Failed to update profile photo. Please try again." };
    }

    const { error: photoInsertError } = await supabase
      .from("profile_photos")
      .insert({
        profile_id: user.id,
        storage_path: photoPath,
        display_order: 0,
        is_primary: true,
      });

    if (photoInsertError) {
      console.error("Profile photo insert error:", photoInsertError);
      return { error: "Failed to save profile photo. Please try again." };
    }
  }

  // ---- Save interests ----
  const { error: deleteError } = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", user.id);

  if (deleteError) {
    console.error("Interest delete error:", deleteError);
    return { error: "Failed to update interests. Please try again." };
  }

  if (interestIds.length > 0) {
    const rows = interestIds.map((interest_id) => ({
      profile_id: user.id,
      interest_id,
    }));

    const { error: insertError } = await supabase
      .from("profile_interests")
      .insert(rows);

    if (insertError) {
      console.error("Interest insert error:", insertError);
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

  redirect(routes.app);
}
