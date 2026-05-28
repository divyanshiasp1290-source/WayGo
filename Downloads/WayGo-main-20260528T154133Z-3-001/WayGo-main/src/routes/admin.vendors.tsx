import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Building2, Check, Eye, FileText, PauseCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock, shortId } from "@/lib/admin-live";
import { setVendorApprovalStatus } from "@/lib/vendor-auth-actions";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/vendors")({
  component: AdminVendors,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];
type Bus = Database["public"]["Tables"]["buses"]["Row"];
type Taxi = Database["public"]["Tables"]["taxis"]["Row"];
type VendorStatus = Database["public"]["Enums"]["vendor_approval_status"];

function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [profiles, setProfiles] = useState<VendorProfile[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVendors() {
    const [vendorsResult, profilesResult, busesResult, taxisResult] = await Promise.all([
      supabase.from("vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("vendor_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("buses").select("*"),
      supabase.from("taxis").select("*"),
    ]);
    if (vendorsResult.error) toast.error(vendorsResult.error.message);
    else setVendors(vendorsResult.data ?? []);
    if (profilesResult.error) toast.error(profilesResult.error.message);
    else setProfiles(profilesResult.data ?? []);
    if (!busesResult.error) setBuses(busesResult.data ?? []);
    if (!taxisResult.error) setTaxis(taxisResult.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadVendors();
  }, []);

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Please sign in again");
    return token;
  }

  async function setStatus(vendor: Vendor, status: VendorStatus) {
    try {
      const accessToken = await getAccessToken();
      const reason = status === "rejected" ? window.prompt("Reason for rejection?") || undefined : undefined;
      await setVendorApprovalStatus({ data: { accessToken, vendorId: vendor.id, status, reason } });
      toast.success(`Vendor marked ${status}`);
      await loadVendors();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update vendor");
    }
  }

  async function openDocument(path: string | null | undefined) {
    if (!path) return toast.error("Document not uploaded");
    const { data, error } = await supabase.storage.from("vendor-documents").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) return toast.error(error?.message || "Could not open document");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendors</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, suspend, and review fleet operator documents.</p>
      </div>
      {loading ? (
        <LoadingBlock label="Loading vendors..." />
      ) : vendors.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {vendors.map((vendor) => {
            const profile = profiles.find((item) => item.vendor_id === vendor.id);
            const fleet =
              buses.filter((bus) => bus.vendor_id === vendor.id).length +
              taxis.filter((taxi) => taxi.vendor_id === vendor.id).length;
            const status = profile?.approval_status ?? vendor.approval_status;
            return (
              <Card key={vendor.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{vendor.business_name}</h3>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {shortId(vendor.id, "V")} - {fleet} vehicles
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile?.owner_name || vendor.owner_name || "No owner"} · {vendor.contact_email || profile?.business_email || "No email"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[profile?.city || vendor.city, profile?.state || vendor.state].filter(Boolean).join(", ") || "No location"}
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <DocButton label="Business reg." onClick={() => void openDocument(profile?.business_registration_url || vendor.business_registration_url)} />
                      <DocButton label="Aadhaar" onClick={() => void openDocument(profile?.aadhaar_upload_url || vendor.aadhaar_upload_url)} />
                      <DocButton label="PAN" onClick={() => void openDocument(profile?.pan_upload_url || vendor.pan_upload_url)} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" className="gap-1.5 bg-success text-success-foreground hover:bg-success/90" onClick={() => void setStatus(vendor, "approved")}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void setStatus(vendor, "pending")}>
                        <PauseCircle className="h-4 w-4" /> Pending
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void setStatus(vendor, "rejected")}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => void setStatus(vendor, "suspended")}>
                        <Ban className="h-4 w-4" /> Suspend
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">No vendors yet.</Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VendorStatus }) {
  const variant = status === "approved" ? "default" : status === "rejected" || status === "suspended" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function DocButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="justify-start gap-1.5" onClick={onClick}>
      <FileText className="h-4 w-4" />
      <span className="truncate">{label}</span>
      <Eye className="ml-auto h-3.5 w-3.5" />
    </Button>
  );
}
