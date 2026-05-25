import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bus,
  Calendar,
  Car,
  CheckCircle2,
  Circle,
  MapPin,
  Phone,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Bookings — WayGo" },
      {
        name: "description",
        content: "View and track your taxi and bus bookings on WayGo in real time.",
      },
    ],
  }),
  component: DashboardPage,
});

type Status = "pending" | "confirmed" | "driver_assigned" | "en_route" | "completed" | "cancelled";

interface Booking {
  id: string;
  vehicle_type: "taxi" | "sharing" | "bus";
  operator_name: string;
  from_city: string;
  to_city: string;
  travel_date: string;
  return_date: string | null;
  trip_type: string;
  departure_time: string;
  passenger_name: string;
  pickup_address: string | null;
  drop_address: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_plate: string | null;
  seats: number;
  total_price: number;
  status: Status;
  created_at: string;
}

const STATUS_FLOW: Status[] = ["confirmed", "driver_assigned", "en_route", "completed"];
const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  driver_assigned: "Driver assigned",
  en_route: "En route",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusTracker({ status }: { status: Status }) {
  if (status === "cancelled") return null;
  const idx = STATUS_FLOW.indexOf(status);
  return (
    <div className="mt-3 flex items-center gap-1">
      {STATUS_FLOW.map((s, i) => {
        const reached = i <= idx;
        return (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center">
              {reached ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
              <span
                className={`mt-1 text-[10px] ${reached ? "text-foreground" : "text-muted-foreground"}`}
              >
                {STATUS_LABEL[s]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${i < idx ? "bg-success" : "bg-muted-foreground/20"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) toast.error(error.message);
      else setBookings(data as unknown as Booking[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`bookings:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setBookings((prev) => {
            if (!prev) return prev;
            if (payload.eventType === "INSERT") return [payload.new as unknown as Booking, ...prev];
            if (payload.eventType === "UPDATE") {
              const updated = payload.new as unknown as Booking;
              return prev.map((b) => (b.id === updated.id ? updated : b));
            }
            if (payload.eventType === "DELETE")
              return prev.filter((b) => b.id !== (payload.old as { id: string }).id);
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function cancel(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking cancelled");
  }

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My bookings</h1>
            <p className="text-sm text-muted-foreground">
              Live status updates for your taxi and bus reservations.
            </p>
          </div>
          <Button asChild className="bg-gradient-primary shadow-glow">
            <Link to="/">Book a new trip</Link>
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
              Loading bookings…
            </div>
          )}

          {!loading && bookings && bookings.length === 0 && (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bus className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">No bookings yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search a route and confirm your first ride.
              </p>
              <Button asChild className="mt-4 bg-gradient-primary shadow-glow">
                <Link to="/">Search rides</Link>
              </Button>
            </div>
          )}

          {!loading &&
            bookings?.map((b) => {
              const VehicleIcon =
                b.vehicle_type === "bus" ? Bus : b.vehicle_type === "sharing" ? UsersRound : Car;
              const statusColor =
                b.status === "completed"
                  ? "bg-success text-success-foreground"
                  : b.status === "cancelled"
                    ? "bg-destructive text-destructive-foreground"
                    : b.status === "en_route"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground";
              return (
                <article
                  key={b.id}
                  className="rounded-2xl border bg-card p-5 shadow-soft transition-smooth hover:shadow-elevated"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1 capitalize">
                          <VehicleIcon className="h-3 w-3" />
                          {b.vehicle_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {b.trip_type?.replace("-", " ") ?? "one way"}
                        </Badge>
                        <Badge className={`capitalize ${statusColor}`}>
                          {STATUS_LABEL[b.status] ?? b.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{b.operator_name}</h3>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {b.from_city} → {b.to_city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(b.travel_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          · {b.departure_time}
                        </span>
                        <span>
                          {b.seats} {b.vehicle_type === "taxi" ? "vehicle(s)" : "seat(s)"} ·{" "}
                          {b.passenger_name}
                        </span>
                      </div>
                      {(b.pickup_address || b.drop_address) && (
                        <p className="text-xs text-muted-foreground">
                          {b.pickup_address && <>Pickup: {b.pickup_address}</>}
                          {b.pickup_address && b.drop_address && " · "}
                          {b.drop_address && <>Drop: {b.drop_address}</>}
                        </p>
                      )}

                      {b.driver_name && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{b.driver_name}</div>
                              {b.vehicle_plate && (
                                <div className="text-xs text-muted-foreground">
                                  {b.vehicle_plate}
                                </div>
                              )}
                            </div>
                          </div>
                          {b.driver_phone && (
                            <Button asChild size="sm" variant="outline" className="ml-auto gap-1.5">
                              <a href={`tel:${b.driver_phone}`}>
                                <Phone className="h-3.5 w-3.5" /> Call
                              </a>
                            </Button>
                          )}
                        </div>
                      )}

                      <StatusTracker status={b.status} />
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          ₹{Number(b.total_price).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-muted-foreground">Total paid</div>
                      </div>
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancel(b.id)}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
}
