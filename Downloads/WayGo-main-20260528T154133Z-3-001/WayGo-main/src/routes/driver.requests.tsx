import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Clock, MapPin, Navigation, Play, Power, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/driver/requests")({
  component: RidesPage,
});

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

interface BookingRow {
  id: string;
  from_city: string;
  to_city: string;
  passenger_name: string;
  passenger_phone: string;
  travel_date: string;
  departure_time: string;
  total_price: number;
  status: string;
  vehicle_type: string;
  trip_type: string;
  driver_name: string | null;
  driver_phone: string | null;
}

function RidesPage() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDriver(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data: driverRow } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (cancelled) return;
      setDriver(driverRow);

      if (!driverRow?.is_online || driverRow.status !== "active") {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, from_city, to_city, passenger_name, passenger_phone, travel_date, departure_time, total_price, status, vehicle_type, trip_type, driver_name, driver_phone",
        )
        .in("vehicle_type", ["taxi", "sharing"])
        .in("status", ["confirmed", "driver_assigned"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (cancelled) return;
      if (error) toast.error(error.message);
      else {
        const filtered = (data ?? []).filter((b) => {
          const unassigned = !b.driver_name && !b.driver_phone;
          const matchName = driverRow.full_name ? b.driver_name === driverRow.full_name : false;
          const matchPhone = driverRow.phone ? b.driver_phone === driverRow.phone : false;
          return unassigned || matchName || matchPhone;
        });
        setRows(filtered as BookingRow[]);
      }
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("driver-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function acceptRide(booking: BookingRow) {
    if (!driver?.is_online) {
      toast.error("Go online from your dashboard to accept rides");
      return;
    }
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "driver_assigned",
        driver_name: driver.full_name,
        driver_phone: driver.phone,
      })
      .eq("id", booking.id);
    if (error) toast.error(error.message);
    else toast.success("Ride accepted");
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(`Marked as ${status.replace("_", " ")}`);
  }

  if (!loading && driver && !driver.is_online) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ride requests</h1>
          <p className="text-sm text-muted-foreground">You are offline. Go online to receive requests.</p>
        </div>
        <Card className="p-8 text-center">
          <Power className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Turn on &quot;Go online&quot; from your dashboard to start accepting rides.
          </p>
          <Button asChild className="mt-4">
            <Link to="/driver">Open dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ride requests</h1>
        <p className="text-sm text-muted-foreground">
          Accept incoming bookings and update ride progress in real time.
        </p>
      </div>

      {loading && (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading rides…</Card>
      )}

      {!loading && rows.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No active taxi requests right now.
        </Card>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {r.trip_type?.replace("-", " ") ?? "one way"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-lg font-semibold">
                  {r.from_city} → {r.to_city}
                </p>
                <p className="text-sm text-muted-foreground">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {r.passenger_name} · {r.passenger_phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {r.travel_date} · departs {r.departure_time}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold">₹{Number(r.total_price).toLocaleString("en-IN")}</span>
                {r.status === "confirmed" && (
                  <Button size="sm" className="gap-1" onClick={() => void acceptRide(r)}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                )}
                {r.status === "driver_assigned" && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => void updateStatus(r.id, "en_route")}>
                    <Navigation className="h-4 w-4" /> Start trip
                  </Button>
                )}
                {r.status === "en_route" && (
                  <Button size="sm" className="gap-1 bg-success" onClick={() => void updateStatus(r.id, "completed")}>
                    <Play className="h-4 w-4" /> Complete
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => void updateStatus(r.id, "cancelled")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
