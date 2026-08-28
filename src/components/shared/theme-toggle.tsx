"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ThemeToggle() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-2xs font-sans select-none"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>
      <span className="text-xs font-extrabold text-emerald-800 tracking-tight flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        Porcelain Light Theme Locked
      </span>
    </motion.div>
  );
}