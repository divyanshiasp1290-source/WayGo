import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Coins, Download, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/driver/earnings")({
  component: EarningsPage,
});

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];

const DRIVER_STATUSES = ["completed", "en_route", "driver_assigned", "confirmed"] as const;

function EarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDriver(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDriver() {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setDriver(null);
      } else {
        setDriver(data);
      }
    }

    setLoading(true);
    void loadDriver().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!driver) {
      setBookings([]);
      return;
    }

    let cancelled = false;

    async function loadBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, from_city, to_city, total_price, status, driver_name, driver_phone, created_at, travel_date",
        )
        .in("status", DRIVER_STATUSES as readonly string[])
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled) return;
      if (error) {
        setBookings([]);
        return;
      }

      const filtered = (data ?? []).filter((booking) => {
        const nameMatch = driver.full_name ? booking.driver_name === driver.full_name : false;
        const phoneMatch = driver.phone ? booking.driver_phone === driver.phone : false;
        return nameMatch || phoneMatch;
      });

      setBookings(filtered);
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [driver]);

  const { thisWeek, pendingPayout, avgPerTrip, chartData, tripCount } = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 6);

    const recentBookings = bookings.filter((booking) => {
      const date = booking.travel_date ? new Date(booking.travel_date) : new Date(booking.created_at);
      return date >= oneWeekAgo && date <= now;
    });

    const thisWeek = recentBookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0);
    const completedBookings = bookings.filter((booking) => booking.status === "completed");
    const pendingPayout = completedBookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0);
    const avgPerTrip = bookings.length
      ? Math.round((bookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0) / bookings.length) * 100) / 100
      : 0;

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(oneWeekAgo);
      date.setDate(oneWeekAgo.getDate() + index);
      const label = date.toLocaleDateString("en-IN", { weekday: "short" });
      return { label, date, value: 0 };
    });

    for (const booking of recentBookings) {
      const date = booking.travel_date ? new Date(booking.travel_date) : new Date(booking.created_at);
      const day = days.find((dayEntry) => dayEntry.date.toDateString() === date.toDateString());
      if (day) {
        day.value += Number(booking.total_price ?? 0);
      }
    }

    return {
      thisWeek,
      pendingPayout,
      avgPerTrip,
      chartData: days.map((dayEntry) => ({ d: dayEntry.label, v: dayEntry.value })),
      tripCount: bookings.length,
    };
  }, [bookings]);

  const MAX = Math.max(...chartData.map((w) => w.v), 1);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading earnings…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Earnings</h1>
          <p className="text-sm text-muted-foreground">Last 7 days performance.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          label="This week"
          value={`₹${thisWeek.toLocaleString("en-IN")}`}
          icon={Coins}
          trend={`${tripCount} trips`}
          tone={thisWeek > 0 ? "success" : "default"}
        />
        <StatCard
          label="Pending payout"
          value={`₹${pendingPayout.toLocaleString("en-IN")}`}
          icon={Wallet}
          trend="Completed trips"
        />
        <StatCard
          label="Avg per trip"
          value={`₹${avgPerTrip.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          trend={tripCount ? `${tripCount} trip${tripCount === 1 ? "" : "s"}` : "No trips yet"}
          tone={avgPerTrip >= 1000 ? "success" : "default"}
        />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Daily earnings</h2>
        <div className="mt-5 flex items-end justify-between gap-2 h-48">
          {chartData.map((w) => (
            <div key={w.d} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex flex-1 flex w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-primary"
                  style={{ height: `${(w.v / MAX) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
