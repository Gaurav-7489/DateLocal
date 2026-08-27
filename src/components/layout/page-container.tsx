"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageContainerProps extends HTMLMotionProps<"main"> {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  title?: string;
  description?: string;
  badge?: string;
}

export function PageContainer({
  children,
  className,
  narrow = false,
  title,
  description,
  badge,
  ...props
}: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className
      )}
      {...props}
    >
      {/* Optional Auto-Formatting Page Header */}
      {(title || description || badge) && (
        <div className="mb-8 space-y-2">
          {badge && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
              {badge}
            </div>
          )}

          {title && (
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              {title}
            </h1>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Page Content Container */}
      <div className="w-full">
        {children}
      </div>
    </motion.main>
  );
}