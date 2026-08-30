import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { universityConfig } from "@/config/university";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${universityConfig.appName} — Bahra University Social Space`,
  description: `Exclusive verified dating and social network for ${universityConfig.name} students.`,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: universityConfig.appName,
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-[100dvh] bg-zinc-100 font-sans text-zinc-900 antialiased overflow-x-hidden overscroll-y-none selection:bg-emerald-500 selection:text-white">
        {/* Responsive Mobile Container */}
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-zinc-100 sm:p-6">
          <div className="relative flex h-[100dvh] w-full max-h-[100dvh] flex-col overflow-hidden bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] sm:h-[840px] sm:max-w-[420px] sm:rounded-[40px] sm:border-[8px] sm:border-white">
            {children}
          </div>
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}