import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Globe2, Leaf, FlaskConical, ShieldCheck } from "lucide-react";
import { VideoHero } from "@/components/site/VideoHero";
import { Reveal } from "@/components/site/Reveal";
import { BRANDS } from "@/lib/brands";
import { Seo } from "@/lib/seo";
import wellbeing from "@/assets/people-wellbeing.jpg";
import lab from "@/assets/lab-research.jpg";

export const Route = createFileRoute("/")({ component: Home });

const STATS = [
  { k: "38", v: "markets worldwide" },
  { k: "5", v: "category-leading brands" },
  { k: "1.2B", v: "products shipped yearly" },
  { k: "92%", v: "renewable energy" },
];

function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <>
      <Seo
        title="Meridian Health Group — Better everyday health, with humanity"
        description="Meridian Health Group is a family of trusted consumer healthcare brands — vitamins, skincare, oral care, sleep and children's nutrition — present in 38 markets."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Meridian Health Group",
          url: typeof window !== "undefined" ? window.location.origin : "",
          slogan: "Better everyday health, with humanity.",
          brand: BRANDS.map((b) => ({ "@type": "Brand", name: b.name })),
        }}
      />

      <VideoHero
        eyebrow="Meridian Health Group · Consumer Healthcare"
        videoSrc="https://videos.pexels.com/video-files/4124482/4124482-uhd_2560_1440_25fps.mp4"
        title={<>Better everyday<br />health, with <em className="italic text-lime not-italic font-display">humanity.</em></>}
        subtitle="We are a family of five trusted consumer healthcare brands building products people use every day — backed by clinical rigour, designed for real lives."
      />

      {/* Stats marquee */}
      <section className="border-y border-black/5 bg-bone">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-black/10 px-6 lg:grid-cols-4 lg:px-10">
          {STATS.map((s, i) => (
            <Reveal key={s.v} delay={i * 0.08} className="px-6 py-10 first:pl-0">
              <p className="font-display text-5xl tracking-tight md:text-6xl">{s.k}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Editorial intro */}
      <section className="bg-white py-28 lg:py-40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Who we are</p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              <p className="font-display text-4xl leading-[1.1] text-balance md:text-6xl lg:text-7xl">
                Five brands. One belief — that everyday health should be <span className="text-lime-dim">accessible, evidence-led and beautifully made.</span>
              </p>
              <div className="mt-12 grid gap-8 md:grid-cols-2">
                <p className="text-pretty text-base text-muted-foreground md:text-lg">
                  Meridian Health Group was founded to bring clinical-grade consumer healthcare to households that demand more — better ingredients, better evidence, better design. Our brands sit in the bathrooms, kitchens and travel bags of millions across 38 markets.
                </p>
                <p className="text-pretty text-base text-muted-foreground md:text-lg">
                  We don't sell direct. We partner with pharmacies, retailers and distributors who share our standards. Every product is formulated, manufactured and tested under one quality system.
                </p>
              </div>
              <Link to="/about" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium">
                Read our story
                <ArrowUpRight className="h-4 w-4 hover-arrow" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Brands showcase */}
      <section className="bg-ink py-28 text-white lg:py-40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-end justify-between gap-8">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Our brands</p>
              <h2 className="mt-3 font-display text-5xl leading-[1] md:text-7xl">
                A portfolio<br />built on trust.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link to="/brands" className="group hidden items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white hover:text-ink md:inline-flex">
                All brands <ArrowUpRight className="h-4 w-4 hover-arrow" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BRANDS.map((b, i) => (
              <Reveal key={b.slug} delay={i * 0.06}>
                <Link
                  to="/brands/$slug"
                  params={{ slug: b.slug }}
                  className="group block overflow-hidden rounded-md bg-white/[0.03] ring-1 ring-white/10 transition-all hover:ring-white/30"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={b.image}
                      alt={`${b.name} — ${b.category}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.accent }} />
                      {b.category}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-6">
                    <div>
                      <p className="font-display text-3xl">{b.name}</p>
                      <p className="mt-1 text-sm text-white/60">{b.tagline}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax image / quote */}
      <section ref={ref} className="relative h-[80vh] overflow-hidden bg-bone">
        <motion.div style={{ y }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img src={wellbeing} alt="People we serve" className="h-full w-full object-cover" loading="lazy" />
        </motion.div>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 text-white lg:px-10 lg:pb-28">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Our purpose</p>
            <blockquote className="mt-4 max-w-4xl font-display text-4xl leading-[1.1] md:text-6xl">
              "Health isn't a category. It's the morning, the school run, the long flight, the bedtime ritual. We build for all of it."
            </blockquote>
            <p className="mt-6 text-sm text-white/70">— Dr. Lena Marais, Chief Scientific Officer</p>
          </Reveal>
        </div>
      </section>

      {/* Innovation split */}
      <section className="bg-white py-28 lg:py-40">
        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <div className="overflow-hidden rounded-md">
              <img src={lab} alt="Meridian research lab" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Innovation</p>
            <h2 className="mt-3 font-display text-5xl leading-[1] md:text-6xl">Research that respects the consumer.</h2>
            <p className="mt-6 max-w-lg text-pretty text-base text-muted-foreground md:text-lg">
              Our R&amp;D centres in Geneva and Singapore run more than 400 clinical and consumer studies a year. Every formula is reviewed by an independent panel of clinicians before launch.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6">
              {[
                { icon: FlaskConical, t: "12 active patents" },
                { icon: ShieldCheck, t: "ISO 22716 / GMP" },
                { icon: Leaf, t: "Recyclable packaging" },
                { icon: Globe2, t: "38 markets served" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-3 border-t border-black/10 pt-4">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-lime">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/60">For partners</p>
            <h2 className="mt-3 max-w-4xl font-display text-5xl leading-[1] text-ink md:text-7xl">
              Looking to bring our brands to your market?
            </h2>
            <p className="mt-6 max-w-xl text-ink/80">
              We work with pharmacies, retailers and distributors worldwide. Tell us a little about you and our partnership team will be in touch within 48 hours.
            </p>
            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/85"
            >
              Request a quotation
              <ArrowUpRight className="h-4 w-4 hover-arrow" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
