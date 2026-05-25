import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";
import lab from "@/assets/lab-research.jpg";

export const Route = createFileRoute("/innovation")({ component: Innovation });

function Innovation() {
  return (
    <>
      <Seo title="Innovation & R&D — Meridian Health Group" description="Inside the Meridian Health Group R&D engine — 400+ studies a year, four research centres and a network of clinical partners." />
      <section className="bg-bone pt-40 pb-20 lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Innovation</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] md:text-8xl">
              Science is the product.
            </h1>
          </Reveal>
        </div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <img src={lab} alt="Meridian research" loading="lazy" className="h-full w-full rounded-md object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-center">
            <p className="font-display text-4xl leading-[1.1] md:text-5xl">
              Four R&amp;D centres. 400+ studies a year. One quality system.
            </p>
            <p className="mt-6 text-muted-foreground md:text-lg">
              From bioavailability work in Geneva to consumer panels in Singapore, every Meridian product is shaped by independent science before it ever reaches a shelf.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
