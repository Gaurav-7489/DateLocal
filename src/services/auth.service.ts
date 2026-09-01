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

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
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

    if (!data.user) {
      return {
        success: false,
        error: "Unable to create your account. Please try again.",
      };
    }

    // When Supabase email confirmation is enabled, signUp intentionally
    // returns without a session. The user must confirm the email first.
    return {
      success: true,
      needsEmailConfirmation: !data.session,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: "Authentication service is temporarily unavailable. Please try again.",
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
        error: "Please verify your email address before signing in.",
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
