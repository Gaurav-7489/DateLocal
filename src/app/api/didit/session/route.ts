import { NextResponse } from "next/server";

import { createDiditSession } from "@/lib/didit/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getProfilePhotoUrl } from "@/lib/profile-photo";

export const dynamic = "force-dynamic";

async function imageUrlToBase64(
  imageUrl: string,
): Promise<string> {
  const response = await fetch(imageUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Unable to load your primary profile photo.",
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST() {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized session. Please log in again.",
        },
        { status: 401 },
      );
    }

    const [
      profileResult,
      primaryPhotoResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("profile_photos")
        .select("storage_path")
        .eq("profile_id", user.id)
        .eq("is_primary", true)
        .maybeSingle(),
    ]);

    const isProfileComplete = Boolean(
      profileResult.data?.profile_completed,
    );

    const primaryPhotoPath =
      primaryPhotoResult.data?.storage_path ??
      null;

    if (
      !isProfileComplete ||
      !primaryPhotoPath
    ) {
      return NextResponse.json(
        {
          error:
            "Complete profile setup and add a primary photo first.",
        },
        { status: 400 },
      );
    }

    const profilePhotoUrl =
      getProfilePhotoUrl(
        primaryPhotoPath,
        640,
      );

    if (!profilePhotoUrl) {
      return NextResponse.json(
        {
          error:
            "Unable to load your primary profile photo.",
        },
        { status: 400 },
      );
    }

    /*
     * Download the user's primary DateBu profile
     * photo and convert it to Base64.
     *
     * Didit uses this as the reference image
     * for Face Match.
     */
    const portraitImage =
      await imageUrlToBase64(
        profilePhotoUrl,
      );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(
        /\/$/,
        "",
      ) ?? "";

    if (!appUrl) {
      return NextResponse.json(
        {
          error:
            "Application URL is not configured.",
        },
        { status: 500 },
      );
    }

    const diditResult =
      await createDiditSession({
        workflowId:
          process.env.DIDIT_WORKFLOW_ID ?? "",

        vendorData: user.id,

        callbackUrl:
          `${appUrl}/verify/face`,

        portraitImage,

        metadata: {
          datebu_user_id: user.id,
        },
      });

    const { error: upsertError } =
      await supabase
        .from("face_verifications")
        .upsert(
          {
            user_id: user.id,

            didit_session_id:
              diditResult.sessionId,

            status: "pending",

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

    if (upsertError) {
      console.error(
        "Failed to persist Didit session mapping:",
        upsertError,
      );

      return NextResponse.json(
        {
          error:
            "Failed to initialize verification. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: diditResult.url,

      sessionId:
        diditResult.sessionId,
    });
  } catch (error) {
    console.error(
      "Didit session creation error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to start verification.";

    return NextResponse.json(
      { error: message },
      {
        status: message.includes(
          "not configured",
        )
          ? 500
          : 400,
      },
    );
  }
}