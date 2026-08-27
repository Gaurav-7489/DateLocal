import Link from "next/link";
import { ShieldCheck, Heart, Sparkles, GraduationCap } from "lucide-react";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";

const footerNavigation = {
  platform: [
    { href: routes.app, label: "Discover Feed" },
    { href: routes.matches, label: "Campus Matches" },
    { href: routes.messages, label: "Student Chats" },
  ],
  trust: [
    { href: routes.safety, label: "Safety & Guidelines" },
    { href: routes.privacy, label: "Privacy Policy" },
    { href: routes.terms, label: "Terms of Service" },
  ],
  about: [
    { href: routes.about, label: "About Creator" },
    { href: routes.register, label: "Student Registration" },
  ],
};

export function Footer() {
  return (
    <footer className="relative w-full border-t border-zinc-200/90 bg-[#fafafa] text-zinc-900 font-sans overflow-hidden">
      
      {/* Subtle Bottom Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-emerald-100/40 via-blue-100/30 to-orange-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-12 border-b border-zinc-200/80">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-5 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm shadow-emerald-600/20">
                {universityConfig.shortName.charAt(0)}
              </div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-950">
                {universityConfig.appName}
                <span className="text-emerald-600">.</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 max-w-sm leading-relaxed">
              The private, verified social ecosystem built exclusively for students of <span className="text-zinc-950 font-semibold">{universityConfig.name}</span>. Say goodbye to outsiders and bots.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 
                100% Student Verified
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> 
                Student Project
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Platform */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Platform
              </p>
              <ul className="space-y-2.5">
                {footerNavigation.platform.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Safety */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Trust & Safety
              </p>
              <ul className="space-y-2.5">
                {footerNavigation.trust.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Project
              </p>
              <ul className="space-y-2.5">
                {footerNavigation.about.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Made with Love */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500">
          <p className="font-medium text-center sm:text-left">
            © {new Date().getFullYear()} {universityConfig.appName}. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 font-medium text-zinc-600">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> for campus life.
          </p>
        </div>

      </div>
    </footer>
  );
}