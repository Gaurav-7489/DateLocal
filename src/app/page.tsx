import Link from "next/link";
import { ArrowRight, Compass, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { routes } from "@/config/routes";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbf9] font-sans text-zinc-950">
      <header className="relative z-20 px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-zinc-200/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-xl sm:px-5">
          <Link href={routes.home} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"><Heart className="h-5 w-5 fill-current" /></span>
            <span className="text-base font-black tracking-tight">Extrovert<span className="text-emerald-600">.</span></span>
          </Link>
          <div className="hidden items-center gap-1.5 sm:flex">
            <Link href={routes.about} className="rounded-full px-3.5 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">About</Link>
            <Link href={routes.safety} className="rounded-full px-3.5 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">Safety</Link>
            <Link href={routes.login} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold">Sign in</Link>
          </div>
          <Link href={routes.register} className="rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700">Get started</Link>
        </nav>
      </header>

      <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-700 shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Dating + Social</div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-7xl">Meet people.<br /><span className="text-emerald-600">Make it real.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">Extrovert brings dating and social connections into one account. Discover people you like, meet your local crowd, match, chat and stay in control.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={routes.register} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">Start on Extrovert <ArrowRight className="h-4 w-4" /></Link>
              <Link href={routes.about} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-700 hover:border-emerald-200 hover:text-emerald-700">See how it works</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold text-zinc-500"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Optional identity verification</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-600" /> Approximate area privacy</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-emerald-200/70 blur-2xl" />
            <div className="relative rounded-[2.25rem] border border-zinc-200 bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,.14)]">
              <div className="rounded-[1.75rem] bg-zinc-950 p-4 text-white">
                <div className="flex items-center justify-between"><span className="text-xs font-black">Extrovert</span><span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold">Discover</span></div>
                <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-300 via-emerald-500 to-zinc-900 p-5">
                  <div className="flex h-72 flex-col justify-end rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm"><span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Someone new</span><h2 className="mt-1 text-3xl font-black">Your next connection.</h2><p className="mt-2 text-xs text-white/75">Swipe, connect and let the conversation decide.</p></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/10 p-3 text-center"><Heart className="mx-auto h-4 w-4" /><span className="mt-1 block text-[9px] font-bold">Like</span></div><div className="rounded-2xl bg-emerald-500 p-3 text-center"><Zap className="mx-auto h-4 w-4" /><span className="mt-1 block text-[9px] font-bold">Super Like</span></div><div className="rounded-2xl bg-white/10 p-3 text-center"><MessageCircle className="mx-auto h-4 w-4" /><span className="mt-1 block text-[9px] font-bold">Chat</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200/80 bg-white px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">One account. Two ways to connect.</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Dating when you want chemistry. Social when you want people.</h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-6"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white"><Heart className="h-5 w-5 fill-current" /></div><h3 className="mt-5 text-xl font-black">Dating</h3><p className="mt-2 text-sm leading-6 text-zinc-600">Discover profiles, set your preferences, like people, match mutually and move straight into chat.</p><Link href={routes.discover} className="mt-5 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700">Open Dating <ArrowRight className="h-3.5 w-3.5" /></Link></article>
            <article className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-900 text-white"><Users className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-black">Social</h3><p className="mt-2 text-sm leading-6 text-zinc-600">Explore your local community, find people around Waknaghat, Solan and Shimla and send connection requests.</p><Link href={routes.social} className="mt-5 inline-flex items-center gap-1.5 text-xs font-black text-zinc-800">Open Social <ArrowRight className="h-3.5 w-3.5" /></Link></article>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{icon:Compass,title:"Discover",text:"Swipe through people who fit your preferences."},{icon:Users,title:"Social",text:"Meet people in your local area without exposing an exact location."},{icon:MessageCircle,title:"Chat",text:"Turn matches and accepted connections into conversations."},{icon:ShieldCheck,title:"Control",text:"Verification, blocking, reporting and privacy controls stay in your hands."}].map(({icon:Icon,title,text})=><article key={title} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-emerald-600"/><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-1.5 text-xs leading-5 text-zinc-500">{text}</p></article>)}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-[10px] font-semibold text-zinc-400 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Extrovert</span><div className="flex gap-4"><Link href={routes.safety} className="hover:text-emerald-600">Safety</Link><Link href={routes.privacy} className="hover:text-emerald-600">Privacy</Link><Link href={routes.terms} className="hover:text-emerald-600">Terms</Link><Link href={routes.login} className="hover:text-emerald-600">Sign in</Link></div></div></footer>
    </main>
  );
}
