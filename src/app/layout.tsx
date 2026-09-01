import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { universityConfig } from "@/config/university";
import { InstallPwaButton } from "@/components/shared/install-pwa-button";
import { InteractionFeedback } from "@/components/ui/interaction-feedback";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${universityConfig.appName} — Campus Social Space`,
  description: `Student dating and social network for ${universityConfig.name}.`,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
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
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-[100dvh] bg-zinc-100 font-sans text-zinc-900 antialiased overflow-x-hidden overscroll-y-none selection:bg-emerald-500 selection:text-white">
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-zinc-100 sm:p-6">
          <div className="relative flex h-[100dvh] w-full max-h-[100dvh] flex-col overflow-hidden bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] sm:h-[840px] sm:max-w-[420px] sm:rounded-[40px] sm:border-[8px] sm:border-white">
            <InteractionFeedback />
            {children}
            <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[99990] flex justify-center px-3 sm:absolute sm:bottom-3">
              <div className="pointer-events-auto">
                <InstallPwaButton />
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
