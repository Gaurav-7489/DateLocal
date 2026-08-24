import { createClient } from "@/lib/supabase/client";

export type RegisterResult =
  | {
      success: true;
      needsEmailConfirmation: boolean;
    }
  | {
      success: false;
      error: string;
    };

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<RegisterResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
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
    needsEmailConfirmation: !data.session,
  };
}
