import { Link } from "@tanstack/react-router";
import { BRANDS } from "@/lib/brands";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Better everyday health,
              <br />
              <span className="text-lime">with humanity.</span>
            </p>
            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white hover:text-ink transition-colors"
            >
              Partner with us
              <ArrowUpRight className="h-4 w-4 hover-arrow" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-10 lg:col-span-7 lg:grid-cols-4">
            <FooterCol title="Company" links={[
              { label: "About", to: "/about" },
              { label: "Innovation", to: "/innovation" },
              { label: "Sustainability", to: "/sustainability" },
              { label: "Newsroom", to: "/about" },
            ]} />
            <FooterCol title="Brands" links={BRANDS.map(b => ({ label: b.name, to: `/brands/${b.slug}` }))} />
            <FooterCol title="For partners" links={[
              { label: "Distributors", to: "/contact" },
              { label: "Retailers", to: "/contact" },
              { label: "Pharmacies", to: "/contact" },
              { label: "Request quote", to: "/contact" },
            ]} />
            <FooterCol title="Legal" links={[
              { label: "Privacy", to: "/" },
              { label: "Terms", to: "/" },
              { label: "Cookies", to: "/" },
              { label: "Modern Slavery", to: "/" },
            ]} />
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Meridian Health Group Holdings. All rights reserved.</p>
          <p>Geneva · Singapore · São Paulo · Seoul</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.to} className="text-sm text-white/80 transition-colors hover:text-lime">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
