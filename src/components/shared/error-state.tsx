"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this campus module. Please try again.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-rose-200/90 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)] font-sans my-6",
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-2xs mb-4">
        <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
      </div>

      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 tracking-tight">
        {title}
      </h3>

      {message && (
        <p className="max-w-xs sm:max-w-sm text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed font-medium">
          {message}
        </p>
      )}

      {onRetry && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}