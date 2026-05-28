import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { EmptyRows, formatCurrency, shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!mounted) return;
      if (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      } else {
        setBookings(data ?? []);
      }
      setLoading(false);
    }
    loadBookings();

    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void loadBookings();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Bookings</h1>
        <p className="text-sm text-muted-foreground">All recent bookings across the platform.</p>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <EmptyRows colSpan={6} message="Loading bookings..." />
              ) : bookings.length ? (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{shortId(b.id, "WG")}</td>
                    <td className="px-5 py-3 font-medium">{b.passenger_name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {b.from_city} to {b.to_city}
                    </td>
                    <td className="px-5 py-3 capitalize">{b.vehicle_type}</td>
                    <td className="px-5 py-3 font-semibold">{formatCurrency(b.total_price)}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          b.status === "cancelled"
                            ? "destructive"
                            : b.status === "completed"
                              ? "secondary"
                              : "default"
                        }
                        className="capitalize"
                      >
                        {b.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRows colSpan={6} message="No bookings yet." />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
