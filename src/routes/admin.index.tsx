import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Coins, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, monthLabel } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const [profilesResult, driversResult, bookingsResult] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("drivers").select("*"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      ]);
      setProfiles(profilesResult.data ?? []);
      setDrivers(driversResult.data ?? []);
      setBookings(bookingsResult.data ?? []);
    }
    loadDashboard();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthBookings = bookings.filter((booking) => booking.created_at.startsWith(currentMonth));
  const monthRevenue = monthBookings.reduce(
    (sum, booking) => sum + Number(booking.total_price ?? 0),
    0,
  );

  const revenue = useMemo(() => {
    const buckets = new Map<string, number>();
    bookings.forEach((booking) => {
      const key = booking.created_at.slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(booking.total_price ?? 0));
    });
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([key, value]) => ({ m: monthLabel(`${key}-01`), v: value }));
  }, [bookings]);
  const max = Math.max(1, ...revenue.map((r) => r.v));

  const topCities = useMemo(() => {
    const counts = bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.from_city] = (acc[booking.from_city] ?? 0) + 1;
      return acc;
    }, {});
    const total = Math.max(1, bookings.length);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => [city, Math.round((count / total) * 100)] as const);
  }, [bookings]);

  const serviceMix = useMemo(() => {
    const counts = bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.vehicle_type] = (acc[booking.vehicle_type] ?? 0) + 1;
      return acc;
    }, {});
    const total = Math.max(1, bookings.length);
    return Object.entries(counts).map(
      ([service, count]) => [service, Math.round((count / total) * 100)] as const,
    );
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform-wide performance.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Total users"
          value={profiles.length.toLocaleString("en-IN")}
          icon={Users}
        />
        <StatCard
          label="Drivers"
          value={drivers.length.toLocaleString("en-IN")}
          icon={ShieldCheck}
          trend={`${drivers.filter((d) => d.verified).length} active`}
          tone="success"
        />
        <StatCard
          label="Bookings (mo)"
          value={monthBookings.length.toLocaleString("en-IN")}
          icon={BookOpen}
        />
        <StatCard label="Revenue (mo)" value={formatCurrency(monthRevenue)} icon={Coins} />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Revenue</h2>
        <div className="mt-5 flex h-56 items-end justify-between gap-2">
          {revenue.length ? (
            revenue.map((r) => (
              <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-primary"
                    style={{ height: `${(r.v / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{r.m}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No bookings yet.
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricList title="Top cities" rows={topCities} empty="No city data yet." />
        <MetricList title="Service mix" rows={serviceMix} empty="No service data yet." />
      </div>
    </div>
  );
}

function MetricList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
  empty: string;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-2 text-sm">
        {rows.length ? (
          rows.map(([label, percent]) => (
            <div key={label}>
              <div className="flex justify-between">
                <span className="capitalize">{label}</span>
                <span className="text-muted-foreground">{percent}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </div>
    </Card>
  );
}
