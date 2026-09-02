import { ArrowUpRight, MessageSquare, ShieldCheck, Sparkles, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-950 antialiased">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-220px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-rose-100/40 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-blue-100/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/10"><span className="text-lg font-black">D</span></div>
            <div><p className="text-base font-black tracking-tight">DateBu</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Campus connections</p></div>
          </div>
          <div className="hidden rounded-full border border-zinc-200 bg-white/80 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 shadow-sm backdrop-blur sm:block">Temporarily offline</div>
        </header>

        <section className="flex flex-1 items-center py-12 sm:py-20">
          <div className="w-full">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black text-emerald-700 shadow-sm sm:text-[11px]">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" /></span>
                DateBu is being worked on
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:mt-7 sm:text-6xl lg:text-7xl">We&apos;re making DateBu<br /><span className="text-emerald-600">better before we bring it back.</span></h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-600 sm:mt-6 sm:text-base sm:leading-8">The DateBu website is temporarily in maintenance while we work through university permissions, platform requirements, and feedback from our users. We&apos;re also redesigning parts of the experience based on what we&apos;ve learned.</p>
            </div>

            <div className="mx-auto mt-9 grid max-w-4xl grid-cols-1 gap-3 sm:mt-12 min-[768px]:grid-cols-3">
              <article className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div><h2 className="mt-4 text-sm font-black">University discussions</h2><p className="mt-2 text-xs leading-5 text-zinc-500">We&apos;re working through permissions and requirements so DateBu can operate properly within the university environment.</p></article>
              <article className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700"><MessageSquare className="h-5 w-5" /></div><h2 className="mt-4 text-sm font-black">User feedback</h2><p className="mt-2 text-xs leading-5 text-zinc-500">Early feedback is helping us figure out what works, what doesn&apos;t, and what deserves to be changed before the next version.</p></article>
              <article className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-700"><Sparkles className="h-5 w-5" /></div><h2 className="mt-4 text-sm font-black">A redesigned experience</h2><p className="mt-2 text-xs leading-5 text-zinc-500">We&apos;re using this pause to clean things up, rethink the experience, and return with a more polished DateBu.</p></article>
            </div>

            <div className="mx-auto mt-6 max-w-4xl rounded-[28px] border border-zinc-200 bg-zinc-950 p-5 text-white shadow-xl shadow-zinc-950/10 sm:mt-8 sm:p-8">
              <div className="flex flex-col gap-5 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
                <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10"><Wrench className="h-5 w-5 text-emerald-400" /></div><div><p className="text-sm font-black">What happens next?</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">The site will return after the current maintenance and redesign work is complete. Thanks to everyone who tested DateBu and shared feedback along the way.</p></div></div>
                <div className="w-fit shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Coming back soon</div>
              </div>
            </div>
            <div className="mx-auto mt-6 flex max-w-4xl items-center justify-center gap-2 text-center text-[11px] font-semibold text-zinc-400 sm:mt-7"><span>Thanks for your patience.</span><ArrowUpRight className="h-3.5 w-3.5" /><span>DateBu team</span></div>
          </div>
        </section>
        <footer className="border-t border-zinc-200/80 py-5 text-center text-[10px] font-semibold text-zinc-400">DateBu is temporarily unavailable while maintenance and redesign work are underway.</footer>
      </div>
    </main>
  );
}
