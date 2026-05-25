import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";
import { BRANDS } from "@/lib/brands";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <Seo title="Request a Quote — Meridian Health Group" description="Request a quotation, product catalogue or distribution partnership with Meridian Health Group." />
      <section className="bg-ink pt-40 pb-20 text-white lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Contact · Request a quote</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] md:text-8xl">
              Let's talk.
            </h1>
            <p className="mt-6 max-w-xl text-white/70 md:text-lg">
              Tell us about your business and which of our brands you're interested in. Our partnership team replies within 48 hours.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-4 space-y-10">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Headquarters</p>
              <p className="mt-3 font-display text-2xl">Meridian Health Group SA</p>
              <p className="text-muted-foreground">12 Rue du Rhône<br/>1204 Geneva, Switzerland</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Partnerships</p>
              <p className="mt-3">partners@meridianhealthgroup.com</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Media</p>
              <p className="mt-3">press@meridianhealthgroup.com</p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-8">
            {sent ? (
              <div className="flex flex-col items-start gap-4 rounded-md border border-black/10 bg-bone p-10">
                <CheckCircle2 className="h-8 w-8 text-lime-dim" />
                <h2 className="font-display text-4xl">Thank you.</h2>
                <p className="text-muted-foreground">Your inquiry has been received. A member of our partnership team will be in touch within 48 hours.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="grid gap-6 rounded-md border border-black/10 p-8 md:grid-cols-2"
              >
                <Field label="Full name" required><input required className="input" placeholder="Jane Mwangi" /></Field>
                <Field label="Company" required><input required className="input" placeholder="Acme Pharmacies" /></Field>
                <Field label="Email" required><input type="email" required className="input" placeholder="jane@company.com" /></Field>
                <Field label="Country" required><input required className="input" placeholder="Kenya" /></Field>
                <Field label="Brand of interest" className="md:col-span-2">
                  <select className="input">
                    <option>All brands</option>
                    {BRANDS.map(b => <option key={b.slug}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Type of inquiry" className="md:col-span-2">
                  <select className="input">
                    <option>Distribution / wholesale</option>
                    <option>Pharmacy / retail</option>
                    <option>Private label</option>
                    <option>Media</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Tell us more" className="md:col-span-2">
                  <textarea className="input min-h-[140px]" placeholder="Share your market, expected volumes and any product specifics." />
                </Field>
                <div className="md:col-span-2">
                  <button type="submit" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/85">
                    Send inquiry
                    <ArrowUpRight className="h-4 w-4 hover-arrow" />
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(0,0,0,0.15);
          padding: 10px 0;
          font-size: 15px;
          outline: none;
          transition: border-color .2s;
        }
        .input:focus { border-color: #24516A; }
      `}</style>
    </>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}{required && " *"}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
