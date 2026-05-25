import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bus, Plus, Check, Pencil, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock, shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/vendor/buses")({
  component: BusesPage,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type BusRow = Database["public"]["Tables"]["buses"]["Row"];
type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

function BusesPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  const assignedDriverByVehicle = useMemo(
    () => new Map(drivers.filter((d) => Boolean(d.assigned_vehicle)).map((d) => [d.assigned_vehicle!, d])),
    [drivers],
  );

  // dialog state
  const [open, setOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusRow | null>(null);
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("40");
  const [busType, setBusType] = useState("ac_seater");
  const [amenities, setAmenities] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const amenitiesArray = useMemo(() => {
    const items = amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return items.length ? items : [];
  }, [amenities]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      if (!user) {
        setVendor(null);
        setBuses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast.error(error.message);
        setVendor(null);
        setBuses([]);
        setLoading(false);
        return;
      }

      setVendor(data ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const vendorId = vendor?.id ?? "";
    if (!vendorId) return;

    let cancelled = false;

    async function load() {
      const [busRes, driverRes] = await Promise.all([
        supabase
          .from("buses")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false }),
        supabase
          .from("drivers")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;
      if (busRes.error) toast.error(busRes.error.message);
      if (driverRes.error) toast.error(driverRes.error.message);

      setBuses((busRes.data ?? []) as BusRow[]);
      setDrivers((driverRes.data ?? []) as DriverRow[]);
      setLoading(false);
    }

    void load();

    const channel = supabase
      .channel(`vendor-buses:${vendorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "buses" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [vendor?.id]);

  async function addBus() {
    await saveBus("create");
  }

  async function updateBus() {
    await saveBus("edit");
  }

  async function saveBus(mode: "create" | "edit") {
    const vendorId = vendor?.id;
    if (!vendorId) return;
    if (!model.trim()) return toast.error("Model is required");
    if (!plateNumber.trim()) return toast.error("Plate number is required");

    const seatsNum = Number(totalSeats);
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) return toast.error("Enter valid seats");

    setSubmitting(true);
    try {
      const payload = {
        vendor_id: vendorId,
        model: model.trim(),
        plate_number: plateNumber.trim(),
        total_seats: seatsNum,
        bus_type: busType.trim() || "ac_seater",
        amenities: amenitiesArray,
        active,
      };

      const { error } =
        mode === "edit" && editingBus
          ? await supabase.from("buses").update(payload).eq("id", editingBus.id).eq("vendor_id", vendorId)
          : await supabase.from("buses").insert(payload);

      if (error) throw error;

      closeForm();

      toast.success(mode === "edit" ? "Bus updated" : "Bus added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save bus");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(bus: BusRow) {
    setEditingBus(bus);
    setModel(bus.model);
    setPlateNumber(bus.plate_number);
    setTotalSeats(String(bus.total_seats));
    setBusType(bus.bus_type);
    setAmenities((bus.amenities ?? []).join(", "));
    setActive(bus.active);
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    setEditingBus(null);
    setModel("");
    setPlateNumber("");
    setTotalSeats("40");
    setBusType("ac_seater");
    setAmenities("");
    setActive(true);
  }

  async function deleteBus(bus: BusRow) {
    const vendorId = vendor?.id ?? "";
    if (!vendorId) return;
    if (!window.confirm(`Delete bus ${bus.model} (${bus.plate_number})?`)) return;
    try {
      const { error } = await supabase.from("buses").delete().eq("id", bus.id).eq("vendor_id", vendorId);
      if (error) throw error;
      toast.success("Bus deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete bus");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buses</h1>
          <p className="text-sm text-muted-foreground">Your bus fleet.</p>
        </div>
        <LoadingBlock label="Loading buses…" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buses</h1>
          <p className="text-sm text-muted-foreground">Your bus fleet.</p>
        </div>

        <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeForm())}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> Add bus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBus ? "Edit bus" : "Add bus"}</DialogTitle>
              <DialogDescription>
                Insert your bus details. Vendor sets vendor_id automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Plate number</Label>
                <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Total seats</Label>
                <Input
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Bus type</Label>
                <Input value={busType} onChange={(e) => setBusType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Amenities (comma separated)</Label>
                <Input
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="ac, wifi"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Active</Label>
                <Button
                  type="button"
                  variant={active ? "default" : "outline"}
                  onClick={() => setActive((v) => !v)}
                >
                  {active ? "Yes" : "No"}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeForm} disabled={submitting}>
                Cancel
              </Button>
              <Button
                className="gap-1.5 bg-gradient-primary shadow-glow"
                onClick={() => void (editingBus ? updateBus() : addBus())}
                disabled={submitting}
              >
                <Check className="h-4 w-4" /> {submitting ? "Saving..." : editingBus ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Seats</th>
                <th className="px-5 py-3">Plate</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {buses.length ? (
                buses.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{shortId(b.id, "B")}</td>
                    <td className="px-5 py-3 font-medium">
                      <Bus className="mr-2 inline h-4 w-4 text-primary" />
                      {b.model}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {(() => {
                        const label = `${b.model} - ${b.plate_number}`;
                        const driver = assignedDriverByVehicle.get(label);
                        return driver ? driver.full_name || driver.email || "Assigned" : "Unassigned";
                      })()}
                    </td>
                    <td className="px-5 py-3">{b.total_seats}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.plate_number}</td>
                    <td className="px-5 py-3">
                      <Badge variant={b.active ? "default" : "secondary"} className="capitalize">
                        {b.active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => void deleteBus(b)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No buses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
