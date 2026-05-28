import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Car, Plus, Check, Pencil, Trash2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublishRideDialog } from "@/components/publish-ride-dialog";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock, shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/shared-taxi")({
  component: AdminSharedTaxiPage,
});

type TaxiRow = Database["public"]["Tables"]["taxis"]["Row"];

function AdminSharedTaxiPage() {
  const [taxis, setTaxis] = useState<TaxiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTaxi, setPublishTaxi] = useState<TaxiRow | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("taxis")
      .select("*")
      .eq("owner_type", "admin")
      .is("vendor_id", null)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setTaxis((data ?? []) as TaxiRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!model.trim() || !plate.trim()) return toast.error("Model and plate required");
    const { error } = await supabase.from("taxis").insert({
      vendor_id: null,
      owner_type: "admin",
      model: model.trim(),
      plate_number: plate.trim(),
      capacity: Number(capacity) || 4,
      taxi_type: "shared",
      active: true,
    });
    if (error) return toast.error(error.message);
    setOpen(false);
    setModel("");
    setPlate("");
    await load();
    toast.success("Shared taxi vehicle added");
  }

  if (loading) return <LoadingBlock label="Loading shared taxis…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shared Taxi</h1>
          <p className="text-sm text-muted-foreground">
            Religious routes only — publish shared taxi rides for customers.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add shared taxi vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Plate</Label>
                <Input value={plate} onChange={(e) => setPlate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void save()}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Publish</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {taxis.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3 font-mono text-xs">{shortId(t.id, "S")}</td>
                <td className="px-5 py-3">
                  <Car className="mr-2 inline h-4 w-4" />
                  {t.model} · {t.plate_number}
                  <Badge className="ml-2" variant="outline">
                    {t.capacity} seats
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setPublishTaxi(t);
                      setPublishOpen(true);
                    }}
                  >
                    <Send className="h-3.5 w-3.5" /> Publish shared ride
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <PublishRideDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        context={
          publishTaxi
            ? { ownerType: "admin", vendorId: null, taxi: publishTaxi, mode: "sharing" }
            : null
        }
      />
    </div>
  );
}
