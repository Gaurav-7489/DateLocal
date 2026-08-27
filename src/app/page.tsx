"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  X, 
  ArrowRight, 
  Lock, 
  MessageCircle, 
  Compass, 
  Coffee, 
  Flame, 
  CheckCircle2, 
  Users, 
  MapPin, 
  Building2, 
  GraduationCap,
  MessageSquare,
  User,
  Radio
} from "lucide-react";
import confetti from "canvas-confetti";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface Profile {
  id: string;
  name: string;
  age: number;
  dept: string;
  year: string;
  avatarBg: string;
  bio: string;
  tags: string[];
  vibe: string;
  image?: string;
  spot?: string;
}

const DEMO_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Riya Sharma",
    age: 20,
    dept: "BCA",
    year: "'26",
    avatarBg: "from-emerald-100 to-teal-50",
    bio: "Building Next.js apps & looking for someone to grab canteen chai with ☕",
    tags: ["React", "UI/UX", "Badminton", "Midnight Maggi"],
    vibe: "Chai & Code",
    image: "/images/buphoto.jpeg",
    spot: "Cafeteria Block",
  },
  {
    id: "2",
    name: "Aman Verma",
    age: 21,
    dept: "B.Tech CSE",
    year: "'25",
    avatarBg: "from-orange-100 to-amber-50",
    bio: "DSA grind during the day, campus acoustic sessions at night 🎸",
    tags: ["Guitar", "Competitive Coding", "Anime", "AI"],
    vibe: "Acoustic Vibe",
    image: "/images/buphoto.jpeg",
    spot: "Block 2 Lab",
  },
  {
    id: "3",
    name: "Simran Kaur",
    age: 19,
    dept: "BBA",
    year: "'27",
    avatarBg: "from-blue-100 to-indigo-50",
    bio: "Looking for a study buddy for library prep & hackathon pitch decks 📚",
    tags: ["Marketing", "Debate Club", "Coffee", "Startups"],
    vibe: "Study Partner",
    image: "/images/buphoto.jpeg",
    spot: "Central Library",
  },
];

