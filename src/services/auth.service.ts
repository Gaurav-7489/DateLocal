import { createClient } from "@/lib/supabase/client";
import { isUniversityEmail } from "@/config/university";

export type AuthResult =
  | { success: true; needsEmailConfirmation?: boolean }
  | { success: false; error: string };

let cachedClient: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!cachedClient) cachedClient = createClient();
  return cachedClient;
}

function getAuthCallbackUrl(next = "/app/profile/setup") {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const { error } = await getClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Google sign-in is temporarily unavailable."),
    };
  }
}

export async function registerWithEmail(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isUniversityEmail(normalizedEmail)) {
    return {
      success: false,
      error: "Use your Bahra University email address. If you do not have one, use Google instead.",
    };
  }

  try {
    const { data, error } = await getClient().auth.signUp({
      email: normalizedEmail,
      password,
    });
    if (error) return { success: false, error: getErrorMessage(error, "Unable to create your account.") };
    if (!data.user) return { success: false, error: "Unable to create your account. Please try again." };
    if (data.session) return { success: true, needsEmailConfirmation: false };
    return {
      success: false,
      error: "University-email signup is currently configured for direct access. Please try again.",
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Authentication service is temporarily unavailable."),
    };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isUniversityEmail(normalizedEmail)) {
    return {
      success: false,
      error: "Email login is only available for your Bahra University email. Use Google instead.",
    };
  }

  try {
    const { error } = await getClient().auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) {
      const message = error.message.toLowerCase().includes("invalid login credentials")
        ? "Incorrect university email or password."
        : error.message;
      return { success: false, error: message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Authentication service is temporarily unavailable."),
    };
  }
}

export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isUniversityEmail(normalizedEmail)) {
    return { success: false, error: "Verification emails are only available for university addresses." };
  }

  const { error } = await getClient().auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: { emailRedirectTo: getAuthCallbackUrl() },
  });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isUniversityEmail(normalizedEmail)) {
    return { success: false, error: "Password reset is only available for university email accounts." };
  }

  const { error } = await getClient().auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getAuthCallbackUrl("/reset-password"),
  });
  return error ? { success: false, error: error.message } : { success: true };
}
