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

type SharingRideRow = Database["public"]["Tables"]["sharing_rides"]["Row"];

type Props = {
  ownerType: "vendor" | "admin";
  vendorId?: string | null;
  title: string;
};

export function PublishedSharingRidesTable({ ownerType, vendorId, title }: Props) {
  const [rides, setRides] = useState<SharingRideRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SharingRideRow | null>(null);

  // form state
  const [travelDate, setTravelDate] = useState("");
  const [departureAt, setDepartureAt] = useState(""); // datetime-local
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [seatsTotal, setSeatsTotal] = useState("");

  const queryFilter = useMemo(() => {
    if (ownerType === "vendor") {
      return { owner_type: "vendor" as const, vendor_id: vendorId ?? null };
    }
    return { owner_type: "admin" as const, vendor_id: null };
  }, [ownerType, vendorId]);

  async function load() {
    setLoading(true);

    // NOTE: In this project, generated supabase types might be outdated vs actual DB schema.
    // sharing_rides columns like owner_type/vendor_id/travel_date may not exist in TS types.
    // So we use loose typing via `as any`.
    let q: any = supabase
      .from("sharing_rides")
      .select(
        "id, owner_type, vendor_id, taxi_id, route_id, driver_id, from_city, to_city, travel_date, departure_at, price_per_seat, seats_total, seats_booked, status, created_at, updated_at"
      );

    q = q.eq("owner_type", queryFilter.owner_type);
    if (ownerType === "vendor") {
      q = q.eq("vendor_id", queryFilter.vendor_id);
    } else {
      q = q.is("vendor_id", null);
    }

    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRides([]);
    } else {
      setRides((data ?? []) as unknown as SharingRideRow[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, vendorId]);

  useEffect(() => {
    if (!editOpen || !editing) return;

    setTravelDate((editing as any).travel_date ? String((editing as any).travel_date) : "");

    // departure_at might be timestamptz; convert to datetime-local if possible
    if ((editing as any).departure_at) {
      const d = new Date((editing as any).departure_at as any);
      if (!Number.isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        setDepartureAt(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      } else {
        setDepartureAt("");
      }
    } else {
      setDepartureAt("");
    }

    setPricePerSeat(String((editing as any).price_per_seat ?? ""));
    setSeatsTotal(String((editing as any).seats_total ?? ""));
  }, [editOpen, editing]);

  function openEdit(ride: SharingRideRow) {
    setEditing(ride);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
    setTravelDate("");
    setDepartureAt("");
    setPricePerSeat("");
    setSeatsTotal("");
  }

  async function saveEdit() {
    if (!editing) return;

    const priceNum = Number(pricePerSeat);
    const seatsNum = Number(seatsTotal);

    if (!travelDate) return toast.error("Travel date is required");
    if (!departureAt) return toast.error("Departure time is required");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return toast.error("Enter valid price per seat");
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) return toast.error("Enter valid seats total");

    const payload: any = {
      travel_date: travelDate,
      departure_at: new Date(departureAt).toISOString(),
      price_per_seat: priceNum,
      seats_total: Math.round(seatsNum),
    };

    const { error } = await supabase
      .from("sharing_rides")
      .update(payload)
      .eq("id", (editing as any).id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Ride updated");
    closeEdit();
    await load();
  }

  async function deleteRide(ride: SharingRideRow) {
    if (!window.confirm(`Delete shared taxi ride ${(ride as any).from_city} → ${(ride as any).to_city}?`)) return;

    const { error } = await supabase
      .from("sharing_rides")
      .delete()
      .eq("id", (ride as any).id);

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
                <th className="px-5 py-3">Departure</th>
                <th className="px-5 py-3">Price/seat</th>
                <th className="px-5 py-3">Seats (total/booked)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rides.length ? (
                rides.map((r) => (
                  <tr key={(r as any).id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">
                      {(r as any).from_city} → {(r as any).to_city}
                    </td>
                    <td className="px-5 py-3">{(r as any).travel_date}</td>
                    <td className="px-5 py-3">
                      {(r as any).departure_at
                        ? new Date((r as any).departure_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-5 py-3">₹ {(r as any).price_per_seat}</td>
                    <td className="px-5 py-3">
                      {(r as any).seats_total} / {(r as any).seats_booked}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={(r as any).status === "open" ? "default" : "secondary"}>
                        {(r as any).status}
                      </Badge>
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
                    No published shared rides yet.
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
            <DialogTitle>Edit shared taxi ride</DialogTitle>
            <DialogDescription>
              {editing ? `${(editing as any).from_city} → ${(editing as any).to_city}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Travel date</Label>
              <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Departure</Label>
              <Input
                type="datetime-local"
                value={departureAt}
                onChange={(e) => setDepartureAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price per seat (₹)</Label>
              <Input
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label>Seats total</Label>
              <Input
                value={seatsTotal}
                onChange={(e) => setSeatsTotal(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={() => void saveEdit()}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

