import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

type VendorStatus = Database["public"]["Enums"]["vendor_approval_status"];

export function VendorApprovalGuard({ children }: { children: ReactNode }) {
  const { user, hasRole } = useAuth();
  const [status, setStatus] = useState<VendorStatus | "missing" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      if (!user?.id || hasRole("admin")) {
        setStatus("approved");
        return;
      }
      const { data } = await supabase
        .from("vendor_profiles")
        .select("approval_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setStatus(data?.approval_status ?? "missing");
    }
    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [hasRole, user?.id]);

  if (!status) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Checking vendor approval...
      </div>
    );
  }

  if (status === "approved") return <>{children}</>;

  const copy =
    status === "pending"
      ? "Your vendor account is under admin review."
      : status === "rejected"
        ? "Your vendor account was rejected. Contact support for review details."
        : status === "suspended"
          ? "Your vendor account is suspended. Contact support to restore access."
          : "Create a vendor profile before accessing the dashboard.";

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-lg p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Vendor access pending</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link to="/vendor/login">Vendor login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/vendor/signup">Become a Vendor</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
