import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Heart, Lock, MessageCircle, Newspaper, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";

const campusImages = [
  { src: "/campus-main.jpeg", alt: "Main view of Bahra University campus", label: "Main campus" },
  { src: "/campus-building-01.jpeg", alt: "Bahra University academic building", label: "Academic block" },
  { src: "/campus-building-02.jpeg", alt: "Bahra University campus surroundings", label: "Campus surroundings" },
  { src: "/campus-building-03.jpeg", alt: "Bahra University student area", label: "Student life" },
  { src: "/campus-building-04.jpeg", alt: "Bahra University campus view", label: "Around campus" },
  { src: "/campus-building-05.jpeg", alt: "Bahra University campus building", label: "University grounds" },
];

const features = [
  { icon: ShieldCheck, title: "1. Get into the campus", text: "Use the available sign-in method, then complete DateBu's student verification and account checks." },
  { icon: Users, title: "2. Build your profile", text: "Add your name, department, year, interests, campus habits, photos, and the preferences that actually matter to you." },
  { icon: Users, title: "3. Discover students", text: "Browse people from the campus using your discovery preferences instead of scrolling through a random public feed." },
  { icon: Heart, title: "4. Like & match", text: "Send a like when someone feels like your kind of person. When it is mutual, you get a match." },
  { icon: MessageCircle, title: "5. Start talking", text: "Matches open the conversation flow so you can move from a profile to an actual chat." },
  { icon: Sparkles, title: "6. Meet more people", text: "Extrovert gives you a wider social mode when you want to explore beyond your usual discovery range." },
  { icon: Lock, title: "7. Stay in control", text: "Ghost Mode, blocking, reporting, privacy controls, and safety guidance let you decide who gets access to you." },
  { icon: Newspaper, title: "8. Keep up with campus", text: "News & Feedback gives DateBu a place for updates, announcements, and things students should know." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.13),transparent_42%)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-black text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                A student project for {universityConfig.name}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Your university.
                <br />
                <span className="text-emerald-600">Your people.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                {universityConfig.appName} is a campus-first space for the people you actually share university life with — friends, study partners, dates, matches, and conversations.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={routes.register} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0">
                  Join with Email <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={routes.about} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700">
                  See the campus
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-zinc-200 pt-5 text-xs font-semibold text-zinc-600">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Student access</span>
                <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Likes &amp; matches</span>
                <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-blue-600" /> Privacy controls</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.10)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                  <Image src="/campus-main.jpeg" alt="Bahra University campus" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/55 px-4 py-3 text-white backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">This is the place</p>
                    <p className="mt-1 text-sm font-bold">The app is built around the campus you already know.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200/80 bg-white px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">How DateBu works</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">A short guide before you join.</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Think of this page as the quick manual: get access, make yourself recognizable, find people, match, talk, and control your experience.</p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-3xl border border-zinc-200 bg-[#fafafa] p-5 transition-transform hover:-translate-y-0.5">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Know the place</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">These are real {universityConfig.name} campus views.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">You should be able to look at DateBu and immediately know where it belongs. These six views are here to make the product feel connected to the university, not like a generic social app.</p>
              </div>
              <Link href={routes.about} className="inline-flex w-fit items-center gap-1.5 text-xs font-black text-emerald-700 hover:text-emerald-800">Open the full campus page <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {campusImages.map((image, index) => (
                <figure key={image.src} className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white ${index === 0 ? "col-span-2 sm:col-span-2" : ""}`}>
                  <div className="relative aspect-[4/3]">
                    <Image src={image.src} alt={image.alt} fill sizes={index === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"} loading={index === 0 ? "eager" : "lazy"} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <figcaption className="absolute bottom-2 left-2 rounded-xl bg-black/45 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">{image.label}</figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-5xl rounded-[30px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Ready?</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Join, set yourself up, and find your people.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">Once your profile is complete, DateBu takes you straight into the campus experience instead of making you repeat setup every time you sign in.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={routes.register} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-black text-white hover:bg-emerald-700">Join with Email <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link href={routes.safety} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-xs font-bold text-zinc-700 hover:border-emerald-200 hover:text-emerald-700"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Safety</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
