"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({ message = "Loading campus data…", className, ...props }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl border border-zinc-200/90 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)] font-sans my-6",
        className
      )}
      role="status"
      {...props}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
        </div>
      </div>

      <p className="text-xs sm:text-sm font-bold text-zinc-700 tracking-tight">
        {message}
      </p>

      <span className="sr-only">{message}</span>
    </div>
  );
}