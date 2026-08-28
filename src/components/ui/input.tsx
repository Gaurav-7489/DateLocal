import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-xs font-bold text-zinc-700 ml-1 tracking-wide"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center group">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-zinc-400 transition-colors group-focus-within:text-emerald-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-4 text-sm font-semibold text-zinc-900 shadow-2xs",
              "placeholder:text-zinc-400 placeholder:font-medium",
              "transition-all duration-200 ease-out",
              "hover:bg-zinc-50 hover:border-zinc-300",
              "focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500",
              "disabled:pointer-events-none disabled:opacity-50 disabled:bg-zinc-100",
              leftIcon ? "pl-11" : undefined,
              rightIcon ? "pr-11" : undefined,
              error && "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 hover:border-rose-400",
              className,
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-zinc-400 transition-colors group-focus-within:text-emerald-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Animated Error Message */}
        {error && (
          <p 
            id={`${inputId}-error`} 
            className="text-xs font-bold text-rose-500 mt-0.5 ml-1 flex items-center gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200" 
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, type InputProps };