import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Car, Plus, Check, Pencil, Trash2, Send } from "lucide-react";
import { PublishRideDialog } from "@/components/publish-ride-dialog";
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

export const Route = createFileRoute("/vendor/taxis")({
  component: TaxisPage,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type TaxiRow = Database["public"]["Tables"]["taxis"]["Row"];

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

function TaxisPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [taxis, setTaxis] = useState<TaxiRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  const assignedDriverByVehicle = useMemo(
    () => new Map(drivers.filter((d) => Boolean(d.assigned_vehicle)).map((d) => [d.assigned_vehicle!, d])),
    [drivers],
  );

  // dialog state
  const [open, setOpen] = useState(false);
  const [editingTaxi, setEditingTaxi] = useState<TaxiRow | null>(null);
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [taxiType, setTaxiType] = useState("sedan");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTaxi, setPublishTaxi] = useState<TaxiRow | null>(null);

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
        setTaxis([]);
        setDrivers([]);
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
        setTaxis([]);
        setDrivers([]);
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
      setLoading(true);
      const [taxiRes, driverRes] = await Promise.all([
        supabase
          .from("taxis")
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

      if (taxiRes.error) toast.error(taxiRes.error.message);
      if (driverRes.error) toast.error(driverRes.error.message);

      setTaxis((taxiRes.data ?? []) as TaxiRow[]);
      setDrivers((driverRes.data ?? []) as DriverRow[]);
      setLoading(false);
    }

    void load();

    const channel = supabase
      .channel(`vendor-taxis:${vendorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "taxis" }, () => {
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

  async function addTaxi() {
    await saveTaxi("create");
  }

  async function updateTaxi() {
    await saveTaxi("edit");
  }

  async function saveTaxi(mode: "create" | "edit") {
    const vendorId = vendor?.id;
    if (!vendorId) return;
    if (!model.trim()) return toast.error("Model is required");
    if (!plateNumber.trim()) return toast.error("Plate number is required");

    const capacityNum = Number(capacity);
    if (!Number.isFinite(capacityNum) || capacityNum <= 0)
      return toast.error("Enter valid capacity");

    setSubmitting(true);
    try {
      const payload: any = {
        vendor_id: vendorId,
        model: model.trim(),
        plate_number: plateNumber.trim(),
        capacity: capacityNum,
        taxi_type: taxiType.trim() || "sedan",
        active,
      };

      const { error } =
        mode === "edit" && editingTaxi
          ? await supabase.from("taxis").update(payload).eq("id", editingTaxi.id).eq("vendor_id", vendorId)
          : await supabase.from("taxis").insert(payload);
      if (error) throw error;

      closeForm();

      toast.success(mode === "edit" ? "Taxi updated" : "Taxi added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save taxi");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(taxi: TaxiRow) {
    setEditingTaxi(taxi);
    setModel(taxi.model);
    setPlateNumber(taxi.plate_number);
    setCapacity(String(taxi.capacity));
    setTaxiType(taxi.taxi_type);
    setActive(taxi.active);
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    setEditingTaxi(null);
    setModel("");
    setPlateNumber("");
    setCapacity("4");
    setTaxiType("sedan");
    setActive(true);
  }

  async function deleteTaxi(taxi: TaxiRow) {
    const vendorId = vendor?.id ?? "";
    if (!vendorId) return;
    if (!window.confirm(`Delete taxi ${taxi.model} (${taxi.plate_number})?`)) return;
    try {
      const { error } = await supabase.from("taxis").delete().eq("id", taxi.id).eq("vendor_id", vendorId);
      if (error) throw error;
      toast.success("Taxi deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete taxi");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Taxis</h1>
          <p className="text-sm text-muted-foreground">Your taxi fleet and drivers.</p>
        </div>
        <LoadingBlock label="Loading taxis…" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Taxis</h1>
          <p className="text-sm text-muted-foreground">Your taxi fleet and drivers.</p>
        </div>

        <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeForm())}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> Add taxi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTaxi ? "Edit taxi" : "Add taxi"}</DialogTitle>
              <DialogDescription>
                Insert your taxi details. Optionally assign a driver.
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
                <Label>Capacity</Label>
                <Input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Taxi type</Label>
                <Input value={taxiType} onChange={(e) => setTaxiType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Driver assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Drivers are assigned automatically when created with this taxi.
                </p>
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
                onClick={() => void (editingTaxi ? updateTaxi() : addTaxi())}
                disabled={submitting}
              >
                <Check className="h-4 w-4" /> {submitting ? "Saving..." : editingTaxi ? "Save" : "Add"}
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
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
                <th className="px-5 py-3">Ride</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {taxis.length ? (
                taxis.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{shortId(t.id, "T")}</td>
                    <td className="px-5 py-3 font-medium">
                      <Car className="mr-2 inline h-4 w-4 text-primary" />
                      {t.model}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {(() => {
                        const label = `${t.model} - ${t.plate_number}`;
                        const driver = drivers.find((d) => d.id === t.driver_id) ?? assignedDriverByVehicle.get(label);
                        return driver ? driver.full_name || driver.email || "Assigned" : "Unassigned";
                      })()}
                    </td>
                    <td className="px-5 py-3">{t.capacity}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.taxi_type}</td>
                    <td className="px-5 py-3">
                      <Badge variant={t.active ? "default" : "secondary"} className="capitalize">
                        {t.active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => void deleteTaxi(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        size="sm"
                        className="gap-1 bg-gradient-primary"
                        onClick={() => {
                          setPublishTaxi(t);
                          setPublishOpen(true);
                        }}
                      >
                        <Send className="h-3.5 w-3.5" /> Publish ride
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No taxis yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PublishRideDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        context={
          publishTaxi && vendor
            ? {
                ownerType: "vendor",
                vendorId: vendor.id,
                taxi: publishTaxi,
                mode: "taxi",
              }
            : null
        }
      />
    </div>
  );
}
