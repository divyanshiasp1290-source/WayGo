import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Car, Coins, Power, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/driver/")({
  component: DriverDashboard,
});

type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type BookingRow = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "id" | "from_city" | "to_city" | "total_price" | "driver_name" | "driver_phone" | "status" | "created_at"
>;

function DriverDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [recentTrips, setRecentTrips] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    if (!user) {
      setDriver(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void supabase
      .from("drivers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          setDriver(null);
        } else {
          setDriver(data);
          setOnline(Boolean(data?.is_online));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function toggleOnline() {
    if (!driver) return;
    if (driver.status !== "active") {
      toast.error("Your account must be active before going online");
      return;
    }
    const next = !online;
    setTogglingOnline(true);
    const { error } = await supabase
      .from("drivers")
      .update({ is_online: next })
      .eq("id", driver.id);
    setTogglingOnline(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOnline(next);
    setDriver((d) => (d ? { ...d, is_online: next } : d));
    toast.success(next ? "You are online — ride requests enabled" : "You are offline");
  }

  useEffect(() => {
    if (!driver) {
      setRecentTrips([]);
      return;
    }

    let cancelled = false;

    async function loadTrips() {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, from_city, to_city, total_price, status, driver_name, driver_phone, created_at")
        .in("status", ["completed", "en_route", "driver_assigned", "confirmed"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        setRecentTrips([]);
        return;
      }

      const filtered = (data ?? []).filter((booking) => {
        const matchName = driver.full_name ? booking.driver_name === driver.full_name : false;
        const matchPhone = driver.phone ? booking.driver_phone === driver.phone : false;
        return matchName || matchPhone;
      });

      setRecentTrips(filtered.slice(0, 3));
    }

    void loadTrips();

    return () => {
      cancelled = true;
    };
  }, [driver]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading your driver dashboard...
        </div>
      </div>
    );
  }

  const driverName = driver?.full_name || user?.email?.split("@")[0] || "driver";
  const status = driver?.status || "pending_verification";

  async function openDocument(path: string | null) {
    if (!path) return toast.error("Document not uploaded");
    const { data, error } = await supabase.storage.from("driver-documents").createSignedUrl(path, 60 * 5);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Unable to open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {driverName}</h1>
          <p className="text-sm text-muted-foreground">Here's your day at a glance.</p>
        </div>
        <Button
          onClick={() => void toggleOnline()}
          disabled={togglingOnline || driver?.status !== "active"}
          variant={online ? "default" : "outline"}
          className={
            online ? "gap-2 bg-success text-success-foreground hover:bg-success/90" : "gap-2"
          }
        >
          <Power className="h-4 w-4" />
          {togglingOnline
            ? "Updating…"
            : online
              ? "Online · accepting rides"
              : "Go online"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Current status"
          value={status.replace("_", " ")}
          icon={Power}
          tone={status === "active" ? "success" : "warning"}
        />
        <StatCard
          label="Rating"
          value={driver?.rating ? driver.rating.toFixed(2) : "N/A"}
          icon={Star}
          trend={driver?.rating ? "Driver rating" : "No rating yet"}
          tone={driver?.rating && driver.rating >= 4.5 ? "success" : "default"}
        />
        <StatCard
          label="Assigned vehicle"
          value={driver?.assigned_vehicle ?? "Not assigned"}
          icon={Car}
          trend={driver?.vehicle_number ? `${driver.vehicle_number} · ${driver.vehicle_type}` : undefined}
        />
        <StatCard
          label="Online now"
          value={online ? "Yes" : "No"}
          icon={Users}
          tone={online ? "success" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Recent trips</h2>
          <div className="mt-3 divide-y">
            {recentTrips.length ? (
              recentTrips.map((trip, index) => (
                <div key={trip.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {trip.from_city} → {trip.to_city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.status.replace("_", " ")} · {new Date(trip.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">₹{Number(trip.total_price ?? 0).toLocaleString("en-IN")}</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No recent trips found for your account yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold">Documents</h2>
          <div className="mt-3 space-y-2 text-sm">
            {[
              {
                label: "Driving licence",
                status: driver?.license_verification_status ?? "pending",
                path: driver?.license_upload_url,
              },
              {
                label: "Aadhaar",
                status: driver?.aadhaar_verification_status ?? "pending",
                path: driver?.aadhaar_upload_url,
              },
              {
                label: "PAN",
                status: driver?.pan_verification_status ?? "pending",
                path: driver?.pan_upload_url,
              },
            ].map((document) => (
              <div key={document.label} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <span>{document.label}</span>
                  <Badge
                    variant={document.status === "verified" ? "default" : document.status === "rejected" ? "destructive" : "secondary"}
                    className={
                      document.status === "verified"
                        ? "bg-success text-success-foreground hover:bg-success/90 border-transparent"
                        : undefined
                    }
                  >
                    {document.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void openDocument(document.path ?? null)}
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
