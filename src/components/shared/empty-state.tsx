import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode | string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ 
  icon = "📭", 
  title, 
  description, 
  children, 
  className,
  ...props 
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-zinc-200/90 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)] font-sans my-6",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-2xl shadow-xs mb-4">
        {typeof icon === "string" ? (
          <span aria-hidden="true">{icon}</span>
        ) : (
          icon
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="max-w-xs sm:max-w-sm text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed font-medium">
          {description}
        </p>
      )}

      {children && (
        <div className="mt-5 w-full flex justify-center">
          {children}
        </div>
      )}
    </div>
  );
}