import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (!createError && created.user) {
      return NextResponse.json({ ok: true, created: true });
    }

    const alreadyExists = createError?.message
      .toLowerCase()
      .includes("already registered");

    if (!alreadyExists) {
      console.error("Temporary signup failed:", createError);
      return NextResponse.json(
        { error: createError?.message ?? "Unable to create account." },
        { status: 400 },
      );
    }

    // Temporary launch-mode compatibility: existing accounts that were
    // created while email confirmation was enabled are marked confirmed so
    // their owners can still sign in with their existing password.
    let page = 1;
    const perPage = 1000;
    let matchingUserId: string | null = null;

    while (!matchingUserId) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Temporary account lookup failed:", error);
        return NextResponse.json(
          { error: "Unable to prepare this account for sign in." },
          { status: 500 },
        );
      }

      const match = data.users.find(
        (user) => user.email?.toLowerCase() === email,
      );

      matchingUserId = match?.id ?? null;

      if (matchingUserId || data.users.length < perPage) break;
      page += 1;
    }

    if (!matchingUserId) {
      return NextResponse.json(
        { error: "Unable to prepare this account for sign in." },
        { status: 400 },
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      matchingUserId,
      { email_confirm: true },
    );

    if (updateError) {
      console.error("Temporary email confirmation update failed:", updateError);
      return NextResponse.json(
        { error: "Unable to prepare this account for sign in." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, created: false, confirmed: true });
  } catch (error) {
    console.error("Temporary auth route error:", error);
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable." },
      { status: 500 },
    );
  }
}
