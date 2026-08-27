"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SwipeDeck } from "./swipe-deck";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full flex flex-col justify-center items-center px-4 pt-32 pb-16 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/20 via-orange-500/15 to-blue-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Exclusively for Bahra University
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Your campus. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">
              Your people.
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            A private, authenticated network to discover friends, study partners, and dates. Verified with your official university email.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-7 py-3.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:bg-emerald-500 transition-all"
            >
              Get Started with BU Email
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            <Link
              href="/safety"
              className="inline-flex items-center justify-center px-6 py-3.5 text-xs sm:text-sm font-medium text-zinc-300 bg-zinc-900/60 border border-white/10 rounded-full hover:bg-zinc-800 transition-colors backdrop-blur-sm"
            >
              <ShieldCheck className="mr-2 w-4 h-4 text-emerald-400" />
              100% Student Verified
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Interactive Swipe Deck */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <SwipeDeck />
        </div>
      </div>
    </section>
  );
}