export default function HomePage() {
  const [deck, setDeck] = useState<Profile[]>(DEMO_PROFILES);
  const [matchUser, setMatchUser] = useState<Profile | null>(null);

  const activeIndex = deck.length - 1;
  const currentCard = deck[activeIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentCard) return;

    if (direction === "right") {
      setMatchUser(currentCard);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10B981", "#F97316", "#3B82F6", "#F43F5E"],
      });
    }

    setDeck((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden font-sans pb-32">
      <Navbar />

      <main className="flex-1 flex flex-col space-y-16 sm:space-y-24">
        
        {/* ================= HERO SECTION WITH GENEROUS BREATHING ROOM ================= */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-6 pt-32 pb-12 overflow-hidden">
          
          {/* Ambient Lighting Engine for Pure White Canvas */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-emerald-200/40 via-orange-200/30 to-blue-200/40 rounded-full blur-[130px]" />
            <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-emerald-100/60 rounded-full blur-[120px]" />
            <div className="absolute bottom-10 -right-40 w-[450px] h-[450px] bg-blue-100/60 rounded-full blur-[130px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Hero Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
            >
              {/* Verified Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                Exclusively for {universityConfig.name} Students
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-zinc-950">
                Your university. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-orange-500 to-blue-600 bg-clip-text text-transparent">
                  Your people.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed">
                The authentic digital campus layer. Find genuine friendships, study groups, hackathon teams, and dates without outsiders or fake profiles.
              </p>

              {/* CTA Action Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-3 w-full sm:w-auto">
                <Link
                  href={routes.register}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Join with BU Email
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href={routes.safety}
                  className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-xs"
                >
                  <ShieldCheck className="mr-2 w-4 h-4 text-emerald-600" />
                  100% Student Verified
                </Link>
              </div>

              {/* Micro Metrics */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-zinc-200 text-xs text-zinc-600 w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Domain Auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Campus Direct Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Ghost Mode &amp; Safety</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Card Stack */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-5 flex justify-center items-center relative py-6"
            >
              <div className="relative w-full max-w-[340px] h-[480px]">
                <AnimatePresence>
                  {deck.length > 0 ? (
                    deck.map((profile, index) => {
                      const isTop = index === activeIndex;
                      return (
                        <InteractiveCard
                          key={profile.id}
                          profile={profile}
                          isTop={isTop}
                          onSwipe={handleSwipe}
                        />
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-full w-full rounded-3xl border border-zinc-200 bg-white p-8 flex flex-col items-center justify-center text-center shadow-xl space-y-3"
                    >
                      <Sparkles className="w-12 h-12 text-orange-500 animate-bounce mb-2" />
                      <h3 className="text-xl font-bold text-zinc-900">All Caught Up!</h3>
                      <p className="text-xs text-zinc-500 max-w-[210px] leading-relaxed">
                        You&apos;ve checked all verified students in this batch.
                      </p>
                      <button
                        onClick={() => setDeck(DEMO_PROFILES)}
                        className="mt-4 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                      >
                        Reset Demo Cards
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ================= CAMPUS MARQUEE ================= */}
        <div className="w-full overflow-hidden border-y border-zinc-200/80 py-5 bg-white/70 backdrop-blur-md">
          <div className="animate-marquee gap-4 flex items-center">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-4 py-2 rounded-full bg-white border border-zinc-200/90 text-zinc-700 whitespace-nowrap shadow-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ================= STACKED 1-BY-1 FEATURE SHOWCASE (NO SQUEEZED COLUMNS) ================= */}
        <section className="relative px-6 py-8 max-w-2xl mx-auto w-full space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">Explore Campus Hub</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Engineered for real campus life.
            </h2>
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              No random outsiders. Tap on any feature card below to experience direct student interactions.
            </p>
          </div>

          <div className="flex flex-col space-y-5 w-full">
            
            {/* Feature Card 1: 100% University Verified */}
            <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-zinc-900">100% University Verified</h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  Zero fake accounts or bots. Registration requires direct single sign-on verification via <span className="text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">@bahrauniversity.edu.in</span>.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 w-fit">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono text-emerald-700 font-semibold">Campus Directory Active</span>
                </div>
                <Link
                  href={routes.register}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Verify Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature Card 2: Campus Chat Hub */}
            <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-zinc-900">Instant Campus Chat</h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  Connect with matches instantly using student icebreakers, study prompts, and canteen chai plans.
                </p>
              </div>
              <Link
                href={routes.login}
                className="w-full py-3 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                Open Chats <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature Card 3: Intent Modes */}
            <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 shadow-xs">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-zinc-900">Campus Intent Modes</h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  Signal whether you&apos;re looking to date, study at the library, or grab cafeteria chai.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs px-3.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-medium">
                  ☕ Chai Break
                </span>
                <span className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                  📚 Study Sync
                </span>
              </div>
            </div>

            {/* Feature Card 4: Safe Space & Ghost Mode */}
            <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-zinc-900">Safe Space &amp; Ghost Mode</h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                  Toggle ghost mode during exams, control who sees your department, and block or report in 1-tap.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Zero Outside Visibility
                </span>
                <span className="text-emerald-700 font-semibold">Protected by BU Auth</span>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Match Celebration Dialog */}
      <AnimatePresence>
        {matchUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm rounded-3xl bg-white border border-zinc-200 p-7 text-center shadow-2xl overflow-hidden space-y-4"
            >
              <button
                onClick={() => setMatchUser(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Campus Connection!
              </div>

              <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
                It&apos;s a Match!
              </h2>
              <p className="text-xs text-zinc-600">
                You and <span className="text-emerald-600 font-semibold">{matchUser.name}</span> liked each other.
              </p>

              <div className="flex items-center justify-center -space-x-4 py-2">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-900 shadow-md">
                  You
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow-md">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {matchUser.name.split(" ")[0]}
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link
                  href={routes.register}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" /> Send Message
                </Link>
                <button
                  onClick={() => setMatchUser(null)}
                  className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />

      {/* ================= INSTAGRAM-STYLE FIXED BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-zinc-200/90 px-6 py-3 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)] max-w-lg mx-auto sm:rounded-t-3xl">
        
        {/* Discover / Feed */}
        <Link 
          href="/" 
          className="flex flex-col items-center gap-1 text-emerald-600 group active:scale-90 transition-transform"
        >
          <Compass className="w-6 h-6 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-tight">Discover</span>
        </Link>

        {/* Live Matches */}
        <Link 
          href={routes.app || "/app"} 
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 group active:scale-90 transition-transform"
        >
          <Heart className="w-6 h-6 stroke-[1.8] group-hover:stroke-zinc-900" />
          <span className="text-[10px] font-medium tracking-tight">Matches</span>
        </Link>

        {/* Canteen / Campus Chat with Red Alert Badge */}
        <Link 
          href={routes.login} 
          className="relative flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 group active:scale-90 transition-transform"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 stroke-[1.8] group-hover:stroke-zinc-900" />
            <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white text-[8px] font-extrabold text-white flex items-center justify-center">
              3
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-tight">Chats</span>
        </Link>

        {/* Safety & Ghost Mode */}
        <Link 
          href={routes.safety} 
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 group active:scale-90 transition-transform"
        >
          <ShieldCheck className="w-6 h-6 stroke-[1.8] group-hover:stroke-zinc-900" />
          <span className="text-[10px] font-medium tracking-tight">Safety</span>
        </Link>

        {/* Account / Student Profile */}
        <Link 
          href={routes.register} 
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-900 group active:scale-90 transition-transform"
        >
          <User className="w-6 h-6 stroke-[1.8] group-hover:stroke-zinc-900" />
          <span className="text-[10px] font-medium tracking-tight">Profile</span>
        </Link>

      </nav>
    </div>
  );
}

// ---------------- WHITE DOMINANT SWIPE CARD COMPONENT ----------------

function InteractiveCard({
  profile,
  isTop,
  onSwipe,
}: {
  profile: Profile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-180, -100, 0, 100, 180], [0.6, 0.9, 1, 0.9, 0.6]);

  const likeOpacity = useTransform(x, [10, 70], [0, 1]);
  const passOpacity = useTransform(x, [-70, -10], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 90) {
      onSwipe("right");
    } else if (info.offset.x < -90) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 0.85,
        scale: isTop ? 1 : 0.96,
        zIndex: isTop ? 10 : 0,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full w-full rounded-3xl bg-white border border-zinc-200/90 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-hidden">
        
        {/* Swipe Overlays */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-4 left-4 z-20 px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 font-extrabold text-xs uppercase tracking-wider shadow-xs"
            >
              Like
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-4 right-4 z-20 px-3 py-1 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 font-extrabold text-xs uppercase tracking-wider shadow-xs"
            >
              Pass
            </motion.div>
          </>
        )}

        {/* Card Visual Hero Area */}
        <div className={`relative h-56 w-full rounded-2xl bg-gradient-to-br ${profile.avatarBg} overflow-hidden flex flex-col justify-end p-4 border border-zinc-200/60`}>
          {profile.image && (
            <>
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                priority
                className="object-cover object-center filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-[10px] font-semibold text-emerald-700 shadow-xs z-10">
            <ShieldCheck className="w-3 h-3" /> BU Verified
          </div>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{profile.name}, {profile.age}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/80 text-white shadow-xs">
                {profile.dept} {profile.year}
              </span>
            </div>
            <p className="text-xs text-zinc-200 mt-1 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Interest Tags */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => onSwipe("left")}
            className="w-11 h-11 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-90 cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] font-medium text-zinc-400">
            Drag card or tap
          </span>

          <button
            type="button"
            onClick={() => onSwipe("right")}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-90 cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const marqueeItems = [
  "🎓 Bahra University Verified Only",
  "☕ Canteen Maggi & Chai Breaks",
  "💻 Midnight Hackathons & Devs",
  "🏸 Campus Badminton & Sports",
  "📚 Central Library Study Groups",
  "🎸 Acoustic & Music Sessions",
  "🛡️ Zero Fake Profiles",
  "🎯 Department & Batch Filtering",
];