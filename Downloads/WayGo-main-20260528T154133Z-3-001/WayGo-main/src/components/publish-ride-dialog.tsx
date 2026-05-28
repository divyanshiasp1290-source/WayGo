import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type RouteRow = Database["public"]["Tables"]["routes"]["Row"] & {
  route_category?: string | null;
};
type TaxiRow = Database["public"]["Tables"]["taxis"]["Row"];
type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

type FleetContext = {
  ownerType: "vendor" | "admin";
  vendorId?: string | null;
  taxi: TaxiRow;
  mode: "taxi" | "sharing";
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: FleetContext | null;
  onPublished?: () => void;
}

export function PublishRideDialog({ open, onOpenChange, context, onPublished }: Props) {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [routeId, setRouteId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [departureTime] = useState("08:00");

  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("4");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !context) return;

    let cancelled = false;

    (async () => {
      let routeQuery = supabase.from("routes").select("*").eq("active", true);

      if (context.ownerType === "vendor" && context.vendorId) {
        routeQuery = routeQuery.eq("vendor_id", context.vendorId);
      } else {
        routeQuery = routeQuery.is("vendor_id", null).eq("owner_type", "admin");
      }

      if (context.mode === "sharing") {
        routeQuery = routeQuery.eq("route_category", "religious");
      }

      const driverQuery =
        context.ownerType === "vendor" && context.vendorId
          ? supabase.from("drivers").select("*").eq("vendor_id", context.vendorId).eq("status", "active")
          : supabase.from("drivers").select("*").is("vendor_id", null).eq("status", "active");

      const [routeRes, driverRes] = await Promise.all([routeQuery, driverQuery]);

      if (cancelled) return;
      if (routeRes.error) toast.error(routeRes.error.message);
      if (driverRes.error) toast.error(driverRes.error.message);

      setRoutes((routeRes.data ?? []) as RouteRow[]);
      setDrivers((driverRes.data ?? []) as DriverRow[]);
      setSeats(String(context.taxi.capacity));
    })();

    return () => {
      cancelled = true;
    };
  }, [open, context]);

  function resetForm() {
    setRouteId("");
    setTravelDate("");
    setPrice("");
    setSeats("4");
  }


  async function publish() {
    if (!context) return;
    const route = routes.find((r) => r.id === routeId);

    if (!route) return toast.error("Select a route");
    if (!travelDate) return toast.error("Travel date is required");


    const priceNum = Number(price);
    const seatsNum = Number(seats);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error("Enter valid price");
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) return toast.error("Enter valid seats");

    setSubmitting(true);
    try {
      if (context.mode === "taxi") {
        const { error } = await supabase.from("taxi_rides").insert({
          vendor_id: (context.vendorId ?? null) as any,
          owner_type: context.ownerType as any,
          taxi_id: context.taxi.id,
          route_id: route.id,
          driver_id: driverId && driverId !== "none" ? driverId : null,
          from_city: route.from_city,
          to_city: route.to_city,
          travel_date: travelDate,
          departure_time: departureTime,
          price: priceNum,
          seats_available: seatsNum,
          status: "open",
        });
        if (error) throw error;
      } else {
        const departureAt = new Date(`${travelDate}T${departureTime}:00`).toISOString();
        const { error } = await supabase.from("sharing_rides").insert({
          vendor_id: (context.vendorId ?? null) as any,
          owner_type: context.ownerType as any,
          taxi_id: context.taxi.id,
          route_id: route.id,
          driver_id: driverId && driverId !== "none" ? driverId : null,
          from_city: route.from_city,
          to_city: route.to_city,
          travel_date: travelDate,
          departure_at: departureAt,
          price_per_seat: priceNum,
          seats_total: seatsNum,
          seats_booked: 0,
          status: "open",
        });
        if (error) throw error;
      }

      toast.success("Ride published");
      resetForm();
      onOpenChange(false);
      onPublished?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish ride");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedRoute = routes.find((r) => r.id === routeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish ride</DialogTitle>
          <DialogDescription>
            {context
              ? `${context.taxi.model} (${context.taxi.plate_number}) · ${context.mode === "sharing" ? "Shared taxi" : "Taxi"}`
              : "Fill ride details to make this available for customers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Route</Label>

            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.from_city} → {r.to_city}
                    {r.route_category ? ` (${r.route_category})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{context?.mode === "sharing" ? "Price per seat (₹)" : "Price (₹)"}</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={selectedRoute ? String(selectedRoute.base_price) : "0"}
              />
            </div>
            <div className="space-y-2">
              <Label>Seats available</Label>
              <Input value={seats} onChange={(e) => setSeats(e.target.value)} inputMode="numeric" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button className="gap-1.5" onClick={() => void publish()} disabled={submitting}>
            <Check className="h-4 w-4" /> {submitting ? "Publishing…" : "Publish ride"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
