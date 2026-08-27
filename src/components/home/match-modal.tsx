"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MessageSquare, Sparkles, X, Heart } from "lucide-react";
import { soundFx } from "@/lib/sound";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    name: string;
    department: string;
    avatarUrl?: string;
  } | null;
}

export function MatchModal({ isOpen, onClose, matchedUser }: MatchModalProps) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playMatchChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F97316", "#3B82F6"], // BU Green, Orange, Dept Blue
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-6 text-center shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Instant Campus Connection
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              It&apos;s a Match!
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              You and <span className="text-emerald-400 font-semibold">{matchedUser.name}</span> liked each other.
            </p>

            {/* Profile Circles */}
            <div className="flex items-center justify-center -space-x-4 my-6">
              <div className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                You
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center z-10 shadow-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {matchedUser.name[0]}
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" /> Send Icebreaker
              </button>

              <button
                onClick={() => {
                  soundFx.playPop();
                  onClose();
                }}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}