import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { ShieldCheck, HeartHandshake, GraduationCap, ArrowRight } from "lucide-react";

export const metadata: Metadata = { 
  title: `About | ${universityConfig.appName}`,
  description: `The private social platform built exclusively for verified ${universityConfig.name} students.`
};

const coreValues = [
  {
    title: "100% Student Verified",
    description: "Every member is verified using their university email. No bots, no outsiders, no fake profiles.",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Campus Centric",
    description: "Built specifically around the culture, locations, and lifestyle of our university community.",
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    title: "Genuine Connections",
    description: "Whether you're looking for a study partner, a friend, or a date, it starts with authentic profiles.",
    icon: HeartHandshake,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  }
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12">
        <PageContainer 
          narrow 
          badge="Our Story"
          title={`About ${universityConfig.appName}`}
          description={`We&apos;re on a mission to build a safer, more authentic social space specifically for ${universityConfig.shortName} students.`}
          withAmbientGlow
        >
          <div className="space-y-16">
            
            {/* Main Narrative */}
            <div className="prose prose-zinc sm:prose-lg max-w-none text-zinc-600">
              <p className="text-lg sm:text-xl font-medium text-zinc-800 leading-relaxed">
                College is about the people you meet. But meeting them on generic social and dating apps can be exhausting, unsafe, and full of people who aren&apos;t even in college.
              </p>
              <p className="leading-relaxed">
                {universityConfig.appName} is a private social ecosystem built exclusively for verified {universityConfig.name} students. We realized that students needed a trusted environment where they could put themselves out there without worrying about spam, scams, or strangers.
              </p>
              <p className="leading-relaxed">
                Unlike generic platforms, we restrict access entirely. If you don&apos;t have an active university credential, you can&apos;t get in. This creates a high-trust community where every profile you see is a real peer walking the same campus as you.
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                Why we built this
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-3">
                {coreValues.map((value) => {
                  const Icon = value.icon;
                  return (
                    <div 
                      key={value.title}
                      className="flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${value.bg} ${value.border} border ${value.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="mb-2 font-bold text-zinc-900">{value.title}</h3>
                      <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 sm:p-10 text-center shadow-xl border border-zinc-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
              
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Ready to join the community?
                </h2>
                <p className="text-zinc-400 font-medium max-w-md mx-auto mb-6">
                  Join hundreds of verified {universityConfig.shortName} students already connecting on the platform.
                </p>
                
                <Link
                  href={routes.register}
                  className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  Create your account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        </PageContainer>
      </div>
      
      <Footer />
    </div>
  );
}