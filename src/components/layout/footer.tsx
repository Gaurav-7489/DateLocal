import Link from "next/link";
import { ShieldCheck, Heart, GraduationCap, Sparkles, ArrowUpRight } from "lucide-react";
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
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-emerald-100/60 via-blue-100/40 to-pink-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-12 border-b border-zinc-200/80">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-5 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-md shadow-emerald-600/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                {universityConfig.shortName.charAt(0)}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-950 flex items-center gap-1.5">
                {universityConfig.appName}
                <span className="text-emerald-600">.</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-1">
                  Beta
                </span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 max-w-sm leading-relaxed">
              The private, verified social ecosystem built exclusively for students of <span className="text-zinc-950 font-semibold">{universityConfig.name}</span>. Say goodbye to outsiders and bots.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-100/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 
                100% Student Verified
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 shadow-2xs transition-all hover:bg-blue-100/70">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> 
                Campus Project
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Platform */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1">
                Platform
              </p>
              <ul className="space-y-2.5">
                {footerNavigation.platform.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-emerald-700 transition-colors"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
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
                      className="group inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-emerald-700 transition-colors"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
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
                      className="group inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-emerald-700 transition-colors"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                    </Link>
                  </li>
                ))}

                <li>
                  <a
                    href="https://www.instagram.com/datebu.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-pink-600 transition-colors"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3 h-3"
                        aria-hidden="true"
                      >
                        <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                      </svg>
                    </div>
                    <span>@datebu.in</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Made with Love */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500">
          <p className="font-medium text-center sm:text-left flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} {universityConfig.appName}. All rights reserved.</span>
          </p>

          <p className="flex items-center gap-1.5 font-medium text-zinc-600 bg-zinc-100/80 px-3 py-1.5 rounded-full border border-zinc-200/50">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Crafted with</span> 
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> 
            <span>for campus life.</span>
          </p>
        </div>

      </div>
    </footer>
  );
}