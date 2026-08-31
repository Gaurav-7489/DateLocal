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

// Launch-mode auth: email verification is temporarily bypassed so the app
// remains usable while the transactional SMTP flow is being finalized.
let cachedClient: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!cachedClient) {
    cachedClient = createClient();
  }
  return cachedClient;
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await fetch("/api/auth/temporary-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const result = (await response.json()) as {
      error?: string;
    };

    if (!response.ok) {
      return {
        success: false,
        error: result.error ?? "Unable to create your account. Please try again.",
      };
    }

    // The temporary launch route confirms the account server-side, so there
    // is no verification screen blocking access during launch.
    const supabase = getClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      return {
        success: false,
        error: signInError.message,
      };
    }

    return {
      success: true,
      needsEmailConfirmation: false,
    };
  } catch (error) {
    console.error("Launch-mode registration failed:", error);
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

  let { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  // Launch-mode compatibility: if this account was created before the
  // temporary bypass was enabled, confirm it server-side and retry once.
  if (error?.message.toLowerCase().includes("email not confirmed")) {
    try {
      const response = await fetch("/api/auth/temporary-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (response.ok) {
        const retry = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        error = retry.error;
      }
    } catch (fallbackError) {
      console.error("Launch-mode sign-in fallback failed:", fallbackError);
    }
  }

  if (error) {
    const message = error.message.toLowerCase().includes("invalid login credentials")
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

/**
 * Kept for compatibility with the existing verification UI.
 * Email verification is intentionally paused during the launch period.
 */
export async function resendVerificationEmail(
  _email: string,
): Promise<AuthResult> {
  return {
    success: false,
    error: "Email verification is currently being finalized. You can use DateBu without it for now.",
  };
}

export async function sendPasswordResetEmail(
  email: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  const resetRedirect = `${window.location.origin}/auth/callback?next=/reset-password`;

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
