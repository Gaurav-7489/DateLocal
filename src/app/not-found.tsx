"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, MapPinOff } from "lucide-react";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f7fbf9] px-4 py-8 text-zinc-950 antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_45%)]" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="relative h-48 w-full overflow-hidden sm:h-56">
          <Image
            src="/images/campus-outside.jpg"
            alt="View outside the campus"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/75">Outside the campus</p>
            <p className="mt-1 text-base font-black">Looks like you wandered off.</p>
          </div>
        </div>

        <div className="p-5 text-center sm:p-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <MapPinOff className="h-5 w-5" />
          </div>
          <p className="mt-4 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600">Error 404</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">You&apos;re outside the campus.</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
            This page isn&apos;t part of your campus space. Head back to DateBu and get where you belong.
          </p>

          <div className="mt-6 grid gap-2.5">
            <Link href={routes.home || "/"} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-xs font-black text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700 active:scale-[.99]">
              <Compass className="h-4 w-4" />
              Go back to campus
            </Link>
            <button onClick={() => window.history.back()} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 active:scale-[.99]">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>
        </div>
      </section>

      <p className="absolute bottom-4 text-[10px] font-medium text-zinc-400">{universityConfig.appName} • Student Directory</p>
    </main>
  );
}
