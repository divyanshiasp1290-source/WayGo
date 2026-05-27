import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Car, MapPin, Bus as BusIcon, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapButton } from "@/components/swap-button";
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
    <form onSubmit={onSubmit} className="w-full space-y-6">
      {/* Service Type Tabs */}
      <div className="flex justify-between items-center">
        <Tabs value={type} onValueChange={(v) => setType(v as VehicleType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/30 backdrop-blur-sm p-1 rounded-xl border border-white/10">
            <TabsTrigger 
              value="taxi" 
              className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300"
            >
              <Car className="h-4 w-4" /> 
              <span className="hidden sm:inline text-sm font-medium">Taxi</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sharing" 
              className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300"
            >
              <Users className="h-4 w-4" /> 
              <span className="hidden sm:inline text-sm font-medium">Sharing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bus" 
              className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300"
            >
              <BusIcon className="h-4 w-4" /> 
              <span className="hidden sm:inline text-sm font-medium">Bus</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trip Type Pills */}
      {showTripType && (
        <div className="flex gap-3">
          {(["one-way", "round-trip"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                tripType === t
                  ? "bg-gradient-primary text-white shadow-glow scale-105"
                  : "bg-white/40 text-foreground/70 hover:bg-white/60 border border-white/20"
              }`}
            >
              {t === "one-way" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>
      )}

      {/* Search Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-3 relative">
        {/* Pickup Location */}
        <div className="space-y-2">
          <Label htmlFor="from" className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
            Pickup Location
          </Label>
          <div className="relative group">
            <div className="premium-icon-wrapper absolute left-3 top-1/2 -translate-y-1/2 z-10 group-focus-within:scale-110">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="from"
              list="cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Select city"
              className="premium-input pl-11 text-sm font-medium placeholder:text-foreground/40"
              required
            />
          </div>
        </div>

        {/* Drop Location */}
        <div className="space-y-2 relative">
          <Label htmlFor="to" className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
            Drop Location
          </Label>
          <div className="relative group">
            <div className="premium-icon-wrapper absolute left-3 top-1/2 -translate-y-1/2 z-10 group-focus-within:scale-110">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="to"
              list="cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Select city"
              className="premium-input pl-11 text-sm font-medium placeholder:text-foreground/40"
              required
            />
          </div>
          {/* Swap Button - positioned between fields on desktop */}
          <div className="hidden lg:block absolute -right-6 top-12">
            <SwapButton onClick={swap} />
          </div>
        </div>

        {/* Pickup Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
            Pickup Date
          </Label>
          <div className="relative group">
            <div className="premium-icon-wrapper absolute left-3 top-1/2 -translate-y-1/2 z-10 group-focus-within:scale-110">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="premium-input pl-11 text-sm font-medium"
              required
            />
          </div>
        </div>

        {/* Return Date / Passengers */}
        <div className="space-y-2">
          <Label htmlFor="rdate" className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
            {tripType === "round-trip" && showTripType ? "Return Date" : "Return (Optional)"}
          </Label>
          <div className="relative group">
            <div className="premium-icon-wrapper absolute left-3 top-1/2 -translate-y-1/2 z-10 group-focus-within:scale-110">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              id="rdate"
              type="date"
              value={returnDate}
              min={date || today}
              disabled={!showTripType || tripType === "one-way"}
              onChange={(e) => setReturnDate(e.target.value)}
              className="premium-input pl-11 text-sm font-medium disabled:opacity-60"
              required={tripType === "round-trip" && showTripType}
            />
          </div>
        </div>
      </div>

      {/* Mobile Swap Button */}
      <div className="lg:hidden flex justify-center pt-2">
        <button
          onClick={swap}
          type="button"
          className="px-6 py-2 rounded-full bg-white/40 border border-white/20 hover:bg-white/60 transition-all text-sm font-medium text-foreground/70"
        >
          Swap Locations
        </button>
      </div>

      {/* Search Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          className="premium-btn gap-2 px-8 md:px-12 text-base font-semibold hover-lift"
        >
          <Search className="h-5 w-5" /> 
          <span>Search Rides</span>
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
