import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Bus, Car, Coins, Route as RouteIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/vendor/")({
  component: VendorDashboard,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type BusRow = Database["public"]["Tables"]["buses"]["Row"];
type TaxiRow = Database["public"]["Tables"]["taxis"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

type TopRoute = { from_city: string; to_city: string; trips: number; revenue: number };

function VendorDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [activeBuses, setActiveBuses] = useState(0);
  const [activeTaxis, setActiveTaxis] = useState(0);
  const [routesCovered, setRoutesCovered] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [topRoutes, setTopRoutes] = useState<TopRoute[]>([]);

  const currentMonthPrefix = useMemo(() => new Date().toISOString().slice(0, 7), []);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("Failed to load vendor:", error);
        setVendor(null);
        return;
      }
      setVendor(data ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (!vendor?.id) return;

    let cancelled = false;

    async function recompute() {
      const [busesRes, taxisRes, routesRes, bookingsRes] = await Promise.all([
        supabase.from("buses").select("id, active, vendor_id").eq("vendor_id", vendor!.id),
        supabase.from("taxis").select("id, active, vendor_id").eq("vendor_id", vendor!.id),
        supabase.from("routes").select("id, active, vendor_id").eq("vendor_id", vendor!.id),

        supabase
          .from("bookings")
          .select("id, total_price, bus_id, taxi_id, from_city, to_city, created_at")
          .gte("created_at", `${currentMonthPrefix}-01`)
          .lt("created_at", `${currentMonthPrefix}-01`),
      ]);

      if (cancelled) return;

      const buses = (busesRes.data ?? []) as BusRow[];
      const taxis = (taxisRes.data ?? []) as TaxiRow[];
      const routes = (routesRes.data ?? []) as RouteRow[];
      const bookings = (bookingsRes.data ?? []) as BookingRow[];

      const busesCount = buses.filter((b) => b.active).length;
      const taxisCount = taxis.filter((t) => t.active).length;
      const routesCount = routes.filter((r) => r.active).length;

      const busIds = new Set(buses.map((b) => b.id));
      const taxiIds = new Set(taxis.map((t) => t.id));

      const monthlyBookings = bookings.filter((b) => {
        if (!b.created_at?.startsWith(currentMonthPrefix)) return false;
        return (b.bus_id && busIds.has(b.bus_id)) || (b.taxi_id && taxiIds.has(b.taxi_id));
      });

      const monthRevenue = monthlyBookings.reduce((sum, b) => sum + Number(b.total_price ?? 0), 0);

      const bucket = new Map<string, { trips: number; revenue: number }>();
      for (const b of monthlyBookings) {
        const key = `${b.from_city}→${b.to_city}`;
        const prev = bucket.get(key) ?? { trips: 0, revenue: 0 };
        prev.trips += 1;
        prev.revenue += Number(b.total_price ?? 0);
        bucket.set(key, prev);
      }

      const sortedTop = [...bucket.entries()]
        .map(([key, v]) => {
          const [from_city, to_city] = key.split("→");
          return { from_city, to_city, trips: v.trips, revenue: v.revenue };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      setActiveBuses(busesCount);
      setActiveTaxis(taxisCount);
      setRoutesCovered(routesCount);
      setRevenueMonth(monthRevenue);
      setTopRoutes(sortedTop);
    }

    void recompute();

    const channel = supabase
      .channel(`vendor-dashboard:${vendor!.id}`)

      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void recompute();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "buses" }, () => {
        void recompute();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "taxis" }, () => {
        void recompute();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "routes" }, () => {
        void recompute();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, currentMonthPrefix]);

  const revenueLabel = useMemo(() => `Rs ${revenueMonth.toLocaleString("en-IN")}`, [revenueMonth]);

  if (authLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendor dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendor dashboard</h1>
        <p className="text-sm text-muted-foreground">Fleet performance at a glance.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Active buses"
          value={activeBuses.toString()}
          icon={Bus}
          tone="success"
          trend={`${activeBuses} total`}
        />
        <StatCard
          label="Active taxis"
          value={activeTaxis.toString()}
          icon={Car}
          tone="success"
          trend={`${activeTaxis} total`}
        />
        <StatCard label="Routes covered" value={routesCovered.toString()} icon={RouteIcon} />
        <StatCard
          label="Revenue (mo)"
          value={revenueLabel}
          icon={Coins}
          tone="success"
          trend="Live"
        />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Top performing routes</h2>
        <div className="mt-3 divide-y text-sm">
          {topRoutes.length ? (
            topRoutes.map((r) => (
              <div
                key={`${r.from_city}-${r.to_city}`}
                className="flex items-center justify-between py-3"
              >
                <span className="font-medium">
                  {r.from_city} → {r.to_city}
                </span>
                <span className="flex items-center gap-6 text-muted-foreground">
                  <span>{r.trips} trips</span>
                  <span className="font-semibold text-foreground">
                    Rs {r.revenue.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No route performance yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
