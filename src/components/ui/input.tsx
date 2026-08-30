import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, memo } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, leftIcon, rightIcon, required, ...props }, ref) => {
      const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
      const errorId = error && inputId ? `${inputId}-error` : undefined;

      return (
        <div className="flex flex-col gap-1.5 w-full font-sans">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-bold text-zinc-700 ml-1 tracking-wide select-none"
            >
              {label}
              {required && <span className="text-rose-500 ml-1 select-none">*</span>}
            </label>
          )}

          <div className="relative flex items-center group">
            {leftIcon && (
              <div className="absolute left-3.5 flex items-center justify-center text-zinc-400 pointer-events-none transition-colors duration-150 group-focus-within:text-emerald-600">
                {leftIcon}
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              required={required}
              className={cn(
                "h-11 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-4 text-xs sm:text-sm font-semibold text-zinc-900 shadow-2xs",
                "placeholder:text-zinc-400 placeholder:font-normal",
                "transform-gpu transition-[border-color,background-color,box-shadow] duration-150 ease-out will-change-[border-color,box-shadow]",
                "hover:bg-zinc-50 hover:border-zinc-300",
                "focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500",
                "disabled:pointer-events-none disabled:opacity-50 disabled:bg-zinc-100",
                leftIcon ? "pl-11" : "pl-4",
                rightIcon ? "pr-11" : "pr-4",
                error && "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 hover:border-rose-400",
                className
              )}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={errorId}
              {...props}
            />

            {rightIcon && (
              <div className="absolute right-3.5 flex items-center justify-center text-zinc-400 transition-colors duration-150 group-focus-within:text-emerald-600">
                {rightIcon}
              </div>
            )}
          </div>

          {error && (
            <p
              id={errorId}
              className="text-[11px] font-bold text-rose-600 ml-1 flex items-center gap-1.5 transition-opacity duration-150"
              role="alert"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = "Input";

export { Input, type InputProps };