import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Coins, Download, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/vendor/earnings")({
  component: VendorEarnings,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Taxi = Database["public"]["Tables"]["taxis"]["Row"];
type Bus = Database["public"]["Tables"]["buses"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

function VendorEarnings() {
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVendor(null);
      setBookings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadVendorData() {
      setLoading(true);
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (vendorError) {
        setVendor(null);
        setBookings([]);
        setLoading(false);
        return;
      }

      setVendor(vendorData ?? null);

      if (!vendorData?.id) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const [taxiRes, busRes] = await Promise.all([
        supabase.from("taxis").select("id").eq("vendor_id", vendorData.id),
        supabase.from("buses").select("id").eq("vendor_id", vendorData.id),
      ]);

      if (cancelled) return;
      const taxiIds = (taxiRes.data ?? []).map((item) => item.id);
      const busIds = (busRes.data ?? []).map((item) => item.id);

      if (!taxiIds.length && !busIds.length) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const bookingRequests: Promise<{
        data: Booking[] | null;
        error: Error | null;
      }>[] = [];

      if (taxiIds.length) {
        bookingRequests.push(
          supabase.from("bookings").select("*").in("taxi_id", taxiIds) as Promise<{
            data: Booking[] | null;
            error: Error | null;
          }>,
        );
      }

      if (busIds.length) {
        bookingRequests.push(
          supabase.from("bookings").select("*").in("bus_id", busIds) as Promise<{
            data: Booking[] | null;
            error: Error | null;
          }>,
        );
      }

      const bookingResults = await Promise.all(bookingRequests);
      if (cancelled) return;

      const allBookings = bookingResults.flatMap((result) => result.data ?? []);
      setBookings(allBookings);
      setLoading(false);
    }

    void loadVendorData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const { thisMonth, pendingSettlement, avgPerTrip, monthlyData, tripCount } = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const completedBookings = bookings.filter((booking) => booking.status === "completed");

    const thisMonth = completedBookings.reduce((sum, booking) => {
      const date = new Date(booking.travel_date || booking.created_at);
      return date >= currentMonthStart ? sum + Number(booking.total_price ?? 0) : sum;
    }, 0);

    const pendingSettlement = completedBookings.reduce((sum, booking) => {
      const date = new Date(booking.travel_date || booking.created_at);
      return date >= weekAgo ? sum + Number(booking.total_price ?? 0) : sum;
    }, 0);

    const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0);
    const avgPerTrip = completedBookings.length ? Math.round((totalRevenue / completedBookings.length) * 100) / 100 : 0;
    const tripCount = completedBookings.length;

    const monthLabels = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return { label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), date };
    });

    const monthlyData = monthLabels.map((labelItem) => ({ d: labelItem.label, v: 0 }));
    for (const booking of completedBookings) {
      const date = new Date(booking.travel_date || booking.created_at);
      const monthLabel = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const entry = monthlyData.find((item) => item.d === monthLabel);
      if (entry) entry.v += Number(booking.total_price ?? 0);
    }

    return { thisMonth, pendingSettlement, avgPerTrip, monthlyData, tripCount };
  }, [bookings]);

  const MAX = Math.max(...monthlyData.map((item) => item.v), 1);

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
          <p className="text-sm text-muted-foreground">Revenue across your fleet and active routes.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          label="This month"
          value={`₹${thisMonth.toLocaleString("en-IN")}`}
          icon={Coins}
          trend={`${tripCount} completed trip${tripCount === 1 ? "" : "s"}`}
          tone={thisMonth > 0 ? "success" : "default"}
        />
        <StatCard
          label="Pending settlement"
          value={`₹${pendingSettlement.toLocaleString("en-IN")}`}
          icon={Wallet}
          trend="Last 7 days"
        />
        <StatCard
          label="Avg per trip"
          value={`₹${avgPerTrip.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          trend={tripCount ? `${tripCount} trips` : "No completed trips"}
          tone={avgPerTrip >= 1000 ? "success" : "default"}
        />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Monthly revenue</h2>
        <div className="mt-5 flex items-end justify-between gap-3 h-56">
          {monthlyData.map((item) => (
            <div key={item.d} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-primary"
                  style={{ height: `${(item.v / MAX) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.d}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
