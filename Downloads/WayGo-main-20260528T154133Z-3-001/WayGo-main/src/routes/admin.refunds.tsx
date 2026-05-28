import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, LoadingBlock, shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/refunds")({
  component: AdminRefunds,
});

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

function AdminRefunds() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRefunds() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "cancelled")
      .order("updated_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadRefunds();
  }, []);

  async function markCompleted(booking: Booking) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", booking.id);
    if (error) return toast.error(error.message);
    toast.success("Refund marked as approved");
    loadRefunds();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Refunds</h1>
        <p className="text-sm text-muted-foreground">Cancelled bookings that need review.</p>
      </div>
      {loading ? (
        <LoadingBlock label="Loading refunds..." />
      ) : bookings.length ? (
        <div className="space-y-3">
          {bookings.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortId(r.id, "R")}
                    </span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="font-mono text-xs">{shortId(r.id, "WG")}</span>
                    <Badge variant="secondary">pending</Badge>
                  </div>
                  <p className="text-base font-semibold">{r.passenger_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cancelled {r.vehicle_type} booking from {r.from_city} to {r.to_city}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(r.total_price)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" disabled>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                      onClick={() => markCompleted(r)}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No cancelled bookings need review.
        </Card>
      )}
    </div>
  );
}
