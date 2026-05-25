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
    <Card className="overflow-hidden p-4 transition hover:shadow-md md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 md:flex-1">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight">{result.operator}</h3>
            <p className="text-sm text-muted-foreground">{result.vehicleClass}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {result.amenities.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="text-xs font-normal">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:flex-1 md:justify-center">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums">{result.departure}</div>
            <div className="text-xs text-muted-foreground">{searchParams.from}</div>
          </div>
          <div className="flex flex-col items-center text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="mt-0.5">
              {hours}h {mins > 0 ? `${mins}m` : ""}
            </span>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums">{result.arrival}</div>
            <div className="text-xs text-muted-foreground">{searchParams.to}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{result.price}</div>
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-current text-amber-500" />
                {result.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {result.seatsAvailable} left
              </span>
            </div>
          </div>
          <Button asChild size="sm">
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
