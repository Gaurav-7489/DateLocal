import { createClient } from "@/lib/supabase/client";

export type AuthResult =
  | {
      success: true;
      needsEmailConfirmation?: boolean;
    }
  | {
      success: false;
      error: string;
    };

let cachedClient: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!cachedClient) {
    cachedClient = createClient();
  }
  return cachedClient;
}

function getAuthCallbackUrl(next = "/app/profile/setup") {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  try {
    // Signup intentionally does not send a redirect URL. DateBu currently
    // runs without mandatory email verification, so a direct session is the
    // expected result when Supabase Auth has "Confirm email" disabled.
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Unable to create your account. Please try again."),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Unable to create your account. Please try again.",
      };
    }

    if (data.session) {
      return { success: true, needsEmailConfirmation: false };
    }

    // If confirmation is still enabled in Supabase, sign in immediately so
    // the app can work as soon as the Supabase setting is corrected.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!signInError) {
      return { success: true, needsEmailConfirmation: false };
    }

    const lowerMessage = signInError.message.toLowerCase();
    if (lowerMessage.includes("email not confirmed")) {
      return {
        success: false,
        error: "Supabase still requires email confirmation. Disable 'Confirm email' in Supabase Auth > Sign In / Providers > Email, then try again.",
      };
    }

    return {
      success: false,
      error: signInError.message,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Authentication service is temporarily unavailable. Please try again."),
    };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    const lowerMessage = error.message.toLowerCase();

    if (lowerMessage.includes("email not confirmed")) {
      return {
        success: false,
        error: "Email verification is disabled for DateBu. If you still see this message, disable 'Confirm email' in Supabase Auth.",
      };
    }

    const message = lowerMessage.includes("invalid login credentials")
      ? "Incorrect email or password. Please check your credentials."
      : error.message;

    return {
      success: false,
      error: message,
    };
  }

  return {
    success: true,
  };
}

export async function resendVerificationEmail(
  email: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function sendPasswordResetEmail(
  email: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  const resetRedirect = getAuthCallbackUrl("/reset-password");

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: resetRedirect,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}
