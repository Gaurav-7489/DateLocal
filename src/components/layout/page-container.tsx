"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PageContainerProps extends HTMLMotionProps<"main"> {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  title?: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  withAmbientGlow?: boolean;
}

export function PageContainer({
  children,
  className,
  narrow = false,
  title,
  description,
  badge,
  action,
  withAmbientGlow = false,
  ...props
}: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "relative mx-auto w-full px-4 py-6 font-sans sm:px-6 sm:py-8 lg:px-8 min-h-0",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className
      )}
      {...props}
    >
      {/* Optional Ambient Background Glow for immersive design depth */}
      {withAmbientGlow && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-emerald-100/50 via-blue-100/30 to-purple-100/20 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Optional Auto-Formatting Page Header */}
      {(title || description || badge || action) && (
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-zinc-200/60 pb-6">
          <div className="space-y-2.5">
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-700 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {badge}
              </div>
            )}

            {title && (
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
                {title}
              </h1>
            )}

            {description && (
              <p className="text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Page Content Container with Smooth Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </motion.main>
  );
}