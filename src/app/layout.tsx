import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { universityConfig } from "@/config/university";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap", preload: true });
export const viewport: Viewport = { themeColor: "#10b981", width: "device-width", initialScale: 1, viewportFit: "cover" };
export const metadata: Metadata = {
  metadataBase: new URL(universityConfig.appUrl),
  title: `${universityConfig.appName} — Extrovert`,
  description: `Connect your vibe, friends and more. Social discovery and optional dating in one Extrovert identity.`,
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: { icon: [{ url: "/extrovert-date.svg", sizes: "any", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Extrovert", statusBarStyle: "default" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={inter.variable}><head><link rel="icon" href="/extrovert-date.svg" /><link rel="apple-touch-icon" href="/icon-192.png" /></head><body className="min-h-[100dvh] overflow-x-hidden bg-white font-sans text-zinc-900 antialiased selection:bg-emerald-500 selection:text-white"><div className="flex min-h-[100dvh] w-full items-start justify-center bg-white sm:p-6"><div className="relative flex min-h-[100dvh] w-full flex-col overflow-visible bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] sm:min-h-[840px] sm:max-w-[420px] sm:rounded-[40px] sm:border-[8px] sm:border-white">{children}</div></div></body></html>;
}
