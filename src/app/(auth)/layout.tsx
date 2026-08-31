import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f6f8fb] flex flex-col overflow-x-hidden">
      <div className="w-full border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[11px] leading-4 text-amber-900">
        <span className="font-semibold">Launch mode:</span> Email verification is currently being worked on.
        You can sign up and log in normally for now. We&apos;ll enable email verification once the email service is ready.
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}