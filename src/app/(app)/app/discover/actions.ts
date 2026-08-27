"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function likeProfile(profileId: string) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "You must be logged in to like someone.",
            matched: false,
        };
    }

    if (user.id === profileId) {
        return {
            error: "You cannot like your own profile.",
            matched: false,
        };
    }

    // Make sure the target profile actually exists
    // and has completed their profile.
    const { data: targetProfile, error: targetError } = await supabase
        .from("profiles")
        .select("id, profile_completed")
        .eq("id", profileId)
        .single();

    if (targetError || !targetProfile || !targetProfile.profile_completed) {
        return {
            error: "That profile is no longer available.",
            matched: false,
        };
    }

    // Create the like.
    const { error: likeError } = await supabase
        .from("likes")
        .insert({
            liker_id: user.id,
            liked_id: profileId,
        });

    if (likeError && likeError.code !== "23505") {
        console.error("Like failed:", likeError);

        return {
             error: "Couldn't save your like. Please try again.",
            matched: false,
        };
    }

    // Check whether the other user already liked us.
    const { data: reciprocalLike, error: reciprocalError } = await supabase
        .from("likes")
        .select("id")
        .eq("liker_id", profileId)
        .eq("liked_id", user.id)
        .maybeSingle();

    if (reciprocalError) {
        console.error("Match check failed:", reciprocalError);

        return {
            error: "Your like was saved, but we couldn't check the match yet.",
            matched: false,
        };
    }

    if (!reciprocalLike) {
        return {
            error: null,
            matched: false,
        };
    }

    // Store the pair consistently.
    const [userA, userB] =
        user.id < profileId
            ? [user.id, profileId]
            : [profileId, user.id];

    const { error: matchError } = await supabase
        .from("matches")
        .insert({
            user_a: userA,
            user_b: userB,
        });

    // Duplicate match is harmless because the database
    // has a unique pair index.
    if (matchError && matchError.code !== "23505") {
        console.error("Match creation failed:", matchError);

        return {
            error: "It's a mutual like, but the match could not be created.",
            matched: false,
        };
    }

    return {
        error: null,
        matched: true,
    };
}
export async function passProfile(profileId: string) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "You must be logged in to pass someone.",
        };
    }

    if (user.id === profileId) {
        return {
            error: "You cannot pass your own profile.",
        };
    }

    // Make sure the target profile actually exists
    // and has completed their profile.
    const { data: targetProfile, error: targetError } = await supabase
        .from("profiles")
        .select("id, profile_completed")
        .eq("id", profileId)
        .single();

    if (targetError || !targetProfile || !targetProfile.profile_completed) {
        return {
            error: "That profile is no longer available.",
        };
    }

    // Save the pass.
    const { error: passError } = await supabase
        .from("passes")
        .insert({
            passer_id: user.id,
            passed_id: profileId,
        });

    // A duplicate pass is harmless because the database
    // has a unique constraint on the user pair.
    if (passError && passError.code !== "23505") {
        console.error("Pass failed:", passError);

        return {
            error: "Couldn't save your pass. Please try again.",
        };
    }

    return {
        error: null,
    };
}