import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaxiRideRow = Database["public"]["Tables"]["taxi_rides"]["Row"];

type Props = {
  ownerType: "vendor" | "admin";
  vendorId?: string | null;
  title: string;
};

export function PublishedTaxiRidesTable({ ownerType, vendorId, title }: Props) {
  const [rides, setRides] = useState<TaxiRideRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<TaxiRideRow | null>(null);

  // form state
  const [travelDate, setTravelDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");

  const queryFilter = useMemo(() => {
    if (ownerType === "vendor") {
      return { owner_type: "vendor" as const, vendor_id: vendorId ?? null };
    }
    return { owner_type: "admin" as const, vendor_id: null };
  }, [ownerType, vendorId]);

  async function load() {
    setLoading(true);
    const q = supabase
      .from("taxi_rides")
      .select(
        "id, owner_type, vendor_id, taxi_id, route_id, driver_id, from_city, to_city, travel_date, departure_time, price, seats_available, status, created_at, updated_at"
      )
      .eq("owner_type", queryFilter.owner_type);

    if (ownerType === "vendor") {
      q.eq("vendor_id", queryFilter.vendor_id);
    } else {
      q.is("vendor_id", null);
    }

    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRides([]);
    } else {
      setRides((data ?? []) as TaxiRideRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, vendorId]);

  useEffect(() => {
    if (!editOpen || !editing) return;
    setTravelDate(editing.travel_date ?? "");
    setDepartureTime(editing.departure_time ?? "");
    setPrice(String(editing.price));
    setSeatsAvailable(String(editing.seats_available));
  }, [editOpen, editing]);

  function openEdit(ride: TaxiRideRow) {
    setEditing(ride);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
    setTravelDate("");
    setDepartureTime("");
    setPrice("");
    setSeatsAvailable("");
  }

  async function saveEdit() {
    if (!editing) return;
    const date = travelDate;
    const time = departureTime;
    const priceNum = Number(price);
    const seatsNum = Number(seatsAvailable);

    if (!date) return toast.error("Travel date is required");
    if (!time) return toast.error("Departure time is required");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error("Enter valid price");
    if (!Number.isFinite(seatsNum) || seatsNum <= 0)
      return toast.error("Enter valid seats available");

    const payload = {
      travel_date: date,
      departure_time: time,
      price: priceNum,
      seats_available: Math.round(seatsNum),
    };

    const { error } = await supabase.from("taxi_rides").update(payload as any).eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Ride updated");
    closeEdit();
    await load();
  }

  async function deleteRide(ride: TaxiRideRow) {
    if (!window.confirm(`Delete taxi ride ${ride.from_city} → ${ride.to_city}?`)) return;

    const { error } = await supabase.from("taxi_rides").delete().eq("id", ride.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Ride deleted");
    await load();
  }

  if (loading) return <Card className="p-4">Loading…</Card>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">From → To</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Seats</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rides.length ? (
                rides.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">
                      {r.from_city} → {r.to_city}
                    </td>
                    <td className="px-5 py-3">{r.travel_date}</td>
                    <td className="px-5 py-3">{r.departure_time}</td>
                    <td className="px-5 py-3">₹ {r.price}</td>
                    <td className="px-5 py-3">{r.seats_available}</td>
                    <td className="px-5 py-3">
                      <Badge variant={r.status === "open" ? "default" : "secondary"}>{r.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => void deleteRide(r)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No published rides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={(v) => (v ? setEditOpen(true) : closeEdit())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit taxi ride</DialogTitle>
            <DialogDescription>{editing ? `${editing.from_city} → ${editing.to_city}` : ""}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Travel date</Label>
              <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Departure time</Label>
              <Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label>Seats available</Label>
              <Input
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={() => void saveEdit()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

