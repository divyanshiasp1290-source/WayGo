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
    <div className="travel-shell pb-16">
      <div className="border-b border-slate-200/70 bg-white/72 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <span className="travel-kicker px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
              Live search
            </span>
          </div>

          <div className="travel-surface p-4 md:p-5">
            <div className="mb-4">
              <span className="travel-kicker inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                Refine your route
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Premium {typeLabel} search
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Compare operators, schedules, and pricing across the best available rides.
              </p>
            </div>
            <SearchForm initial={params} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="travel-surface p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008cff]">
                Trip summary
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {params.from} → {params.to}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {dateLabel} • {loading ? "Searching…" : `${results.length} ${typeLabel} available`}
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  { label: "Departure", value: dateLabel },
                  { label: "Trip type", value: params.tripType.replace("-", " ") },
                  { label: "Service", value: params.type === "taxi" ? "Taxi ride" : params.type === "sharing" ? "Shared taxi" : "Bus" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[#f4f8fe] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#d9e8ff] bg-[#ecf4ff] px-3 py-3 text-sm text-slate-600">
                Update the search card above if you want to change dates, cities, or move between taxi, shared taxi, and bus options.
              </div>
            </div>
          </aside>

          <section className="travel-surface p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008cff]">
                  Results
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {loading ? "Searching premium rides" : `${results.length} matches found`}
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#f2f6fc] px-3 py-2">
                <SlidersHorizontal className="h-4 w-4 text-[#008cff]" />
                <span className="text-xs font-semibold text-slate-500">Sort by:</span>
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
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
                  Loading rides…
                </div>
              ) : sorted.length ? (
                sorted.map((r) => <ResultCard key={r.id} result={r} searchParams={params} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
                  No published rides found for this route and date. Try another date or route.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
