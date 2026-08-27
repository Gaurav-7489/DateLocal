"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, MapPinOff } from "lucide-react";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4 text-center font-sans overflow-hidden">
      
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-gradient-to-tr from-rose-100 via-zinc-200 to-orange-100"
        />
      </div>

      <main className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6">
        
        {/* Animated Lost Cat Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <LostCatMascot />
        </motion.div>

        {/* 404 Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600 uppercase tracking-widest">
            <MapPinOff className="w-3 h-3" /> Error 404
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight">
            Wrong Block?
          </h1>
          
          <p className="text-sm text-zinc-600 leading-relaxed max-w-[280px] mx-auto">
            Looks like you wandered off the campus map.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col w-full gap-3 pt-4"
        >
          <Link
            href={routes.home || "/"}
            className="group relative inline-flex items-center justify-center w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-95 transition-all"
          >
            <Compass className="mr-2 w-4 h-4" />
            Return to Main Campus
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full py-3 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="mr-2 w-3.5 h-3.5" />
            Go Back
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <div className="absolute bottom-6 text-[10px] text-zinc-400 font-medium">
        {universityConfig.appName} • Student Directory
      </div>
    </div>
  );
}

// ---------------- ANIMATED "LOST" CAT MASCOT ----------------

function LostCatMascot() {
  return (
    <div className="relative w-40 h-32 flex items-center justify-center">
      {/* Floating Question Marks */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="absolute top-0 left-8 text-2xl font-bold text-zinc-300"
      >
        ?
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute top-2 right-8 text-xl font-bold text-zinc-300"
      >
        ?
      </motion.div>

      {/* Cat */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mt-6"
      >
        {/* Ears */}
        <div className="absolute -top-5 left-2 w-10 h-10 bg-zinc-800 rotate-12 rounded-tl-xl rounded-tr-md" />
        <div className="absolute -top-5 right-2 w-10 h-10 bg-zinc-800 -rotate-12 rounded-tr-xl rounded-tl-md" />

        {/* Head */}
        <div className="relative w-28 h-24 rounded-[45%] bg-zinc-800 border-2 border-zinc-700 shadow-xl">
          {/* Eyes */}
          <div className="absolute top-8 left-7 w-3 h-4 rounded-full bg-emerald-400" />
          <div className="absolute top-8 right-7 w-3 h-4 rounded-full bg-emerald-400" />

          {/* Nose */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-3 h-2 bg-rose-400 rounded-full" />

          {/* Mouth */}
          <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-5 h-2 border-b-2 border-zinc-500 rounded-full" />

          {/* Whiskers */}
          <div className="absolute top-14 -left-7 w-8 border-t border-zinc-400/50 rotate-6" />
          <div className="absolute top-17 -left-7 w-8 border-t border-zinc-400/50 -rotate-6" />

          <div className="absolute top-14 -right-7 w-8 border-t border-zinc-400/50 -rotate-6" />
          <div className="absolute top-17 -right-7 w-8 border-t border-zinc-400/50 rotate-6" />
        </div>

        {/* Paws */}
        <div className="absolute -bottom-2 left-5 w-7 h-5 rounded-full bg-zinc-700" />
        <div className="absolute -bottom-2 right-5 w-7 h-5 rounded-full bg-zinc-700" />
      </motion.div>
    </div>
  );
}