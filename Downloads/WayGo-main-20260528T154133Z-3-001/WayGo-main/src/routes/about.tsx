import { createFileRoute } from "@tanstack/react-router";
import { Award, Globe, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WayGo" },
      {
        name: "description",
        content:
          "Learn how WayGo is reinventing intercity travel with taxis, sharing rides and buses.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Safety first",
    desc: "Every driver, vehicle and operator passes a multi-step verification.",
  },
  {
    icon: Sparkles,
    title: "Premium experience",
    desc: "From booking to drop-off, we sweat every detail.",
  },
  {
    icon: Heart,
    title: "Fair to all",
    desc: "Transparent pricing for riders. Honest payouts for partners.",
  },
];

const STATS = [
  { value: "1M+", label: "Travellers" },
  { value: "12k", label: "Routes" },
  { value: "850+", label: "Cities" },
  { value: "4.8★", label: "Avg rating" },
];

function AboutPage() {
  return (
    <div className="pb-16">
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            <Globe className="h-3.5 w-3.5" /> Built in India, for the world
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Travel between cities, beautifully.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            We bring taxis, sharing rides and buses into a single, premium booking experience — so
            you can stop juggling apps and just travel.
          </p>
        </div>
      </section>

      <section className="container mx-auto -mt-10 grid gap-3 px-4 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 text-center shadow-soft">
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">What we believe in</h2>
          <p className="mt-2 text-muted-foreground">
            Three principles that guide every decision we make.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border bg-card p-6 shadow-soft transition-smooth hover:shadow-elevated"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-gradient-soft">
        <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" /> Our team
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">A team obsessed with travel</h2>
            <p className="mt-3 text-muted-foreground">
              We're engineers, designers and operators who've spent years building consumer products
              at scale. We started WayGo because intercity travel deserved better.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-soft">
            <Award className="h-8 w-8 text-primary" />
            <p className="mt-3 text-lg font-medium leading-relaxed">
              "Great travel isn't about the destination — it's the calm of knowing your ride is
              sorted."
            </p>
            <p className="mt-3 text-sm text-muted-foreground">— The WayGo team</p>
          </div>
        </div>
      </section>
    </div>
  );
}
