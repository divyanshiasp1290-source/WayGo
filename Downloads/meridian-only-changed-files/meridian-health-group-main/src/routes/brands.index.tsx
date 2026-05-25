import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { BRANDS } from "@/lib/brands";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";

export const Route = createFileRoute("/brands/")({ component: BrandsIndex });

function BrandsIndex() {
  return (
    <>
      <Seo
        title="Our Brands — Meridian Health Group"
        description="Discover Meridian Health Group's family of trusted consumer healthcare brands: NovaVit, Pureskin, Dentapro, Calmrest and KidsGlow."
      />
      <section className="bg-bone pt-40 pb-20 lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Our brands</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] tracking-tight md:text-8xl">
              Five brands built for everyday health.
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-muted-foreground md:text-lg">
              Each brand has its own audience, formulation philosophy and design language. All share one quality system and one purpose.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white pb-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          {BRANDS.map((b, i) => (
            <Reveal key={b.slug} delay={(i % 2) * 0.08}>
              <Link
                to="/brands/$slug"
                params={{ slug: b.slug }}
                className={`group grid items-stretch gap-8 border-b border-black/10 py-10 transition-colors hover:bg-bone lg:grid-cols-12 lg:gap-12 lg:py-16 ${i % 2 ? "lg:[direction:rtl]" : ""}`}
              >
                <div className="lg:col-span-5 lg:[direction:ltr]">
                  <div className="aspect-[4/3] overflow-hidden rounded-md">
                    <img src={b.image} alt={b.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  </div>
                </div>
                <div className="flex flex-col justify-center lg:col-span-7 lg:[direction:ltr]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{b.category}</p>
                  <p className="mt-4 font-display text-6xl tracking-tight md:text-7xl">{b.name}</p>
                  <p className="mt-4 max-w-xl text-lg text-muted-foreground">{b.description}</p>
                  <span className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium">
                    Visit brand
                    <ArrowUpRight className="h-4 w-4 hover-arrow" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
