"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MessageSquare, Sparkles, X, Heart } from "lucide-react";

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
      // Multi-stage celebratory confetti burst
      const duration = 1.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#10B981", "#F97316", "#3B82F6"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#10B981", "#F97316", "#3B82F6"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm rounded-3xl bg-white border border-zinc-200/90 p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            {/* Soft Background Ambient Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-52 h-52 bg-emerald-100/70 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer z-20 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold mb-3 relative z-10 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" /> Campus Connection!
            </div>

            {/* Headers */}
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight relative z-10">
              It&apos;s a Match!
            </h2>
            <p className="text-xs text-zinc-500 mt-1 relative z-10 leading-relaxed">
              You and <span className="text-emerald-700 font-bold">{matchedUser.name}</span> liked each other.
            </p>

            {/* Profile Avatar Circles */}
            <div className="flex items-center justify-center -space-x-4 my-7 relative z-10">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center text-sm font-extrabold text-zinc-800 shadow-lg">
                You
              </div>
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center z-20 shadow-lg shadow-emerald-600/30 ring-4 ring-white">
                <Heart className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <div className="relative w-20 h-20 rounded-full border-4 border-white bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center text-xl font-extrabold text-white shadow-lg overflow-hidden">
                {matchedUser.avatarUrl ? (
                  <Image
                    src={matchedUser.avatarUrl}
                    alt={matchedUser.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  matchedUser.name.charAt(0)
                )}
              </div>
            </div>

            {/* Department Info */}
            <div className="mb-6 relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                {matchedUser.department} Student
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 relative z-10">
              <button
                type="button"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Send Icebreaker
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
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