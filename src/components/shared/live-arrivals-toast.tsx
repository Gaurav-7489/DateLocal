"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
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
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const currentArrival = LIVE_CAMPUS_ARRIVALS[arrivalIndex]!;

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-zinc-900/90 px-4 py-2 backdrop-blur-xl shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentArrival.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs text-zinc-300"
          >
            <span className="font-semibold text-white">
              {currentArrival.name}
            </span>

            <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
              {currentArrival.dept}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <MapPin className="h-3 w-3" />
              {currentArrival.spot}
              <span>•</span>
              <span className="font-medium text-emerald-400">
                {currentArrival.time}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
