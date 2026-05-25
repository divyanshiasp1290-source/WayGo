import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";

export const Route = createFileRoute("/sustainability")({ component: Sustainability });

const PILLARS = [
  { k: "92%", v: "Renewable electricity across operations by 2025" },
  { k: "100%", v: "Recyclable or refillable primary packaging by 2027" },
  { k: "-40%", v: "Reduction in absolute Scope 1 & 2 emissions vs. 2019" },
  { k: "0", v: "PVC, parabens and microbeads across all formulations" },
];

function Sustainability() {
  return (
    <>
      <Seo title="Sustainability — Meridian Health Group" description="Meridian Health Group's sustainability commitments: renewable energy, recyclable packaging, emissions reduction and clean formulation standards." />
      <section className="bg-bone pt-40 pb-20 lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sustainability</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] md:text-8xl">
              Healthier people. Healthier planet.
            </h1>
          </Reveal>
        </div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-px overflow-hidden rounded-md bg-black/10 px-6 md:grid-cols-2 lg:px-10">
          {PILLARS.map((p, i) => (
            <Reveal key={p.v} delay={i * 0.05}>
              <div className="bg-white p-10">
                <p className="font-display text-7xl tracking-tight text-lime-dim">{p.k}</p>
                <p className="mt-3 text-lg">{p.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
