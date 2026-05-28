import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, Calendar, Car, MapPin, Bus as BusIcon, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VehicleType } from "@/lib/mock-results";
import { POPULAR_CITIES } from "@/lib/mock-results";

export type TripType = "one-way" | "round-trip";

interface Props {
  initial?: {
    type?: VehicleType;
    from?: string;
    to?: string;
    date?: string;
    tripType?: TripType;
    returnDate?: string;
  };
}

export function SearchForm({ initial }: Props) {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<VehicleType>(initial?.type ?? "taxi");
  const [tripType, setTripType] = useState<TripType>(initial?.tripType ?? "one-way");
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [date, setDate] = useState(initial?.date ?? today);
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? "");

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!from.trim() || !to.trim() || !date) return;
    if (tripType === "round-trip" && !returnDate) return;
    navigate({
      to: "/search",
      search: {
        type,
        from: from.trim(),
        to: to.trim(),
        date,
        tripType,
        ...(tripType === "round-trip" ? { returnDate } : {}),
      },
    });
  }

  const showTripType = type !== "bus";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-4 shadow-elevated md:p-6">
      <Tabs value={type} onValueChange={(v) => setType(v as VehicleType)} className="mb-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="taxi" className="gap-2">
            <Car className="h-4 w-4" /> Taxi
          </TabsTrigger>
          <TabsTrigger value="sharing" className="gap-2">
            <Users className="h-4 w-4" /> Sharing
          </TabsTrigger>
          <TabsTrigger value="bus" className="gap-2">
            <BusIcon className="h-4 w-4" /> Bus
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {showTripType && (
        <div className="mb-4 inline-flex rounded-full border bg-muted/40 p-1 text-sm">
          {(["one-way", "round-trip"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`rounded-full px-4 py-1.5 capitalize transition ${
                tripType === t ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="from" className="text-xs font-medium text-muted-foreground">
            PICKUP
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="from"
              list="cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Pickup city"
              className="h-12 pl-9 text-base"
              required
            />
          </div>
        </div>

        <div className="hidden md:flex md:items-end md:justify-center md:pb-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swap}
            className="rounded-full"
            aria-label="Swap cities"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="to" className="text-xs font-medium text-muted-foreground">
            DROP
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="to"
              list="cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Drop city"
              className="h-12 pl-9 text-base"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium text-muted-foreground">
            DATE
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 pl-9 text-base"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rdate" className="text-xs font-medium text-muted-foreground">
            {tripType === "round-trip" && showTripType ? "RETURN" : "RETURN (optional)"}
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="rdate"
              type="date"
              value={returnDate}
              min={date || today}
              disabled={!showTripType || tripType === "one-way"}
              onChange={(e) => setReturnDate(e.target.value)}
              className="h-12 pl-9 text-base"
              required={tripType === "round-trip" && showTripType}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 gap-2 bg-gradient-primary shadow-glow md:px-8"
        >
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>

      <datalist id="cities">
        {POPULAR_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </form>
  );
}
