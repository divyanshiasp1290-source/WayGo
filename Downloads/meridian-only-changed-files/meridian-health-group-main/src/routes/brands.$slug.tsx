import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, Quote } from "lucide-react";
import { BRANDS, getBrand, type Brand, type Product } from "@/lib/brands";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/lib/seo";

export const Route = createFileRoute("/brands/$slug")({
  component: BrandPage,
  loader: ({ params }) => {
    const brand = getBrand(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
});

const quoteUrl = (brand: Brand, product?: Product, quantity = 1) => {
  const params = new URLSearchParams({
    brand: brand.name,
    quantity: String(quantity),
  });
  if (product) {
    params.set("product", product.name);
    params.set("price", `${product.currency} ${product.price}`);
    params.set("sku", product.sku);
  }
  return `/request-quote?${params.toString()}`;
};

function BrandPage() {
  const { brand } = Route.useLoaderData() as { brand: Brand };

  return (
    <>
      <Seo
        title={`${brand.name} Products & Prices | Meridian Health Group`}
        description={`Explore ${brand.name} ${brand.category.toLowerCase()} products, prices, pack sizes and request a quote from Meridian Health Group.`}
        ogImage={brand.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Brand",
          name: brand.name,
          description: brand.description,
          slogan: brand.tagline,
          parentOrganization: { "@type": "Organization", name: "Meridian Health Group" },
          keywords: brand.keywords.join(", "),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${brand.name} product catalogue`,
            itemListElement: brand.products.map((product) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: product.name,
                sku: product.sku,
                brand: { "@type": "Brand", name: brand.name },
                description: product.description,
              },
              price: product.price,
              priceCurrency: product.currency,
            })),
          },
        }}
      />

      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-white">
        <video src={brand.heroVideo} poster={brand.image} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-between px-6 pb-20 pt-32 lg:px-10 lg:pb-28">
          <nav className="flex items-center gap-2 text-xs text-white/70">
            <Link to="/" className="hover:text-white">Meridian</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/brands" className="hover:text-white">Brands</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{brand.name}</span>
          </nav>
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: brand.accent }} />
              {brand.category}
            </p>
            <h1 className="font-display text-[14vw] leading-[0.9] tracking-tight md:text-[10vw] lg:text-[8vw]">{brand.name}</h1>
            <p className="mt-6 max-w-2xl font-display text-2xl text-white/90 md:text-3xl">{brand.tagline}</p>
            <a href={quoteUrl(brand)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink hover:bg-white/90">
              Request brand quote <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-28 lg:py-40">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <Reveal className="lg:col-span-4"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Brand story</p></Reveal>
          <Reveal delay={0.1} className="lg:col-span-8">
            <p className="font-display text-4xl leading-[1.1] text-balance md:text-5xl">{brand.description}</p>
            <p className="mt-10 max-w-2xl text-pretty text-muted-foreground md:text-lg">{brand.story}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-black/5 bg-bone py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Product categories</p></Reveal>
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-black/10 md:grid-cols-4">
            {brand.categories.map((c, i) => (
              <Reveal key={c} delay={i * 0.05}>
                <div className="group flex h-full items-end justify-between bg-bone p-8 transition-colors hover:bg-white">
                  <span className="font-display text-2xl md:text-3xl">{c}</span>
                  <ArrowUpRight className="h-5 w-5 opacity-30 transition-opacity group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-28 lg:py-36">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Products with prices</p>
            <h2 className="mt-3 font-display text-5xl leading-[1] md:text-6xl">{brand.name} product catalogue.</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">Select quantity and submit an order inquiry. Final quotation, payment instructions and availability are confirmed by our team.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {brand.products.map((product, i) => (
              <ProductCard key={product.sku} brand={brand} product={product} delay={(i % 3) * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-28 text-white lg:py-36">
        <div className="mx-auto max-w-[1100px] px-6 text-center lg:px-10">
          <Reveal>
            <Quote className="mx-auto h-8 w-8 text-lime" />
            <blockquote className="mt-8 font-display text-4xl leading-[1.15] md:text-6xl">
              "{brand.name} is designed for everyday {brand.category.toLowerCase()} needs, with product information, prices and quote support in one place."
            </blockquote>
            <p className="mt-8 text-sm text-white/60">Meridian Health Group brand catalogue</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-lime">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-32">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Get a quote</p>
            <h2 className="mt-3 font-display text-5xl leading-[1] text-ink md:text-7xl">Bring {brand.name} products to your market.</h2>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-end">
            <p className="text-ink/80 md:text-lg">For retailers, pharmacies, distributors and partners — request product pricing, catalogue details or sample availability.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={quoteUrl(brand)} className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/85">Request a quote <ArrowUpRight className="h-4 w-4 hover-arrow" /></a>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-white">General inquiry</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bone py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Explore the family</p><h3 className="mt-3 font-display text-4xl md:text-5xl">Other brands by Meridian</h3></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {BRANDS.filter((b) => b.slug !== brand.slug).map((b) => (
              <Link key={b.slug} to="/brands/$slug" params={{ slug: b.slug }} className="group block overflow-hidden rounded-md bg-white ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden"><img src={b.image} alt={`${b.name} ${b.category} products`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                <div className="p-5"><p className="font-display text-2xl">{b.name}</p><p className="mt-1 text-xs text-muted-foreground">{b.category}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ brand, product, delay }: { brand: Brand; product: Product; delay: number }) {
  return (
    <Reveal delay={delay}>
      <article className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${brand.accent}33, ${brand.accent}11)` }}>
          <img src={brand.image} alt={`${product.name} ${brand.name} product`} loading="lazy" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 hover:scale-105" />
        </div>
        <div className="mt-5 flex flex-1 flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.sku} · {product.packSize}</p>
          <h3 className="mt-2 font-display text-3xl leading-tight">{product.name}</h3>
          <p className="mt-2 text-sm font-medium" style={{ color: brand.accent }}>{product.tagline}</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>
          <ul className="mt-5 space-y-2 text-sm">
            {product.details.map((detail) => <li key={detail} className="border-t border-black/10 pt-2">{detail}</li>)}
          </ul>
          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                <p className="font-display text-4xl">{product.currency} {product.price}</p>
              </div>
            </div>
            <a href={quoteUrl(brand, product)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-ink/85">
              Select quantity & request quote <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
