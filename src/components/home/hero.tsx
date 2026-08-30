"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users, Lock } from "lucide-react";
import { SwipeDeck } from "./swipe-deck";
import { universityConfig } from "@/config/university";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full flex flex-col justify-center items-center px-6 pt-32 pb-20 overflow-hidden font-sans">
      
      {/* Dynamic Refined Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.45, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-emerald-200/50 via-orange-200/40 to-blue-200/50 rounded-full blur-[140px]"
        />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] bg-emerald-100/70 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-40 w-[450px] h-[450px] bg-blue-100/70 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10">
        
        {/* Left Column: Copy & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
        >
          {/* Student Built Badge with Pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 backdrop-blur-md text-xs font-extrabold text-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            A Student Project for {universityConfig.name}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 leading-[1.06]">
            Your campus. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-orange-500 to-blue-600 bg-clip-text text-transparent">
              Your people.
            </span>
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
            The authentic digital campus layer. Find genuine friendships, study partners, hackathon teams, and dates without outsiders or noise.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-emerald-600 rounded-full shadow-[0_6px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
              <span className="relative z-10 flex items-center gap-2">
                Join with Student Email
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/register?mode=basic"
              className="inline-flex items-center justify-center px-7 py-4 text-sm font-bold text-zinc-700 bg-white border border-zinc-200/90 rounded-full hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-xs active:scale-95"
            >
              Sign up with any email
            </Link>

            <Link
              href="/safety"
              className="inline-flex items-center justify-center px-7 py-4 text-sm font-bold text-zinc-700 bg-white border border-zinc-200/90 rounded-full hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-xs active:scale-95"
            >
              <ShieldCheck className="mr-2 w-4 h-4 text-emerald-600" />
              Campus email check
            </Link>
          </div>

          {/* Micro Trust Indicators below CTA */}
          <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Active Batch Peers
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" /> Zero Outsiders
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" /> Secure Chat
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Swipe Deck Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center items-center py-6"
        >
          {/* Renders your interactive swipe-deck.tsx component */}
          <SwipeDeck />
        </motion.div>

      </div>
    </section>
  );
}