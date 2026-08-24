import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { universityConfig } from "@/config/university";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${universityConfig.appName} — Your University Social Space`,
    template: `%s | ${universityConfig.appName}`,
  },
  description: `A private social and dating platform exclusively for ${universityConfig.name} students.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
