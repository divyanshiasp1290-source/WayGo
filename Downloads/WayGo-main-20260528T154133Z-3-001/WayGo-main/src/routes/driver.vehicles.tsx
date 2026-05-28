import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/driver/vehicles")({
  component: VehiclesPage,
});

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

function VehiclesPage() {
  const { user, loading: authLoading } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDriver(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDriver() {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setDriver(null);
      } else {
        setDriver(data);
      }
      setLoading(false);
    }

    setLoading(true);
    void loadDriver();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
        Loading assigned vehicle…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My vehicles</h1>
          <p className="text-sm text-muted-foreground">Assigned vehicle details for your driver account.</p>
        </div>
      </div>
      {driver?.assigned_vehicle ? (
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Car className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{driver.assigned_vehicle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {driver.vehicle_number || "No vehicle number"}
                {driver.vehicle_type ? ` · ${driver.vehicle_type}` : ""}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-sm text-muted-foreground">
          No assigned vehicle found for your account.
        </Card>
      )}
    </div>
  );
}
