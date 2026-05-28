import { Link } from "@tanstack/react-router";
import { Bus, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";

export function VendorAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto grid min-h-[calc(100vh-4rem)] gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Bus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Way<span className="text-primary">Go</span> Partners
            </span>
          </Link>

          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Vendor network access
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">{subtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["Verified fleet operations", "Private vendor dashboard", "Admin-reviewed onboarding"].map(
              (item) => (
                <div key={item} className="rounded-lg border bg-background p-4 shadow-soft">
                  <Truck className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-elevated md:p-7">{children}</section>
      </div>
    </div>
  );
}
