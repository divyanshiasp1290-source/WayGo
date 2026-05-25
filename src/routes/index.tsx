import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Bus, Shield, Clock, Wallet, Star } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WayGo — Book Taxis & Buses Online" },
      {
        name: "description",
        content:
          "Compare and book taxis and buses across cities. Transparent pricing, instant confirmation, and a clean booking experience.",
      },
      { property: "og:title", content: "WayGo — Book Taxis & Buses Online" },
      {
        property: "og:description",
        content: "Search routes, compare operators, and book your next ride in seconds.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Modern taxi and bus on a scenic highway"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>

        <div className="container relative mx-auto px-4 pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-current" /> Trusted by 1M+ travellers
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Book taxis & buses,
              <br />
              the smart way.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85 md:text-lg">
              Compare operators, see live timings, and confirm your seat in under a minute.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl md:mt-12">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for travellers who value speed, clarity, and trust.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "Best price guarantee",
              desc: "Transparent fares with no hidden booking fees, ever.",
            },
            {
              icon: Clock,
              title: "Instant confirmation",
              desc: "Tickets confirmed the moment you book. No waiting.",
            },
            {
              icon: Shield,
              title: "Verified operators",
              desc: "Only safety-checked, top-rated taxi and bus operators.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:shadow-elevated"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle types */}
      <section className="border-t bg-gradient-soft">
        <div className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-2 md:py-24">
          {[
            {
              icon: Car,
              title: "Taxi rides",
              desc: "Sedans, SUVs, hatchbacks for outstation and city trips.",
            },
            {
              icon: Bus,
              title: "Bus tickets",
              desc: "AC sleepers, semi-sleepers, and Volvo coaches across India.",
            },
          ].map((c) => (
            <Link
              key={c.title}
              to="/"
              className="group flex items-center gap-5 rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <c.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
