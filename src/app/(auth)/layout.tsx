import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f6f8fb] flex flex-col overflow-x-hidden">
      <div className="flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
