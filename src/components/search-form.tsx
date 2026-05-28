import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Car, MapPin, Bus as BusIcon, Search, Users, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/lib/mock-results";
import { POPULAR_CITIES } from "@/lib/mock-results";

export type TripType = "one-way" | "round-trip";

interface Props {
  className?: string;
  initial?: {
    type?: VehicleType;
    from?: string;
    to?: string;
    date?: string;
    tripType?: TripType;
    returnDate?: string;
  };
}

export function SearchForm({ className, initial }: Props) {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState<VehicleType>(initial?.type ?? "cab");
  const [tripType, setTripType] = useState<TripType>(initial?.tripType ?? "one-way");
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [date, setDate] = useState(initial?.date ?? today);
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? "");
  const [swapAnim, setSwapAnim] = useState(false);

  function swap() {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 300);
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

  const allowedTypes: VehicleType[] = ["cab", "bus", "sharing"];

  const filteredTabs = [
    { value: "cab", label: "Cab", icon: <Car className="h-4 w-4" /> },
    { value: "bus", label: "Bus", icon: <BusIcon className="h-4 w-4" /> },
    { value: "sharing", label: "Shared Taxi", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <form onSubmit={onSubmit} className={cn("w-full space-y-5 md:space-y-6", className)}>
      <div className="rounded-2xl border border-slate-200/70 bg-[#f8fbff] p-1.5">
        <Tabs value={type} onValueChange={(v) => setType(v as VehicleType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {filteredTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {showTripType && (
        <div className="flex flex-wrap gap-2">
          {(["one-way", "round-trip"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                tripType === t
                  ? "bg-slate-900 text-white shadow-[0_10px_30px_-14px_rgba(2,10,25,0.72)]"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-slate-800"
              }`}
            >
              {t === "one-way" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>
      )}

      {/* Search Form Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-3 relative ${swapAnim ? "swap-animate" : ""}`}>
        {/* Pickup Location */}
        <div className="space-y-2">
          <Label htmlFor="from" className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Pickup Location
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#0b5ed7] group-focus-within:scale-110">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="from"
              list="cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Select city"
              className="h-12 rounded-2xl border border-blue-100/80 bg-white/95 pl-10 text-sm font-medium placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Drop Location */}
        <div className="space-y-2 relative">
          <Label htmlFor="to" className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Drop Location
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#0b5ed7] group-focus-within:scale-110">
              <MapPin className="h-4 w-4" />
            </div>
            <Input
              id="to"
              list="cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Select city"
              className="h-12 rounded-2xl border border-blue-100/80 bg-white/95 pl-10 text-sm font-medium placeholder:text-slate-400"
              required
            />
          </div>
          {/* Swap Button - positioned between fields on desktop */}
          <div className="hidden lg:block absolute -right-6 top-12">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={swap}
              aria-label="Swap locations"
              className={`rounded-full bg-white text-slate-700 shadow-[0_12px_30px_-18px_rgba(2,10,25,0.5)] border border-slate-200 transition-transform ${swapAnim ? "rotate-180" : ""}`}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pickup Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Pickup Date
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#0b5ed7] group-focus-within:scale-110">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-2xl border border-blue-100/80 bg-white/95 pl-10 text-sm font-medium"
              required
            />
          </div>
        </div>

        {/* Return Date / Passengers */}
        <div className="space-y-2">
          <Label htmlFor="rdate" className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            {tripType === "round-trip" && showTripType ? "Return Date" : "Return (Optional)"}
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#0b5ed7] group-focus-within:scale-110">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              id="rdate"
              type="date"
              value={returnDate}
              min={date || today}
              disabled={!showTripType || tripType === "one-way"}
              onChange={(e) => setReturnDate(e.target.value)}
              className="h-12 rounded-2xl border border-blue-100/80 bg-white/95 pl-10 text-sm font-medium disabled:opacity-60"
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
