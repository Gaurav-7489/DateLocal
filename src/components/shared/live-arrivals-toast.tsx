"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const LIVE_CAMPUS_ARRIVALS = [
  {
    name: "Rohan K.",
    dept: "BCA '26",
    spot: "Central Library",
    time: "Just now",
  },
  {
    name: "Ananya D.",
    dept: "B.Tech '25",
    spot: "Canteen Area",
    time: "1m ago",
  },
  {
    name: "Harsh S.",
    dept: "BCA '26",
    spot: "Block 2 Lab",
    time: "2m ago",
  },
  {
    name: "Ritika M.",
    dept: "MBA '27",
    spot: "Campus Lawn",
    time: "3m ago",
  },
  {
    name: "Tanmay P.",
    dept: "Pharmacy '25",
    spot: "Main Gate",
    time: "4m ago",
  },
];

export function LiveArrivalsToast() {
  const [arrivalIndex, setArrivalIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setArrivalIndex(
        (prev) => (prev + 1) % LIVE_CAMPUS_ARRIVALS.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentArrival = LIVE_CAMPUS_ARRIVALS[arrivalIndex]!;

  return (
    <div className="flex items-center justify-center font-sans">
      <div className="relative flex items-center gap-3 rounded-full border border-zinc-200/90 bg-white/90 px-4.5 py-2.5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        
        {/* Pulsing Live Beacon */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentArrival.name}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs text-zinc-600"
          >
            <span className="font-extrabold text-zinc-950 tracking-tight">
              {currentArrival.name}
            </span>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 shadow-2xs">
              {currentArrival.dept}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
              <MapPin className="h-3 w-3 text-emerald-600" />
              {currentArrival.spot}
              <span className="text-zinc-300">•</span>
              <span className="font-semibold text-emerald-700">
                {currentArrival.time}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Subtle decorative sparkle */}
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 hidden sm:block opacity-75" />
      </div>
    </div>
  );
}