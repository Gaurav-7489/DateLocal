"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { ShieldCheck, Heart, X, Sparkles, RotateCcw } from "lucide-react";
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
  avatarBg: string;
  image?: string;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Riya Sharma",
    age: 20,
    department: "BCA",
    year: "'26",
    avatarBg: "from-emerald-500/10 via-teal-500/5 to-transparent",
    bio: "Building Next.js apps & looking for someone to grab canteen chai with ☕",
    tags: ["React", "UI Design", "Badminton", "Midnight Maggi"],
    intent: "chai",
    image: "/images/buphoto.jpeg",
  },
  {
    id: "2",
    name: "Aman Verma",
    age: 21,
    department: "B.Tech CSE",
    year: "'25",
    avatarBg: "from-orange-500/10 via-amber-500/5 to-transparent",
    bio: "DSA grind during the day, campus acoustic sessions at night 🎸",
    tags: ["Guitar", "Competitive Coding", "Anime", "AI"],
    intent: "dating",
    image: "/images/buphoto.jpeg",
  },
  {
    id: "3",
    name: "Simran Kaur",
    age: 19,
    department: "BBA",
    year: "'27",
    avatarBg: "from-blue-500/10 via-indigo-500/5 to-transparent",
    bio: "Need a study partner for library prep and hackathon pitch decks 📚",
    tags: ["Marketing", "Debate Club", "Coffee", "Startups"],
    intent: "study",
    image: "/images/buphoto.jpeg",
  },
];

export function SwipeDeck() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [matchData, setMatchData] = useState<Profile | null>(null);

  const activeIndex = profiles.length - 1;
  const currentProfile = profiles[activeIndex];

  const handleSwipe = (direction: "left" | "right" | "up") => {
    if (!currentProfile) return;

    if (direction === "right" || direction === "up") {
      setMatchData(currentProfile);
    }

    setProfiles((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="relative w-full max-w-[340px] h-[500px] flex items-center justify-center">
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
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center w-full h-full p-8 rounded-3xl border border-zinc-200/90 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] text-center space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 shadow-xs mb-1">
              <Sparkles className="w-7 h-7 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight">All Caught Up!</h3>
            <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed">
              You&apos;ve checked all campus profiles in this demo deck batch.
            </p>
            <button
              onClick={() => setProfiles(MOCK_PROFILES)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Cards
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      {matchData && (
        <MatchModal
          isOpen={Boolean(matchData)}
          onClose={() => setMatchData(null)}
          matchedUser={matchData}
        />
      )}
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
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-160, 160], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.9, 1, 0.9, 0.5]);

  // Dynamic feedback badge opacities based on drag coordinate
  const likeOpacity = useTransform(x, [15, 90], [0, 1]);
  const passOpacity = useTransform(x, [-90, -15], [1, 0]);
  const superlikeOpacity = useTransform(y, [-90, -15], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 90) {
      onSwipe("right");
    } else if (info.offset.x < -90) {
      onSwipe("left");
    } else if (info.offset.y < -90) {
      onSwipe("up");
    }
  };

  return (
    <motion.div
      style={{
        gridRow: 1,
        gridColumn: 1,
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 0.82,
        zIndex: isTop ? 10 : 0,
        scale: isTop ? 1 : 0.95,
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full w-full rounded-3xl bg-white border border-zinc-200/90 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-hidden">
        
        {/* Swipe Feedback Overlays */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-5 left-5 z-30 px-3.5 py-1.5 rounded-2xl bg-emerald-500/90 backdrop-blur-md border border-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-lg"
            >
              💚 Like
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-5 right-5 z-30 px-3.5 py-1.5 rounded-2xl bg-orange-500/90 backdrop-blur-md border border-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-lg"
            >
              ❌ Pass
            </motion.div>
            <motion.div
              style={{ opacity: superlikeOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2 rounded-2xl bg-blue-600/95 backdrop-blur-md border border-blue-400 text-white font-black text-xs uppercase tracking-widest shadow-2xl"
            >
              ⭐ Superlike
            </motion.div>
          </>
        )}

        {/* Profile Card Hero Visual Area */}
        <div className={`relative h-60 w-full rounded-2xl bg-gradient-to-br ${profile.avatarBg} overflow-hidden flex flex-col justify-end p-4 border border-zinc-200/60 shadow-inner`}>
          {profile.image && (
            <>
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                priority
                className="object-cover object-center filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </>
          )}

          {/* Badges Container */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-20">
            <div className="px-2.5 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
              Demo Profile
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-[10px] font-semibold text-emerald-700 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
            </div>
          </div>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{profile.name}, {profile.age}</h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/90 backdrop-blur-md text-white shadow-xs">
                {profile.department} {profile.year}
              </span>
            </div>
            <p className="text-xs text-zinc-200 mt-1 line-clamp-2 leading-relaxed font-medium">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Interest Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => onSwipe("left")}
            className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-orange-50 border border-zinc-200 hover:border-orange-300 flex items-center justify-center text-zinc-500 hover:text-orange-600 transition-all active:scale-90 cursor-pointer shadow-xs"
            aria-label="Pass profile"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSwipe("up")}
            className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 transition-all active:scale-90 cursor-pointer shadow-xs"
            aria-label="Superlike profile"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSwipe("right")}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-90 cursor-pointer"
            aria-label="Like profile"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
