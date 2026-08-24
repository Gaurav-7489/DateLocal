import Link from "next/link";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          {/* Abstract background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-uni-primary-50 opacity-60 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-[300px] w-[400px] rounded-full bg-dept-accent-50 opacity-40 blur-3xl" />
          </div>

          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-uni-primary-100 bg-uni-primary-50 px-4 py-1.5 text-sm font-medium text-uni-primary">
              <span className="h-2 w-2 rounded-full bg-uni-primary" aria-hidden="true" />
              Exclusively for {universityConfig.name}
            </span>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your university.{" "}
              <span className="text-uni-primary">Your people.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-lg text-lg text-muted-foreground">
              A private social space to discover friends, study partners, and
              genuine connections — exclusively for verified {universityConfig.shortName} students.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={routes.register}
                className="rounded-[var(--radius-lg)] bg-uni-primary px-8 py-3 text-base font-semibold text-white shadow-[var(--shadow-md)] transition-all duration-200 hover:bg-uni-primary-light hover:shadow-[var(--shadow-lg)]"
              >
                Join your university
              </Link>
              <Link
                href={routes.login}
                className="rounded-[var(--radius-lg)] border border-border bg-card px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
              Built for real campus life
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-6 transition-shadow hover:shadow-[var(--shadow-md)]">
                  <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety */}
        <section className="px-4 py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="text-4xl" aria-hidden="true">🛡️</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Your safety matters</h2>
            <p className="max-w-xl text-muted-foreground">
              Only verified university students can join. Every member is authenticated through
              their university email. Block, report, and control your experience at any time.
            </p>
            <Link
              href={routes.safety}
              className="text-sm font-medium text-uni-primary transition-colors hover:text-uni-primary-light"
            >
              Learn more about safety →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const features = [
  {
    icon: "🔒",
    title: "University verified",
    description: "Only verified students from your university. No outsiders, no fakes.",
  },
  {
    icon: "💬",
    title: "Real conversations",
    description: "Match with someone who catches your eye and start a genuine conversation.",
  },
  {
    icon: "🤝",
    title: "More than dating",
    description: "Find study partners, friends, club members, or your next coffee buddy.",
  },
  {
    icon: "🎯",
    title: "Smart discovery",
    description: "See people who share your interests, courses, and campus life.",
  },
  {
    icon: "🛡️",
    title: "Safe space",
    description: "Block, report, and control your experience. Your privacy comes first.",
  },
  {
    icon: "🏫",
    title: "Campus community",
    description: "A private digital layer for your university — events, posts, and connections.",
  },
];
