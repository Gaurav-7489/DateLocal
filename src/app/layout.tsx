import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${universityConfig.appName} — Bahra University Social Space`,
  description: `Exclusive verified dating and social network for ${universityConfig.name} students.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-[100dvh] bg-zinc-100 font-sans text-zinc-900 antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">
        {/* Responsive Mobile Container */}
        <div className="min-h-screen w-full bg-zinc-100 flex items-center justify-center sm:py-6">
          <div className="w-full h-full min-h-[100dvh] sm:h-[880px] sm:max-w-[420px] sm:rounded-[40px] sm:border-[8px] sm:border-white bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}