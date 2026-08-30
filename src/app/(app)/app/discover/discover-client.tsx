"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import {
  Heart,
  X,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  MoreVertical,
  Flag,
  UserX,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  likeProfile,
  passProfile,
  resetPassedProfiles,
  blockUser,
  reportUser,
} from "./actions";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/utils";

type Interest = {
  id: string;
  name: string;
};

type ProfileInterest = {
  interests: Interest | Interest[] | null;
};

type ProfilePhoto = {
  storage_path: string;
  display_order: number;
  is_primary: boolean;
  url?: string | null;
};

export type DiscoverProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
  campus_residency?: string | null;
  campus_hangout?: string | null;
  relationship_goal?: string | null;
  zodiac?: string | null;
  sleep_habit?: string | null;
  caffeine_pref?: string | null;
  weekend_vibe?: string | null;
  prompt_question?: string | null;
  prompt_answer?: string | null;
  profile_photos: ProfilePhoto[] | null;
  profile_interests: ProfileInterest[] | null;
  profile_photo_url: string | null;
};

export default function DiscoverClient({
  profiles,
}: {
  profiles: DiscoverProfile[];
}) {
  const router = useRouter();
  const [deck, setDeck] = useState<DiscoverProfile[]>(profiles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDeck(profiles);
  }, [profiles]);

  // Zero-Latency In-Memory Image Pre-caching for Deck
  useEffect(() => {
    if (deck.length > 1) {
      const nextPhotoUrl =
        deck[1]?.profile_photos?.[0]?.url ?? deck[1]?.profile_photo_url;
      if (nextPhotoUrl) {
        const img = new window.Image();
        img.src = nextPhotoUrl;
      }
    }
    if (deck.length > 2) {
      const thirdPhotoUrl =
        deck[2]?.profile_photos?.[0]?.url ?? deck[2]?.profile_photo_url;
      if (thirdPhotoUrl) {
        const img = new window.Image();
        img.src = thirdPhotoUrl;
      }
    }
  }, [deck]);

  const [matchModal, setMatchModal] = useState<{
    profile: DiscoverProfile;
    matchId?: string;
  } | null>(null);

  // Safety menu & report state
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [reportModalProfile, setReportModalProfile] = useState<DiscoverProfile | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate photo or content");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handleLike(profileId: string) {
    if (loading) return;
    setLoading(true);

    const target = deck.find((p) => p.id === profileId);
    if (!target) {
      setLoading(false);
      return;
    }

    // Instant optimistic pop off GPU render tree
    setDeck((prev) => prev.filter((p) => p.id !== profileId));

    try {
      const result = await likeProfile(profileId);

      if (result.error) {
        showToast(result.error);
        setDeck((prev) => [target, ...prev]);
        setLoading(false);
        return;
      }

      if (result.matched) {
        void import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 100,
            spread: 70,
            startVelocity: 30,
            origin: { y: 0.6 },
            colors: ["#10B981", "#F97316", "#3B82F6", "#EC4899"],
          });
        });

        setMatchModal({
          profile: target,
          matchId: result.matchId,
        });
      }
    } catch (error) {
      console.error("[DateBu] Like action error:", error);
      showToast("Something went wrong. Please try again.");
      setDeck((prev) => [target, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePass(profileId: string) {
    if (loading) return;
    setLoading(true);

    const target = deck.find((p) => p.id === profileId);
    if (!target) {
      setLoading(false);
      return;
    }

    // Instant optimistic pop
    setDeck((prev) => prev.filter((p) => p.id !== profileId));

    try {
      const result = await passProfile(profileId);
      if (result.error) {
        showToast(result.error);
        setDeck((prev) => [target, ...prev]);
      }
    } catch (error) {
      console.error("[DateBu] Pass action error:", error);
      showToast("Something went wrong. Please try again.");
      setDeck((prev) => [target, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock(targetProfile: DiscoverProfile) {
    setSafetyMenuOpen(false);
    if (!confirm(`Are you sure you want to block ${targetProfile.display_name}? You will no longer see each other.`)) {
      return;
    }

    const result = await blockUser(targetProfile.id);
    if (result.error) {
      showToast(result.error);
      return;
    }

    setDeck((prev) => prev.filter((p) => p.id !== targetProfile.id));
    showToast(`${targetProfile.display_name} has been blocked.`);
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportModalProfile) return;

    setReportSubmitting(true);
    const result = await reportUser(reportModalProfile.id, reportReason, reportDetails);
    setReportSubmitting(false);

    if (result.error) {
      showToast(result.error);
      return;
    }

    setDeck((prev) => prev.filter((p) => p.id !== reportModalProfile.id));
    setReportModalProfile(null);
    setReportDetails("");
    showToast("Report submitted. This user has been removed from your feed.");
  }

  async function handleReviewPassed() {
    if (loading) return;
    setLoading(true);

    try {
      const result = await resetPassedProfiles();
      if (result.error) {
        showToast(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to review passed profiles:", error);
      showToast("Couldn't reload passed profiles. Please try again.");
      setLoading(false);
    }
  }

  const currentProfile = deck[0];

  if (!currentProfile && !matchModal) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4 font-sans">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="text-base font-bold text-foreground">You&apos;re all caught up!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            You&apos;ve reviewed all available student profiles matching your current preferences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={routes.profileSetup}>
              <Button variant="outline" size="sm" className="gap-2 text-xs w-full sm:w-auto cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Preferences
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReviewPassed}
              disabled={loading}
              className="gap-2 text-xs w-full sm:w-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Review Passed Profiles Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between px-3 pt-1 pb-20 md:pb-4 font-sans overflow-hidden select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-xs font-bold text-emerald-800 shadow-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hardware-Composited Viewport Container */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center my-auto">
        <div className="relative h-full w-full max-h-[520px] aspect-[4/5] sm:aspect-auto">
          {deck.slice(0, 2).map((profile, index) => {
            const isTop = index === 0;
            return (
              <DiscoverCard
                key={profile.id}
                profile={profile}
                isTop={isTop}
                onSwipe={(dir) => {
                  if (dir === "right") handleLike(profile.id);
                  else handlePass(profile.id);
                }}
                onOpenSafety={() => setSafetyMenuOpen(true)}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Action Buttons */}
      {currentProfile && (
        <div className="shrink-0 flex items-center justify-center gap-7 pt-2 pb-1 z-30">
          <button
            type="button"
            disabled={loading}
            onClick={() => handlePass(currentProfile.id)}
            className="flex h-13 w-13 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-md shadow-orange-500/10 transition-transform active:scale-90 disabled:opacity-50 cursor-pointer"
            aria-label="Pass profile"
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleLike(currentProfile.id)}
            className="flex h-15 w-15 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-90 disabled:opacity-50 cursor-pointer"
            aria-label="Like profile"
          >
            <Heart className="h-7 w-7 fill-current" />
          </button>
        </div>
      )}

      {/* Safety Menu Modal */}
      <AnimatePresence>
        {safetyMenuOpen && currentProfile && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Safety Controls</span>
                <button
                  onClick={() => setSafetyMenuOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Options for <span className="font-semibold text-foreground">{currentProfile.display_name}</span>:
              </p>

              <button
                type="button"
                onClick={() => {
                  setSafetyMenuOpen(false);
                  setReportModalProfile(currentProfile);
                }}
                className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
              >
                <Flag className="w-4 h-4" /> Report Inappropriate Profile
              </button>

              <button
                type="button"
                onClick={() => handleBlock(currentProfile)}
                className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
              >
                <UserX className="w-4 h-4" /> Block This User
              </button>

              <button
                type="button"
                onClick={() => setSafetyMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl p-2.5 text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 border border-border transition cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal Dialog */}
      <AnimatePresence>
        {reportModalProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-600" />
                  Report {reportModalProfile.display_name}
                </h3>
                <button
                  onClick={() => setReportModalProfile(null)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Reason for report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="Inappropriate photo or content">Inappropriate photo or content</option>
                    <option value="Harassment or abusive behavior">Harassment or abusive behavior</option>
                    <option value="Fake or impersonated profile">Fake or impersonated profile</option>
                    <option value="Spam or commercial advertising">Spam or commercial advertising</option>
                    <option value="Underage user">Underage user</option>
                    <option value="Other safety concern">Other safety concern</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Provide additional context to help our moderation team..."
                    className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setReportModalProfile(null);
                      setReportDetails("");
                    }}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={reportSubmitting}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report & Block"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Match Celebration Dialog */}
      <AnimatePresence>
        {matchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-7 text-center shadow-2xl overflow-hidden space-y-4"
            >
              <button
                onClick={() => setMatchModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Mutual Connection!
              </div>

              <h2 className="text-2xl font-black text-foreground tracking-tight">
                It&apos;s a Match!
              </h2>

              <p className="text-xs text-muted-foreground">
                You and <span className="text-emerald-600 font-bold">{matchModal.profile.display_name}</span> liked each other.
              </p>

              <div className="flex items-center justify-center -space-x-4 py-2">
                <div className="w-20 h-20 rounded-full border-4 border-card bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-800 shadow-md">
                  You
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow-md">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="relative w-20 h-20 rounded-full border-4 border-card overflow-hidden bg-muted shadow-md">
                  {matchModal.profile.profile_photo_url ? (
                    <Image
                      src={matchModal.profile.profile_photo_url}
                      alt={matchModal.profile.display_name ?? "Match"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-foreground">
                      {matchModal.profile.display_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link
                  href={matchModal.matchId ? `${routes.messages}/${matchModal.matchId}` : routes.matches}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Send First Message
                </Link>
                <button
                  type="button"
                  onClick={() => setMatchModal(null)}
                  className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- 120FPS GPU HARDWARE-COMPOSITED CARD ----------------

const DiscoverCard = memo(function DiscoverCard({
  profile,
  isTop,
  onSwipe,
  onOpenSafety,
}: {
  profile: DiscoverProfile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right") => void;
  onOpenSafety: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-15, 15]);

  const likeOpacity = useTransform(x, [35, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -35], [1, 0]);

  const photos = [...(profile.profile_photos ?? [])]
    .filter((photo) => photo.url)
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    })
    .slice(0, 6);

  const [photoIndex, setPhotoIndex] = useState(0);

  const age = calculateAge(profile.date_of_birth);

  const interests =
    profile.profile_interests?.flatMap((item) => {
      if (!item.interests) return [];
      return Array.isArray(item.interests) ? item.interests : [item.interests];
    }) ?? [];

  const currentPhoto = photos[photoIndex]?.url ?? profile.profile_photo_url;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) < 85) return;
    onSwipe(info.offset.x > 0 ? "right" : "left");
  };

  const previousPhoto = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPhotoIndex((current) => Math.max(0, current - 1));
  };

  const nextPhoto = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPhotoIndex((current) => Math.min(photos.length - 1, current + 1));
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        transform: "translate3d(0, 0, 0)",
        WebkitTransform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform",
      }}
      animate={{
        scale: isTop ? 1 : 0.96,
        y: isTop ? 0 : 8,
        opacity: isTop ? 1 : 0.65,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 overflow-hidden rounded-[2rem] select-none ${
        isTop
          ? "z-20 cursor-grab active:cursor-grabbing touch-pan-y"
          : "z-10 pointer-events-none"
      }`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-zinc-950 shadow-2xl">
        {!isTop ? (
          <div className="absolute inset-0 bg-zinc-900 border border-zinc-800" />
        ) : (
          <>
            {/* Primary Photo Layer with Native Async Decoding */}
            <div className="absolute inset-0">
              {currentPhoto ? (
                <Image
                  src={currentPhoto}
                  alt={profile.display_name ?? "Student"}
                  fill
                  priority
                  decoding="async"
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 420px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-5xl">
                  👤
                </div>
              )}

              {/* Hardware Optimized Gradient Masks */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none" />
            </div>

            {/* Photo Progress Indicators */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-4 right-4 z-30 flex gap-1.5 pointer-events-none">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo.storage_path}-${index}`}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-xs"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${
                        index <= photoIndex ? "bg-white" : "bg-transparent"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Gesture Visual Feedback Badges */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-14 left-5 z-40 rounded-2xl border-2 border-emerald-400 bg-emerald-500/95 px-4 py-1.5 text-xl font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md pointer-events-none"
            >
              LIKE
            </motion.div>

            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-14 right-5 z-40 rounded-2xl border-2 border-orange-400 bg-orange-500/95 px-4 py-1.5 text-xl font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md pointer-events-none"
            >
              PASS
            </motion.div>

            {/* Dedicated Photo Tap Controls */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={previousPhoto}
                  disabled={photoIndex === 0}
                  className="absolute left-0 top-14 bottom-40 z-20 w-1/2 cursor-pointer disabled:cursor-default"
                />
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={nextPhoto}
                  disabled={photoIndex === photos.length - 1}
                  className="absolute right-0 top-14 bottom-40 z-20 w-1/2 cursor-pointer disabled:cursor-default"
                />

                {photoIndex > 0 && (
                  <div className="pointer-events-none absolute left-2.5 top-1/2 z-30 -translate-y-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                      <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  </div>
                )}

                {photoIndex < photos.length - 1 && (
                  <div className="pointer-events-none absolute right-2.5 top-1/2 z-30 -translate-y-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Top Verified & Safety Actions */}
            <div className="absolute top-6 right-3.5 z-40 flex items-center gap-1.5">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shadow-md backdrop-blur-md border border-white/15 pointer-events-none">
                <ShieldCheck className="h-3 w-3" /> Verified
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenSafety();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-md border border-white/15 hover:bg-black/80 cursor-pointer active:scale-90 transition-transform"
                aria-label="Safety menu"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Student Details Card Section */}
            <div className="absolute bottom-3 left-4 right-4 z-30 space-y-1.5 pointer-events-none">
              
              {/* Name, Age, Major */}
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
                    {profile.display_name || "DateBu Student"}
                    {age !== null && <span className="font-light text-xl opacity-90">, {age}</span>}
                  </h2>

                  {profile.department && (
                    <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-md">
                      {profile.department}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 mt-0.5">
                  <span>{profile.academic_year}</span>
                  {profile.gender && <span>• {profile.gender}</span>}
                  {profile.campus_residency && (
                    <span className="flex items-center gap-0.5 text-zinc-300">
                      <MapPin className="w-2.5 h-2.5" /> {profile.campus_residency}
                    </span>
                  )}
                </div>
              </div>

              {/* Prompt / Bio snippet */}
              {profile.prompt_question && profile.prompt_answer ? (
                <div className="rounded-xl bg-black/50 p-2 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                    {profile.prompt_question}
                  </span>
                  <p className="text-xs text-white/95 leading-snug line-clamp-2">
                    &ldquo;{profile.prompt_answer}&rdquo;
                  </p>
                </div>
              ) : profile.bio ? (
                <p className="text-xs text-white/90 line-clamp-2 leading-relaxed drop-shadow-xs">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              ) : null}

              {/* Badges & Pills */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {profile.relationship_goal && (
                  <span className="rounded-full bg-rose-500/80 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                    {profile.relationship_goal}
                  </span>
                )}
                {profile.zodiac && (
                  <span className="rounded-full bg-purple-500/80 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                    {profile.zodiac}
                  </span>
                )}
                {interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest.id}
                    className="rounded-full bg-white/20 border border-white/15 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs"
                  >
                    {interest.name}
                  </span>
                ))}
              </div>

              {/* Swipe Direction Hint */}
              <div className="flex items-center justify-between border-t border-white/15 pt-1.5 text-[9px] font-semibold text-white/60">
                <span>← Pass</span>
                {photos.length > 1 && (
                  <span>
                    {photoIndex + 1} / {photos.length}
                  </span>
                )}
                <span>Like →</span>
              </div>

            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});