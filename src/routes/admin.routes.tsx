import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Check, ArrowRight, Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock } from "@/lib/admin-live";

export const Route = createFileRoute("/admin/routes")({
  component: AdminRoutesPage,
});

type RouteRow = {
  id: string;
  from_city: string;
  to_city: string;
  distance_km: number | null;
  duration_minutes: number | null;
  active: boolean;
  route_category?: string | null;
};

function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRow | null>(null);

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [distanceKm, setDistanceKm] = useState("0");

  // UI value in hours; DB column is duration_minutes
  const [durationHours, setDurationHours] = useState("0");

  const [active, setActive] = useState(true);
  const [routeCategory, setRouteCategory] = useState<"normal" | "religious">("normal");

  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("owner_type", "admin")
      .is("vendor_id", null)
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    setRoutes((data ?? []) as RouteRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const hoursToMinutes = useMemo(() => {
    return (hours: number) => Math.round(hours * 60);
  }, []);

  async function save(mode: "create" | "edit") {
    const from = fromCity.trim();
    const to = toCity.trim();
    if (!from || !to) return toast.error("Cities are required");

    const durationNum = Number(durationHours);
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      return toast.error("Enter valid duration (hours)");
    }

    const durationMinutes = hoursToMinutes(durationNum);

    setSubmitting(true);
    try {
      // Use `as any` because the generated supabase types in this project appear
      // to not include `owner_type` for this table, but runtime accepts it.
      const payload = {
        vendor_id: null,
        owner_type: "admin" as const,
        from_city: from,
        to_city: to,
        distance_km: Number(distanceKm) || 0,
        duration_minutes: durationMinutes,
        active,
        route_category: routeCategory,
      } as any;

      const { error } =
        mode === "edit" && editingRoute
          ? await supabase.from("routes").update(payload).eq("id", editingRoute.id)
          : await supabase.from("routes").insert(payload);

      if (error) throw error;

      closeForm();
      await load();
      toast.success(mode === "edit" ? "Route updated" : "Route added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  function closeForm() {
    setOpen(false);
    setEditingRoute(null);
    setFromCity("");
    setToCity("");
    setDistanceKm("0");
    setDurationHours("0");
    setActive(true);
    setRouteCategory("normal");
  }

  if (loading) return <LoadingBlock label="Loading routes…" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Routes</h1>
          <p className="text-sm text-muted-foreground">Normal and religious routes for admin fleet.</p>
        </div>

        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeForm())}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> New route
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? "Edit route" : "Add route"}</DialogTitle>
              <DialogDescription>Admin routes for taxi and shared taxi publishing.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input value={fromCity} onChange={(e) => setFromCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input value={toCity} onChange={(e) => setToCity(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Distance (km)</Label>
                  <Input type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={routeCategory}
                    onValueChange={(v) => setRouteCategory(v as "normal" | "religious")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="religious">Religious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button onClick={() => void save(editingRoute ? "edit" : "create")} disabled={submitting}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => {
          const minutes = route.duration_minutes ?? 0;
          const hours = minutes / 60;
          return (
            <Card key={route.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{route.from_city}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{route.to_city}</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {route.route_category ?? "normal"}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {route.distance_km} km · {hours}h
              </p>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRoute(route);
                    setFromCity(route.from_city);
                    setToCity(route.to_city);
                    setDistanceKm(String(route.distance_km ?? 0));

                    const minutes = route.duration_minutes ?? 0;
                    const hours = minutes / 60;
                    setDurationHours(String(hours));

                    setActive(route.active);
                    setRouteCategory(route.route_category === "religious" ? "religious" : "normal");
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!window.confirm("Delete route?")) return;
                    void supabase
                      .from("routes")
                      .delete()
                      .eq("id", route.id)
                      .then(() => load());
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

