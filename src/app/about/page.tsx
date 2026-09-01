import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Lock, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";

const campusImages = [
  { src: "/campus-main.jpeg", alt: "Main view of the Bahra University campus", label: "Campus" },
  { src: "/campus-building-01.jpeg", alt: "Bahra University campus building", label: "Academic life" },
  { src: "/campus-building-02.jpeg", alt: "Bahra University campus building", label: "Campus spaces" },
  { src: "/campus-building-03.jpeg", alt: "Bahra University campus building", label: "Student life" },
  { src: "/campus-building-04.jpeg", alt: "Bahra University campus building", label: "Around campus" },
  { src: "/campus-building-05.jpeg", alt: "Bahra University campus building", label: "Your campus" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified campus access",
    text: "Student identity starts with Google or a valid Bahra University email, keeping the community focused on real students.",
  },
  {
    icon: Heart,
    title: "Discover & match",
    text: "Find people for friendships, study groups, dates, and shared campus interests without the noise of a general social app.",
  },
  {
    icon: MessageCircle,
    title: "Matches become conversations",
    text: "Mutual likes turn into matches, then into direct conversations and simple campus icebreakers.",
  },
  {
    icon: Users,
    title: "Extrovert mode",
    text: "A separate way to meet more people when you want a wider campus social reach.",
  },
  {
    icon: Lock,
    title: "Privacy & safety",
    text: "Ghost mode, blocking, reporting, profile controls, and dedicated safety guidance keep control with the student.",
  },
  {
    icon: Sparkles,
    title: "Built for campus life",
    text: "The goal is simple: make it easier to find your people while keeping the experience lightweight and mobile-first.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.13),transparent_42%)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl">
            <Link href={routes.home} className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-600 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to campus
            </Link>

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  A student project for {universityConfig.name}
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">
                  Your campus, with the people who are actually here.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                  {universityConfig.appName} is a student-focused social space for meeting people across {universityConfig.name} — from friendships and study partners to matches, chats, and spontaneous campus connections.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={routes.register} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-md shadow-emerald-600/20 transition-transform hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0">
                    Join the campus <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={routes.safety} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-700 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    How it stays safe
                  </Link>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-zinc-200 bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.10)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                  <Image src="/campus-main.jpeg" alt="Bahra University campus" fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/55 px-4 py-3 text-white backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">The place behind the app</p>
                    <p className="mt-1 text-sm font-bold">Real campus. Real students. Real connections.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200/80 bg-white px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">What is inside</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Everything we have been building around campus life.</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">One place for discovery, matches, conversations, profile control, safety, and the extra social tools we have added around them.</p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-3xl border border-zinc-200 bg-[#fafafa] p-5 transition-transform hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Your university</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Not a stock photo. This is the campus.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">A small gallery of the actual university environment so students immediately know what space they are joining.</p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-500">6 campus views</span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {campusImages.map((image, index) => (
                <figure key={image.src} className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white ${index === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""}`}>
                  <div className={`relative ${index === 0 ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
                    <Image src={image.src} alt={image.alt} fill sizes={index === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading={index === 0 ? "eager" : "lazy"} />
                    <div className="absolute inset-x-2 bottom-2 rounded-xl bg-black/45 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">{image.label}</div>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[30px] border border-emerald-200 bg-emerald-50 p-7 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Ready when you are</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Come back inside the campus.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-900/70">Create your student profile, discover people, make a match, and start the conversation.</p>
              </div>
              <Link href={routes.register} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
