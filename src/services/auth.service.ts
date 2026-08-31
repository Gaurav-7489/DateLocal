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

// Cached client instance for rapid auth operations
let cachedClient: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!cachedClient) {
    cachedClient = createClient();
  }
  return cachedClient;
}

function getRedirectUrl(path: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getClient();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      // The hosted Supabase email template should append
      // ?token_hash={{ .TokenHash }}&type=email to this URL.
      emailRedirectTo: getRedirectUrl("/auth/confirm"),
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
    needsEmailConfirmation: !data.session,
  };
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
    const message = error.message.toLowerCase().includes("email not confirmed")
      ? "Please verify your email before logging in. Check your inbox or spam folder."
      : error.message.toLowerCase().includes("invalid login credentials")
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
      emailRedirectTo: getRedirectUrl("/auth/confirm"),
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

  const resetRedirect = getRedirectUrl("/auth/confirm?next=/reset-password");

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