"use client";

import { motion } from "framer-motion";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
      transition={{
        duration: 0.85, // Slower, relaxed crossfade
        ease: [0.16, 1, 0.3, 1], // Apple-style gentle deceleration curve
      }}
      className="w-full min-h-screen flex flex-col will-change-[opacity,transform,filter]"
    >
      {children}
    </motion.div>
  );
}