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

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
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
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
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

export async function resendVerificationEmail(
  email: string,
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
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
