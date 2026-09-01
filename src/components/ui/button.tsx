import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef, memo } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20 hover:bg-emerald-500 active:bg-emerald-700",
  secondary: "bg-zinc-900 text-white shadow-xs shadow-zinc-900/10 hover:bg-zinc-800 active:bg-zinc-950",
  outline: "border border-zinc-200/90 bg-white/90 backdrop-blur-md text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100",
  ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 active:bg-zinc-200/60",
  destructive: "bg-rose-600 text-white shadow-xs shadow-rose-600/20 hover:bg-rose-500 active:bg-rose-700",
  gradient: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-xs font-bold rounded-xl gap-2",
  lg: "h-11 px-5 text-sm font-bold rounded-2xl gap-2.5",
};

const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    ({
      className,
      variant = "primary",
      size = "md",
      disabled,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    }, ref) => {
      const isDisabled = disabled || isLoading;

      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={cn(
            "relative inline-flex items-center justify-center font-sans font-bold tracking-tight select-none cursor-pointer",
            "transform-gpu transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
            "active:scale-[0.97] active:duration-75 disabled:active:scale-100",
            "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
            variantStyles[variant],
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
          ) : (
            leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
          )}
          {children && <span className="truncate">{children}</span>}
          {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </button>
      );
    }
  )
);

Button.displayName = "Button";

export { Button, type ButtonProps };
