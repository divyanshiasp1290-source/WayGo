import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { EmptyRows, shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/drivers")({
  component: AdminDrivers,
});


type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type DriverStatus = Database["public"]["Enums"]["driver_account_status"];
type DocumentStatus = Database["public"]["Enums"]["driver_document_status"];

function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setDrivers((data ?? []) as Driver[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadDrivers();
  }, []);

  const stats = {
    total: drivers.length,
    active: drivers.filter((driver) => driver.status === "active").length,
    suspended: drivers.filter((driver) => driver.status === "suspended").length,
    online: drivers.filter((driver) => driver.is_online).length,
  };

  async function openDocument(path: string | null) {
    if (!path) return toast.error("Document not uploaded");
    const { data, error } = await supabase.storage.from("driver-documents").createSignedUrl(path, 60 * 5);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Drivers</h1>
        <p className="text-sm text-muted-foreground">View driver accounts and vendor-uploaded documents.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Active drivers" value={stats.active} />
        <Stat label="Total drivers" value={stats.total} />
        <Stat label="Online now" value={stats.online} />
        <Stat label="Suspended" value={stats.suspended} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b p-5">
          <h2 className="text-base font-semibold">All drivers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Documents</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <EmptyRows colSpan={5} message="Loading drivers..." />
              ) : drivers.length ? (
                drivers.map((driver) => (
                  <Fragment key={driver.id}>
                    <tr>
                      <td className="px-5 py-3 font-mono text-xs">{shortId(driver.id, "D")}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{driver.full_name || "Unnamed driver"}</p>
                        <p className="text-xs text-muted-foreground">{driver.email || driver.phone || "No contact"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p>{driver.vehicle_number || "-"}</p>
                        <p className="text-xs text-muted-foreground">{driver.vehicle_type || "-"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <DocBadge label="DL" status={driver.license_verification_status} />
                          <DocBadge label="Aadhaar" status={driver.aadhaar_verification_status} />
                          <DocBadge label="PAN" status={driver.pan_verification_status} />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={driver.status} />
                      </td>
                    </tr>
                    <tr className="bg-muted/10">
                      <td colSpan={5} className="px-5 py-3">
                        <DocumentControls driver={driver} onOpenDocument={openDocument} />
                      </td>
                    </tr>
                  </Fragment>
                ))
              ) : (
                <EmptyRows colSpan={5} message="No drivers yet." />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function DocumentControls({
  driver,
  onOpenDocument,
}: {
  driver: Driver;
  onOpenDocument: (path: string | null) => void;
}) {
  const documents = [
    { key: "license", label: "license", path: driver.license_upload_url, status: driver.license_verification_status },
    { key: "aadhaar", label: "aadhaar", path: driver.aadhaar_upload_url, status: driver.aadhaar_verification_status },
    { key: "pan", label: "pan", path: driver.pan_upload_url, status: driver.pan_verification_status },
  ] as const;

  return (
    <div className="lg:col-span-2 grid gap-2 md:grid-cols-3">
      {documents.map((document) => (
        <div key={document.key} className="rounded-md border bg-background p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium capitalize">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {document.label}
            <DocBadge label="" status={document.status} />
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onOpenDocument(document.path)}>
              <ExternalLink className="h-4 w-4" /> Open
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const variant = status === "active" ? "default" : status === "suspended" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}

function DocBadge({ label, status }: { label: string; status: DocumentStatus }) {
  const baseVariant = status === "verified" ? "default" : status === "rejected" ? "destructive" : "secondary";
  const extraClass = status === "verified" ? "bg-success text-success-foreground hover:bg-success/90 border-transparent" : "";
  return (
    <Badge variant={baseVariant} className={`${extraClass} capitalize`}>
      {label ? `${label}: ` : ""}
      {status}
    </Badge>
  );
}
