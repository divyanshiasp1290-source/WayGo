import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/vendor/routes")({
  component: RoutesPage,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

type RouteUiRow = {
  id: string;
  from_city: string;
  to_city: string;
  distance_km: number | null;
  duration_minutes: number | null;
  active: boolean;
};

function RoutesPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [routes, setRoutes] = useState<RouteUiRow[]>([]);
  const [loading, setLoading] = useState(true);

  // add route dialog
  const [open, setOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteUiRow | null>(null);

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [distanceKm, setDistanceKm] = useState("0");

  // UI value in hours; DB column is duration_minutes
  const [durationHours, setDurationHours] = useState("0");

  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        setRoutes([]);
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
        setRoutes([]);
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
    if (!vendor?.id) return;

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        toast.error(error.message);
        setRoutes([]);
      } else {
        setRoutes((data ?? []) as RouteUiRow[]);
      }
      setLoading(false);
    }

    void load();

    const channel = supabase
      .channel(`vendor-routes:${vendor.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "routes" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [vendor?.id]);

  async function addRoute() {
    await saveRoute("create");
  }

  async function updateRoute() {
    await saveRoute("edit");
  }

  async function saveRoute(mode: "create" | "edit") {
    if (!vendor?.id) return;

    const from = fromCity.trim();
    const to = toCity.trim();
    if (!from) return toast.error("From city is required");
    if (!to) return toast.error("To city is required");

    const distanceNum = Number(distanceKm);
    if (!Number.isFinite(distanceNum) || distanceNum < 0)
      return toast.error("Enter valid distance");

    const durationNum = Number(durationHours);
    if (!Number.isFinite(durationNum) || durationNum <= 0)
      return toast.error("Enter valid duration hours");

    const durationMinutes = Math.round(durationNum * 60);

    setSubmitting(true);
    try {
      // `as any` to bypass generated supabase types issues (owner_type/route_category differences)
      const payload = {
        vendor_id: vendor.id,
        owner_type: "vendor" as const,
        from_city: from,
        to_city: to,
        distance_km: distanceNum,
        duration_minutes: durationMinutes,
        active,
        // base_price + route_category removed from vendor UI/payload
      } as any;

      const { error } =
        mode === "edit" && editingRoute
          ? await supabase
              .from("routes")
              .update(payload)
              .eq("id", editingRoute.id)
              .eq("vendor_id", vendor.id)
          : await supabase.from("routes").insert(payload);

      if (error) throw error;

      closeForm();
      toast.success(mode === "edit" ? "Route updated" : "Route added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save route");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(route: RouteUiRow) {
    setEditingRoute(route);
    setFromCity(route.from_city);
    setToCity(route.to_city);
    setDistanceKm(String(route.distance_km ?? 0));

    const minutes = route.duration_minutes ?? 0;
    setDurationHours(String(minutes / 60));

    setActive(route.active);
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    setEditingRoute(null);
    setFromCity("");
    setToCity("");
    setDistanceKm("0");
    setDurationHours("0");
    setActive(true);
  }

  async function deleteRoute(route: RouteUiRow) {
    if (!vendor?.id) return;
    if (!window.confirm(`Delete route ${route.from_city} to ${route.to_city}?`)) return;

    try {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", route.id)
        .eq("vendor_id", vendor.id);

      if (error) throw error;
      toast.success("Route deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete route");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Routes</h1>
          <p className="text-sm text-muted-foreground">Operating routes across your fleet.</p>
        </div>
        <LoadingBlock label="Loading routes…" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Routes</h1>
          <p className="text-sm text-muted-foreground">Operating routes across your fleet.</p>
        </div>

        <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : closeForm())}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> New route
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? "Edit route" : "Add route"}</DialogTitle>
              <DialogDescription>Insert route details for your fleet.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-city">From city</Label>
                  <Input
                    id="from-city"
                    placeholder="Enter departure city"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-city">To city</Label>
                  <Input
                    id="to-city"
                    placeholder="Enter destination city"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="0"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Active</Label>
                <Button
                  type="button"
                  variant={active ? "default" : "outline"}
                  onClick={() => setActive((value) => !value)}
                >
                  {active ? "Yes" : "No"}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button onClick={() => void (editingRoute ? updateRoute() : addRoute())} disabled={submitting}>
                {submitting ? "Saving..." : editingRoute ? "Save route" : "Add route"}
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{route.from_city}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{route.to_city}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {route.distance_km} km • {hours}h
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={route.active ? "default" : "secondary"}>
                    {route.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(route)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => void deleteRoute(route)}>
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

