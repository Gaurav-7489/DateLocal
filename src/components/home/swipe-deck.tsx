"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { ShieldCheck, Heart, X, Sparkles, Coffee, BookOpen } from "lucide-react";
import { soundFx } from "@/lib/sound";
import { MatchModal } from "./match-modal";

interface Profile {
  id: string;
  name: string;
  age: number;
  department: string;
  year: string;
  bio: string;
  tags: string[];
  intent: "dating" | "study" | "chai";
}

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Riya Sharma",
    age: 20,
    department: "BCA",
    year: "'26",
    bio: "Building Next.js apps & looking for someone to grab canteen chai with.",
    tags: ["React", "UI Design", "Badminton", "Midnight Maggi"],
    intent: "chai",
  },
  {
    id: "2",
    name: "Aman Verma",
    age: 21,
    department: "B.Tech CSE",
    year: "'25",
    bio: "DSA grind during the day, campus acoustic sessions at night.",
    tags: ["Guitar", "Competitive Coding", "Anime", "AI"],
    intent: "dating",
  },
  {
    id: "3",
    name: "Simran Kaur",
    age: 19,
    department: "BBA",
    year: "'27",
    bio: "Need a study partner for library prep and hackathon pitch decks.",
    tags: ["Marketing", "Debate Club", "Coffee", "Startups"],
    intent: "study",
  },
];

export function SwipeDeck() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [matchData, setMatchData] = useState<Profile | null>(null);

  const activeIndex = profiles.length - 1;
  const currentProfile = profiles[activeIndex];

  const handleSwipe = (direction: "left" | "right" | "up") => {
    soundFx.playPop();
    if (!currentProfile) return;

    if (direction === "right" || direction === "up") {
      // Trigger match celebration on like / superlike
      setMatchData(currentProfile);
    }

    setProfiles((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="relative w-full max-w-[340px] h-[480px] flex items-center justify-center">
      <AnimatePresence>
        {profiles.length > 0 ? (
          profiles.map((profile, index) => {
            const isTop = index === activeIndex;
            return (
              <CardItem
                key={profile.id}
                profile={profile}
                isTop={isTop}
                onSwipe={handleSwipe}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl text-center">
            <Sparkles className="w-10 h-10 text-orange-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Caught Up!</h3>
            <p className="text-xs text-zinc-400 mt-1">
              You&apos;ve checked all new verified students in this batch.
            </p>
            <button
              onClick={() => setProfiles(MOCK_PROFILES)}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all"
            >
              Reset Mock Deck
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <MatchModal
        isOpen={Boolean(matchData)}
        onClose={() => setMatchData(null)}
        matchedUser={matchData}
      />
    </div>
  );
}

function CardItem({
  profile,
  isTop,
  onSwipe,
}: {
  profile: Profile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right" | "up") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.9, 1, 0.9, 0.5]);

  // Dynamic glow indicator colors
  const likeOpacity = useTransform(x, [10, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, -10], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    } else if (info.offset.y < -100) {
      onSwipe("up");
    }
  };

  return (
    <motion.div
      style={{
        gridRow: 1,
        gridColumn: 1,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 0.85,
        zIndex: isTop ? 10 : 0,
        scale: isTop ? 1 : 0.95,
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full w-full rounded-3xl bg-zinc-900 border border-white/10 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
        
        {/* Swipe Indicators */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-4 left-4 z-20 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs uppercase tracking-wider"
            >
              Like
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-4 right-4 z-20 px-3 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 font-extrabold text-xs uppercase tracking-wider"
            >
              Pass
            </motion.div>
          </>
        )}

        {/* Profile Card Header */}
        <div className="relative h-56 w-full rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black overflow-hidden flex flex-col justify-end p-4 border border-white/5">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> Verified Student
          </div>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{profile.name}, {profile.age}</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {profile.department} {profile.year}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={() => onSwipe("left")}
            className="w-11 h-11 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-colors shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSwipe("up")}
            className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:scale-110 transition-transform shadow-md"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSwipe("right")}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 hover:scale-105 transition-transform"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}