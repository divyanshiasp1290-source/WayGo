import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { ResultCard } from "@/components/result-card";
import { Button } from "@/components/ui/button";
import { generateResults, type VehicleType } from "@/lib/mock-results";
import { searchPublishedRides } from "@/lib/ride-search";

const searchSchema = z.object({
  type: z.enum(["taxi", "sharing", "bus"]).default("taxi"),
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().min(1),
  tripType: z.enum(["one-way", "round-trip"]).default("one-way"),
  returnDate: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ match }) => {
    const s = match.search as z.infer<typeof searchSchema>;
    return {
      meta: [
        { title: `${s.from} → ${s.to} ${s.type === "taxi" ? "Taxis" : "Rides"} — WayGo` },
        {
          name: "description",
          content: `Available rides from ${s.from} to ${s.to} on ${s.date}.`,
        },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const [sort, setSort] = useState<"price" | "departure" | "duration" | "rating">("price");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchPublishedRides>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      if (params.type === "bus") {
        const mock = generateResults("bus", params.from, params.to, params.date);
        if (!cancelled) {
          setResults(mock);
          setLoading(false);
        }
        return;
      }

      const live = await searchPublishedRides(
        params.type as VehicleType,
        params.from,
        params.to,
        params.date,
      );
      if (!cancelled) {
        setResults(live);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const sorted = useMemo(() => {
    const arr = [...results];
    arr.sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "duration") return a.durationMin - b.durationMin;
      if (sort === "rating") return b.rating - a.rating;
      return a.departure.localeCompare(b.departure);
    });
    return arr;
  }, [results, sort]);

  const dateLabel = new Date(params.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const typeLabel =
    params.type === "taxi" ? "taxis" : params.type === "sharing" ? "shared taxis" : "buses";

  return (
    <div className="bg-muted/30 pb-16">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm" className="mb-3 gap-1.5 -ml-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <SearchForm initial={params} />
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {params.from} → {params.to}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dateLabel} ·{" "}
              {loading ? "Searching…" : `${results.length} ${typeLabel} available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {(["price", "departure", "duration", "rating"] as const).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={sort === k ? "default" : "outline"}
                onClick={() => setSort(k)}
                className="capitalize"
              >
                {k}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading rides…</p>
          ) : sorted.length ? (
            sorted.map((r) => <ResultCard key={r.id} result={r} searchParams={params} />)
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No published rides found for this route and date. Try another date or route.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
