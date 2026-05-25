import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vehicle/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Vehicle ${params.id} — WayGo` },
      { name: "description", content: "Details, amenities and reviews for this vehicle." },
    ],
  }),
  component: VehicleDetails,
});

function VehicleDetails() {
  const { id } = Route.useParams();

  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
              <div className="aspect-[16/9] bg-gradient-hero" />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="gap-1">
                      <Car className="h-3 w-3" /> Sedan
                    </Badge>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight">
                      BlueRide Premium · {id}
                    </h1>
                    <p className="text-sm text-muted-foreground">Sedan • 4 seats • AC</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold text-foreground">4.8</span>
                    </div>
                    <p className="text-xs text-muted-foreground">1,243 reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                {[
                  { icon: Snowflake, label: "Air conditioning" },
                  { icon: Wifi, label: "Free WiFi" },
                  { icon: ShieldCheck, label: "Verified driver" },
                  { icon: Users, label: "Up to 4 seats" },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-2 rounded-lg bg-muted/40 p-3">
                    <a.icon className="h-4 w-4 text-primary" />
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">About this ride</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Modern, well-maintained sedan with a professional, background-verified chauffeur.
                Perfect for outstation trips — comfortable seating, generous boot space and
                complimentary water.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "Toll & parking included",
                  "Free cancellation up to 4 hours before pickup",
                  "Sanitised between every trip",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Starting from</p>
              <p className="mt-1 text-3xl font-bold text-primary">₹1,240</p>
              <p className="text-xs text-muted-foreground">per trip · all-inclusive</p>
              <Button asChild className="mt-4 w-full bg-gradient-primary shadow-glow" size="lg">
                <Link to="/">Search this route</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Free cancellation · Instant confirmation
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
