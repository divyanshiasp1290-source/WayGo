import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/saved-routes")({
  head: () => ({
    meta: [
      { title: "Saved routes — WayGo" },
      { name: "description", content: "Your bookmarked intercity routes for quick rebooking." },
    ],
  }),
  component: SavedRoutes,
});

const ROUTES = [
  { id: 1, from: "Mumbai", to: "Pune", count: 12 },
  { id: 2, from: "Bengaluru", to: "Mysuru", count: 8 },
  { id: 3, from: "Delhi", to: "Jaipur", count: 5 },
  { id: 4, from: "Hyderabad", to: "Vijayawada", count: 3 },
];

function SavedRoutes() {
  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <Bookmark className="h-6 w-6" /> Saved routes
        </h1>
        <p className="text-sm text-muted-foreground">
          One-tap access to the routes you travel most.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {ROUTES.map((r) => (
            <Card key={r.id} className="group p-5 transition-smooth hover:shadow-elevated">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <span>{r.from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>{r.to}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Booked {r.count} times</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="flex-1 bg-gradient-primary shadow-glow">
                  <Link
                    to="/search"
                    search={{
                      type: "taxi",
                      from: r.from,
                      to: r.to,
                      date: new Date().toISOString().slice(0, 10),
                    }}
                  >
                    Search taxis
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link
                    to="/search"
                    search={{
                      type: "bus",
                      from: r.from,
                      to: r.to,
                      date: new Date().toISOString().slice(0, 10),
                    }}
                  >
                    Search buses
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
