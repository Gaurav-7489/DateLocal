"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
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
} from "lucide-react";
import { likeProfile, passProfile, blockUser, reportUser } from "./actions";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

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
};

export type DiscoverProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
  profile_photos: ProfilePhoto[] | null;
  profile_interests: ProfileInterest[] | null;
  profile_photo_url: string | null;
};

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return isNaN(age) ? null : age;
}

export default function DiscoverClient({
  profiles,
}: {
  profiles: DiscoverProfile[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [deck, setDeck] = useState<DiscoverProfile[]>(profiles);
  const [loading, setLoading] = useState(false);
  const [matchModal, setMatchModal] = useState<{
    profile: DiscoverProfile;
    matchId?: string;
  } | null>(null);

  // Safety menu & report state
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [reportModalProfile, setReportModalProfile] = useState<DiscoverProfile | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate content");
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
    const result = await likeProfile(profileId);

    if (result.error) {
      showToast(result.error);
      setLoading(false);
      return;
    }

    setDeck((prev) => prev.filter((p) => p.id !== profileId));

    if (result.matched && target) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F97316", "#3B82F6", "#EC4899"],
      });
      setMatchModal({ profile: target, matchId: result.matchId });
    }

    setLoading(false);
    router.refresh();
  }

  async function handlePass(profileId: string) {
    if (loading) return;
    setLoading(true);

    const result = await passProfile(profileId);

    if (result.error) {
      showToast(result.error);
      setLoading(false);
      return;
    }

    setDeck((prev) => prev.filter((p) => p.id !== profileId));
    setLoading(false);
    router.refresh();
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
    router.refresh();
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
    showToast("Report submitted. This user has been blocked from your feed.");
    router.refresh();
  }

  const currentProfile = deck[0];

  if (!currentProfile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-black text-foreground tracking-tight">
            All Caught Up!
          </h1>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            You&apos;ve reviewed all available student profiles matching your current preferences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={routes.profileSetup}>
              <Button variant="outline" size="sm" className="gap-2 text-xs w-full sm:w-auto">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Preferences
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.refresh()}
              className="gap-2 text-xs w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Check for New Arrivals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Discover
          </h1>
          <p className="text-xs text-muted-foreground">
            Verified campus students
          </p>
        </div>

        <Link
          href={routes.profileSetup}
          className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          Filters
        </Link>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-border bg-card p-3 text-center text-xs font-semibold text-foreground shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Card Stack Container */}
      <div className="relative h-[530px] w-full flex items-center justify-center">
        {deck.slice(0, 3).map((profile, index) => {
          const isTop = index === 0;
          const isSecond = index === 1;

          return (
            <DiscoverCard
              key={profile.id}
              profile={profile}
              isTop={isTop}
              isSecond={isSecond}
              onSwipe={(dir) => {
                if (dir === "right") handleLike(profile.id);
                else handlePass(profile.id);
              }}
              onOpenSafety={() => {
                setSafetyMenuOpen(true);
              }}
            />
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handlePass(currentProfile.id)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-md shadow-orange-500/10 transition-all hover:bg-orange-50 hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
          aria-label="Pass profile"
        >
          <X className="h-7 w-7 stroke-[2.5]" />
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleLike(currentProfile.id)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
          aria-label="Like profile"
        >
          <Heart className="h-8 w-8 fill-current" />
        </button>
      </div>

      {/* Safety Dropdown Menu */}
      <AnimatePresence>
        {safetyMenuOpen && currentProfile && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
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
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
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
                className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
              >
                <Flag className="w-4 h-4" /> Report Inappropriate Profile
              </button>

              <button
                type="button"
                onClick={() => handleBlock(currentProfile)}
                className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
              >
                <UserX className="w-4 h-4" /> Block This User
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal Dialog */}
      <AnimatePresence>
        {reportModalProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-600" />
                  Report {reportModalProfile.display_name}
                </h3>
                <button
                  onClick={() => setReportModalProfile(null)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
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

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setReportModalProfile(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={reportSubmitting}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
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

              <h2 className="text-3xl font-black text-foreground tracking-tight">
                It&apos;s a Match!
              </h2>

              <p className="text-xs text-muted-foreground">
                You and <span className="text-emerald-600 font-bold">{matchModal.profile.display_name}</span> liked each other.
              </p>

              {/* Photos juxtaposition */}
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

// ---------------- INDIVIDUAL DISCOVER CARD COMPONENT ----------------

function DiscoverCard({
  profile,
  isTop,
  isSecond,
  onSwipe,
  onOpenSafety,
}: {
  profile: DiscoverProfile;
  isTop: boolean;
  isSecond: boolean;
  onSwipe: (dir: "left" | "right") => void;
  onOpenSafety: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);

  const likeOpacity = useTransform(x, [20, 90], [0, 1]);
  const passOpacity = useTransform(x, [-90, -20], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 90) {
      onSwipe("right");
    } else if (info.offset.x < -90) {
      onSwipe("left");
    }
  };

  const age = calculateAge(profile.date_of_birth);

  const interests =
    profile.profile_interests?.flatMap((item) => {
      if (!item.interests) return [];
      return Array.isArray(item.interests) ? item.interests : [item.interests];
    }) ?? [];

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
      }}
      animate={{
        scale: isTop ? 1 : isSecond ? 0.96 : 0.92,
        y: isTop ? 0 : isSecond ? 12 : 24,
        opacity: isTop ? 1 : isSecond ? 0.8 : 0.4,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 320 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 select-none ${
        isTop ? "cursor-grab active:cursor-grabbing z-20" : "pointer-events-none z-10"
      }`}
    >
      <div className="relative h-full w-full rounded-3xl bg-card border border-border p-5 shadow-lg flex flex-col justify-between overflow-hidden">
        {/* Swipe Visual Feedback Badges */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-4 left-4 z-30 px-3.5 py-1.5 rounded-2xl bg-emerald-500/95 backdrop-blur-md border border-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-lg"
            >
              💚 Like
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-2xl bg-orange-500/95 backdrop-blur-md border border-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-lg"
            >
              ❌ Pass
            </motion.div>
          </>
        )}

        {/* Photo / Visual Hero */}
        <div className="relative h-64 w-full rounded-2xl bg-muted overflow-hidden flex flex-col justify-end p-4 border border-border">
          {profile.profile_photo_url ? (
            <Image
              src={profile.profile_photo_url}
              alt={profile.display_name ?? "Student"}
              fill
              priority
              className="object-cover object-center filter brightness-[0.96]"
              sizes="380px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-100 to-teal-50 text-4xl">
              👤
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Badges & Safety Button */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-[10px] font-bold text-emerald-700 shadow-xs">
              <ShieldCheck className="w-3 h-3" /> Verified
            </div>
            {isTop && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSafety();
                }}
                className="h-7 w-7 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black transition"
                aria-label="Safety menu"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {profile.display_name || "DateBu Student"}
                {age !== null && `, ${age}`}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/90 text-white shadow-xs">
                {profile.department}
              </span>
            </div>
            <p className="text-xs text-zinc-200 mt-0.5">
              {profile.academic_year} • {profile.gender}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-foreground line-clamp-2 leading-relaxed my-2">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 my-1">
          {interests.slice(0, 5).map((interest) => (
            <span
              key={interest.id}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground"
            >
              {interest.name}
            </span>
          ))}
        </div>

        {/* Footer instruction */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Swipe right to Like</span>
          <span>Swipe left to Pass</span>
        </div>
      </div>
    </motion.div>
  );
}