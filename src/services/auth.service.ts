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

    // DateBu currently runs without mandatory email verification. When
    // Supabase returns a session directly, registration is complete.
    if (data.session) {
      return { success: true, needsEmailConfirmation: false };
    }

    // If the Supabase project still has email confirmation enabled, signUp
    // intentionally returns no session. Try signing in immediately so the
    // app still works as soon as confirmation is disabled in Supabase Auth.
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
        error: "Email verification is currently disabled in DateBu, but Supabase Auth still requires confirmation. Disable 'Confirm email' in Supabase Auth > Sign In / Providers > Email, then try again.",
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
