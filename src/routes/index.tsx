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
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight leading-tight md:text-7xl fade-in">
              Book taxis & buses with confidence
              <br />
              Fast, simple, and reliable.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white/90 md:text-2xl fade-in">
              Compare operators, view live timings, and confirm your seat in seconds — all with
              transparent fares.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl md:mt-12 relative z-20 -mt-8 md:-mt-16 fade-in">
            <div className="mx-auto w-full rounded-2xl p-4 md:p-6 shadow-elevated" style={{maxWidth:980}}>
              <SearchForm />
            </div>
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

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Popular destinations</h2>
          <p className="mt-2 text-muted-foreground">Popular routes travellers frequently book</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            "Delhi → Agra",
            "Mumbai → Pune",
            "Bengaluru → Mysuru",
            "Chennai → Pondicherry",
          ].map((d) => (
            <div key={d} className="group overflow-hidden rounded-2xl border bg-card p-4 shadow-soft transition hover:shadow-elevated">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{d}</div>
                  <div className="text-sm text-muted-foreground">Popular route</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Starting from <strong>₹499</strong></div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers & Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Offers & deals</h3>
            <p className="mt-2 text-sm text-muted-foreground">Handpicked discounts for your next trip</p>
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="h-12 w-20 rounded-md bg-gradient-primary" />
                  <div>
                    <div className="font-semibold">Save up to 20% on buses</div>
                    <div className="text-sm text-muted-foreground">Limited period offer</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft md:col-span-2">
            <h3 className="text-lg font-semibold">Why choose WayGo?</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { title: "Best prices", desc: "Transparent fares with no hidden fees" },
                { title: "Verified operators", desc: "Only trusted taxi & bus partners" },
                { title: "Instant confirmation", desc: "Book and receive tickets instantly" },
              ].map((f) => (
                <div key={f.title} className="rounded-lg border p-4">
                  <h4 className="font-semibold">{f.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3 items-start">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Trusted by operators</h3>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {["A", "B", "C", "D"].map((p) => (
                <div key={p} className="h-12 w-24 rounded-md bg-muted flex items-center justify-center">Logo</div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft md:col-span-2">
            <h3 className="text-lg font-semibold">What travellers say</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[1, 2].map((t) => (
                <div key={t} className="rounded-lg border p-4">
                  <div className="font-semibold">Great service</div>
                  <div className="mt-1 text-sm text-muted-foreground">Fast booking and reliable operators.</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download App CTA & FAQ */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl border bg-card p-6 shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Get the WayGo app</h3>
            <p className="mt-2 text-muted-foreground">Book on the go and unlock app-only offers.</p>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-36 rounded-md bg-primary flex items-center justify-center text-white">App Store</div>
            <div className="h-12 w-36 rounded-md bg-primary flex items-center justify-center text-white">Play Store</div>
          </div>
        </div>
      </section>

    </>
  );
}
