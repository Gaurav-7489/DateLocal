import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f6f8fb] flex flex-col justify-between overflow-x-hidden">
      {children}
    </div>
  );
}