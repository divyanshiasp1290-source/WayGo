import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BRANDS } from "@/lib/brands";

const NAV = [
  { label: "About", to: "/about" },
  { label: "Brands", to: "/brands", mega: true },
  { label: "Innovation", to: "/innovation" },
  { label: "Sustainability", to: "/sustainability" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || megaOpen
          ? "bg-white/90 backdrop-blur-xl border-b border-black/5"
          : "bg-transparent"
      }`}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-ink text-white font-display text-lg leading-none">m</span>
          <span className="font-display text-2xl tracking-tight">Meridian</span>
          <span className="ml-1 hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:inline">Health Group</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <div
              key={item.to}
              className="relative"
              onMouseEnter={() => setMegaOpen(item.mega ?? false)}
            >
              <Link
                to={item.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:text-ink"
                activeProps={{ className: "text-ink" }}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/request-quote"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/85"
          >
            Request a quote
            <ArrowUpRight className="h-4 w-4 hover-arrow" />
          </Link>
        </div>

        <button
          aria-label="Open menu"
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="hidden border-t border-black/5 bg-white lg:block"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-6 py-10 lg:px-10">
              <div className="col-span-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Our brands</p>
                <h3 className="mt-3 font-display text-3xl text-balance">A family of brands trusted in 38 markets.</h3>
                <Link
                  to="/brands"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-medium"
                >
                  See all brands
                  <ArrowUpRight className="h-4 w-4 hover-arrow" />
                </Link>
              </div>
              <div className="col-span-9 grid grid-cols-5 gap-4">
                {BRANDS.map((b) => (
                  <Link
                    key={b.slug}
                    to="/brands/$slug"
                    params={{ slug: b.slug }}
                    onClick={() => setMegaOpen(false)}
                    className="group relative overflow-hidden rounded-lg border border-black/5 bg-bone p-4 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded">
                      <img
                        src={b.image}
                        alt={b.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="font-display text-xl">{b.name}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">{b.short}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-black/5 bg-white lg:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 font-display text-2xl"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/request-quote"
                onClick={() => setMobileOpen(false)}
                className="block rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white"
              >
                Request a quote
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {BRANDS.map((b) => (
                  <Link
                    key={b.slug}
                    to="/brands/$slug"
                    params={{ slug: b.slug }}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-black/10 p-3 text-sm"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
