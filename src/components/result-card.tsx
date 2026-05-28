import { Link } from "@tanstack/react-router";
import { Clock, Star, Users, Car, Bus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SearchResult, VehicleType } from "@/lib/mock-results";

interface Props {
  result: SearchResult;
  searchParams: {
    type: VehicleType;
    from: string;
    to: string;
    date: string;
    tripType?: "one-way" | "round-trip";
    returnDate?: string;
  };
}

export function ResultCard({ result, searchParams }: Props) {
  const Icon = result.type === "taxi" ? Car : result.type === "sharing" ? UsersRound : Bus;
  const hours = Math.floor(result.durationMin / 60);
  const mins = result.durationMin % 60;

  return (
    <Card className="overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 lg:flex-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f2ff] text-[#008cff]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold leading-tight text-slate-900">{result.operator}</h3>
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[9px]">
                {result.type === "taxi" ? "Taxi" : result.type === "sharing" ? "Shared" : "Bus"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{result.vehicleClass}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.amenities.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="rounded-full bg-[#f0f6ff] text-[10px] font-medium text-slate-700">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-2xl bg-[#f9fbff] px-4 py-3 lg:flex-1 lg:justify-center">
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-slate-900">{result.departure}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{searchParams.from}</div>
          </div>
          <div className="flex flex-col items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Clock className="h-3.5 w-3.5 text-[#008cff]" />
            <span className="mt-1 text-slate-600">
              {hours}h {mins > 0 ? `${mins}m` : ""}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-slate-900">{result.arrival}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{searchParams.to}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
          <div className="text-right">
            <div className="text-3xl font-bold text-[#008cff]">₹{result.price}</div>
            <div className="mt-1 flex items-center justify-end gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-0.5 font-semibold">
                <Star className="h-3 w-3 fill-current text-amber-500" />
                {result.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5 font-semibold">
                <Users className="h-3 w-3" />
                {result.seatsAvailable} left
              </span>
            </div>
          </div>
          <Button asChild size="sm" className="premium-btn px-4">
            <Link
              to="/booking"
              search={{
                resultId: result.id,
                type: searchParams.type,
                from: searchParams.from,
                to: searchParams.to,
                date: searchParams.date,
                tripType: searchParams.tripType ?? "one-way",
                ...(searchParams.returnDate ? { returnDate: searchParams.returnDate } : {}),
              }}
            >
              Book now
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
