import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";
import wellbeing from "@/assets/people-wellbeing.jpg";
import lab from "@/assets/lab-research.jpg";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <>
      <Seo title="About — Meridian Health Group" description="Meridian Health Group is a Geneva-headquartered consumer healthcare company building five trusted brands across 38 markets." />
      <section className="bg-bone pt-40 pb-20 lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">About Meridian</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] md:text-8xl">
              A consumer healthcare company built around <span className="text-lime-dim">trust.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <img src={wellbeing} alt="People we serve" loading="lazy" className="h-full w-full rounded-md object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-center">
            <p className="font-display text-4xl leading-[1.1] md:text-5xl">
              We were founded with one question: why is everyday healthcare so often poorly made?
            </p>
            <p className="mt-6 text-muted-foreground md:text-lg">
              From a single Geneva pharmacy in 2012, Meridian has grown into a quietly global group — five brands, four R&amp;D centres, one shared quality system. We don't chase trends. We make the products families return to.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Leadership</p>
            <p className="mt-3 font-display text-4xl leading-[1.1] md:text-5xl">
              A founder-led team of clinicians, formulators and operators.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <img src={lab} alt="Lab" loading="lazy" className="h-full w-full rounded-md object-cover" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
