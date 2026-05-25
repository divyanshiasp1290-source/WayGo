import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, MessageCircle, Mail } from "lucide-react";
import { BRANDS } from "@/lib/brands";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";

export const Route = createFileRoute("/request-quote")({ component: RequestQuote });

const paymentMethods = ["Bank Transfer", "Crypto Currency", "Card Payment"];

function RequestQuote() {
  const [sent, setSent] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedBrand(params.get("brand") || "");
    setSelectedProduct(params.get("product") || "");
    setQuantity(params.get("quantity") || "1");
    setPrice(params.get("price") || "");
    setSku(params.get("sku") || "");
  }, []);

  const products = BRANDS.find((brand) => brand.name === selectedBrand)?.products ?? [];

  return (
    <>
      <Seo
        title="Request Product Quote | Meridian Health Group"
        description="Submit an order inquiry for Meridian Health Group brand products, select quantity and choose Bank Transfer, Crypto Currency or Card Payment preference."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Meridian Health Group request quote form",
          description: "Request product prices, quantities and payment options for Meridian Health Group brands.",
        }}
      />

      <section className="bg-ink pt-40 pb-20 text-white lg:pt-48">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Order inquiry · quotation request</p>
            <h1 className="mt-4 max-w-5xl font-display text-6xl leading-[0.95] md:text-8xl">Request a quote.</h1>
            <p className="mt-6 max-w-2xl text-white/70 md:text-lg">
              Select product quantity and submit your inquiry. Our team will confirm final pricing, availability and payment instructions.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <aside className="space-y-8 lg:col-span-4">
            <Reveal>
              <div className="rounded-xl bg-bone p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Selected order</p>
                <h2 className="mt-3 font-display text-3xl">{selectedProduct || "Product inquiry"}</h2>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p><span className="text-ink">Brand:</span> {selectedBrand || "Not selected"}</p>
                  <p><span className="text-ink">SKU:</span> {sku || "To be confirmed"}</p>
                  <p><span className="text-ink">Price:</span> {price || "Shown on product page"}</p>
                  <p><span className="text-ink">Quantity:</span> {quantity}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl border border-black/10 p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Need quick help?</p>
                <div className="mt-5 flex flex-col gap-3">
                  <a href="https://wa.me/0000000000" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:bg-bone">
                    <MessageCircle className="h-4 w-4" /> WhatsApp inquiry
                  </a>
                  <a href="mailto:sales@meridianhealthgroup.com" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:bg-bone">
                    <Mail className="h-4 w-4" /> Email sales team
                  </a>
                </div>
              </div>
            </Reveal>
          </aside>

          <Reveal delay={0.1} className="lg:col-span-8">
            {sent ? (
              <div className="flex flex-col items-start gap-4 rounded-xl border border-black/10 bg-bone p-10">
                <CheckCircle2 className="h-8 w-8 text-lime-dim" />
                <h2 className="font-display text-4xl">Inquiry submitted.</h2>
                <p className="text-muted-foreground">Thank you. Meridian Health Group will contact you with quotation and payment details.</p>
                <Link to="/brands" className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white">
                  Browse more brands <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-6 rounded-xl border border-black/10 p-8 md:grid-cols-2">
                <Field label="Full name" required><input name="fullName" required className="input" placeholder="Your full name" /></Field>
                <Field label="Company name" required><input name="company" required className="input" placeholder="Company / Pharmacy / Store" /></Field>
                <Field label="Email address" required><input name="email" type="email" required className="input" placeholder="name@company.com" /></Field>
                <Field label="Phone number" required><input name="phone" required className="input" placeholder="+91 00000 00000" /></Field>
                <Field label="Country" required><input name="country" required className="input" placeholder="India" /></Field>
                <Field label="Preferred payment method" required>
                  <select name="paymentMethod" required className="input" defaultValue="">
                    <option value="" disabled>Select payment method</option>
                    {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                  </select>
                </Field>
                <Field label="Brand name" required>
                  <select name="brand" required className="input" value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setSelectedProduct(""); }}>
                    <option value="">Select brand</option>
                    {BRANDS.map((brand) => <option key={brand.slug}>{brand.name}</option>)}
                  </select>
                </Field>
                <Field label="Product name" required>
                  <select name="product" required className="input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                    <option value="">Select product</option>
                    {products.map((product) => <option key={product.sku}>{product.name}</option>)}
                  </select>
                </Field>
                <Field label="Quantity" required><input name="quantity" type="number" min="1" required className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
                <Field label="Displayed price"><input name="price" className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Auto-filled from product page" /></Field>
                <Field label="Additional message" className="md:col-span-2">
                  <textarea name="message" className="input min-h-[140px]" placeholder="Share delivery country, expected volume, target products or any special request." />
                </Field>
                <div className="md:col-span-2">
                  <button type="submit" className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/85">
                    Submit order inquiry <ArrowUpRight className="h-4 w-4 hover-arrow" />
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
