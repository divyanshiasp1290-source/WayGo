import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Coins, Download, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, monthLabel } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/revenue")({
  component: AdminRevenue,
});

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];

function AdminRevenue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadRevenue() {
      const [bookingsResult, paymentsResult] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("payments").select("*"),
      ]);
      setBookings(bookingsResult.data ?? []);
      setPayments(paymentsResult.data ?? []);
    }
    loadRevenue();
  }, []);

  const monthly = useMemo(() => {
    const buckets = new Map<
      string,
      { label: string; bus: number; taxi: number; sharing: number }
    >();
    bookings.forEach((booking) => {
      const key = booking.created_at.slice(0, 7);
      const current = buckets.get(key) ?? {
        label: monthLabel(booking.created_at),
        bus: 0,
        taxi: 0,
        sharing: 0,
      };
      const amount = Number(booking.total_price ?? 0);
      if (booking.vehicle_type === "bus") current.bus += amount;
      else if (booking.vehicle_type === "sharing") current.sharing += amount;
      else current.taxi += amount;
      buckets.set(key, current);
    });
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, value]) => value);
  }, [bookings]);

  const gmv = bookings.reduce((sum, booking) => sum + Number(booking.total_price ?? 0), 0);
  const paid = payments
    .filter((payment) => payment.status === "paid" || payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const pending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const max = Math.max(1, ...monthly.map((m) => m.bus + m.taxi + m.sharing));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Revenue reports</h1>
          <p className="text-sm text-muted-foreground">Breakdown across services.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" disabled>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="GMV" value={formatCurrency(gmv)} icon={Coins} tone="success" />
        <StatCard
          label="Paid revenue"
          value={formatCurrency(paid)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard label="Pending settlement" value={formatCurrency(pending)} icon={Wallet} />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Monthly revenue by service</h2>
        <div className="mt-5 flex h-56 items-end justify-between gap-3">
          {monthly.length ? (
            monthly.map((m) => {
              const total = m.bus + m.taxi + m.sharing;
              const h = (total / max) * 100;
              return (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="flex w-full flex-col overflow-hidden rounded-t-md"
                      style={{ height: `${h}%` }}
                    >
                      <div className="bg-primary-glow" style={{ flex: m.sharing || 0.1 }} />
                      <div className="bg-primary" style={{ flex: m.taxi || 0.1 }} />
                      <div className="bg-foreground" style={{ flex: m.bus || 0.1 }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No revenue data yet.
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-foreground" /> Bus
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-primary" /> Taxi
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-primary-glow" /> Sharing
          </span>
        </div>
      </Card>
    </div>
  );
}
