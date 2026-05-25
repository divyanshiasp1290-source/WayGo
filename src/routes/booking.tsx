import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Calendar, MapPin, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDuration } from "@/lib/mock-results";
import type { SearchResult } from "@/lib/mock-results";
import { getRideResult } from "@/lib/get-ride-result";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { BadgePercent } from "lucide-react";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

const searchSchema = z.object({
  resultId: z.string(),
  type: z.enum(["taxi", "sharing", "bus"]),
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().min(1),
  tripType: z.enum(["one-way", "round-trip"]).default("one-way"),
  returnDate: z.string().optional(),
});

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Confirm booking — WayGo" },
      { name: "description", content: "Review and confirm your taxi or bus booking on WayGo." },
    ],
  }),
  component: BookingPage,
});

const passengerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  seats: z.number().int().min(1).max(10),
  pickup: z.string().trim().min(3, "Enter a pickup address").max(200),
  drop: z.string().trim().min(3, "Enter a drop address").max(200),
});

function BookingPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loadingRide, setLoadingRide] = useState(true);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingRide(true);
    void getRideResult(params.resultId, params.type, params.from, params.to, params.date).then(
      (ride) => {
        if (!cancelled) {
          setResult(ride);
          setLoadingRide(false);
        }
      },
    );
    void supabase
      .from("coupons")
      .select("*")
      .eq("active", true)
      .then(({ data }) => {
        if (!cancelled) setCoupons(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const selectedCoupon = useMemo(
    () => coupons.find((c) => c.id === selectedCouponId) ?? null,
    [coupons, selectedCouponId],
  );

  const availableCoupons = useMemo(() => {
    const now = Date.now();
    return coupons.filter((c) => {
      const validUntil = c.valid_until ? new Date(c.valid_until).getTime() : Infinity;
      const hasUses = c.max_uses == null || c.used_count < c.max_uses;
      return c.active && validUntil >= now && hasUses;
    });
  }, [coupons]);

  const isRound = params.tripType === "round-trip";
  const fareMultiplier = isRound ? 1.85 : 1;
  const subtotal = (result?.price ?? 0) * seats;
  const total = Math.round(subtotal * fareMultiplier);
  const taxes = Math.round(total * 0.05);
  const beforeDiscount = total + taxes;

  const discountAmount = useMemo(() => {
    if (!selectedCoupon) return 0;
    if (selectedCoupon.discount_type === "percent") {
      return Math.round((beforeDiscount * Number(selectedCoupon.discount_value)) / 100);
    }
    return Math.min(beforeDiscount, Number(selectedCoupon.discount_value));
  }, [beforeDiscount, selectedCoupon]);

  const grandTotal = Math.max(0, beforeDiscount - discountAmount);

  if (loadingRide || !result) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        {loadingRide ? "Loading ride…" : "Ride not found."}
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: window.location.pathname + window.location.search },
      });
      return;
    }
    const parsed = passengerSchema.safeParse({ name, phone, seats, pickup, drop });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        vehicle_type: params.type,
        operator_name: result.operator,
        from_city: params.from,
        to_city: params.to,
        travel_date: params.date,
        return_date: isRound ? (params.returnDate ?? null) : null,
        trip_type: params.tripType,
        departure_time: result.departure,
        passenger_name: parsed.data.name,
        passenger_phone: parsed.data.phone,
        pickup_address: parsed.data.pickup,
        drop_address: parsed.data.drop,
        seats: parsed.data.seats,
        price_per_seat: result.price,
        total_price: grandTotal,
        status: "confirmed",
        route_id: result.routeId ?? null,
        taxi_id: result.taxiId ?? null,
        sharing_ride_id: result.sharingRideId ?? null,
        coupon_id: selectedCoupon?.id ?? null,
        discount_amount: discountAmount,
      });
      if (!error && selectedCoupon) {
        await supabase
          .from("coupons")
          .update({ used_count: selectedCoupon.used_count + 1 })
          .eq("id", selectedCoupon.id);
      }
      if (error) throw error;
      toast.success("Booking confirmed!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save booking";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const dateLabel = new Date(params.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
          <Link
            to="/search"
            search={{
              type: params.type,
              from: params.from,
              to: params.to,
              date: params.date,
              tripType: params.tripType,
              ...(params.returnDate ? { returnDate: params.returnDate } : {}),
            }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to results
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
            <h1 className="text-2xl font-bold tracking-tight">Passenger details</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll send your booking confirmation to your account.
            </p>

            {!authLoading && !user && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <span>Sign in to complete your booking.</span>
                <Button asChild size="sm">
                  <Link
                    to="/auth"
                    search={{ redirect: window.location.pathname + window.location.search }}
                  >
                    Sign in
                  </Link>
                </Button>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seats">{params.type === "taxi" ? "Vehicles" : "Seats"}</Label>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={Math.min(result.seatsAvailable, 10)}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
                    required
                  />
                </div>
              </div>

              {params.type !== "bus" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pickup">Pickup address</Label>
                    <Input
                      id="pickup"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder={`Building, area, ${params.from}`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="drop">Drop address</Label>
                    <Input
                      id="drop"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder={`Building, area, ${params.to}`}
                      required
                    />
                  </div>
                </div>
              )}

              {availableCoupons.length > 0 && (
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-800 dark:text-green-300">
                    <BadgePercent className="h-4 w-4" /> Apply coupon
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => {
                      const label =
                        coupon.discount_type === "percent"
                          ? `${coupon.discount_value}%`
                          : `₹${coupon.discount_value}`;
                      const selected = selectedCouponId === coupon.id;
                      return (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() =>
                            setSelectedCouponId(selected ? null : coupon.id)
                          }
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                            selected
                              ? "border-green-700 bg-green-100 dark:bg-green-900/50"
                              : "border-green-200 bg-white hover:bg-green-50 dark:bg-background"
                          }`}
                        >
                          <span className="font-mono font-bold text-green-900 dark:text-green-200">
                            {coupon.code}
                          </span>
                          <Badge className="ml-2 bg-green-700 text-white hover:bg-green-800">
                            {label}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full bg-gradient-primary shadow-glow"
                size="lg"
              >
                {submitting
                  ? "Confirming…"
                  : `Confirm & Pay ₹${grandTotal.toLocaleString("en-IN")}`}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure booking · No hidden charges
              </p>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Trip summary
              </h2>
              <div className="mt-3">
                <h3 className="text-lg font-semibold">{result.operator}</h3>
                <p className="text-sm text-muted-foreground">{result.vehicleClass}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
                  {params.tripType.replace("-", " ")}
                </p>
              </div>
              <div className="mt-4 space-y-2.5 border-t pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>{params.from}</strong> → <strong>{params.to}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{dateLabel}</span>
                </div>
                {isRound && params.returnDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Return:{" "}
                      {new Date(params.returnDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Departs {result.departure} · {fmtDuration(result.durationMin)}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ₹{result.price.toLocaleString("en-IN")} × {seats}
                  </span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {isRound && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Round-trip (×1.85)</span>
                    <span>₹{(total - subtotal).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes & fees (5%)</span>
                  <span>₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
