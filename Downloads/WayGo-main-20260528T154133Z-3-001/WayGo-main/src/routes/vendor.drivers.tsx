import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Ban,
  Check,
  ExternalLink,
  Eye,
  FileUp,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
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
import { LoadingBlock, shortId } from "@/lib/admin-live";
import {
  createVendorDriver,
  deleteVendorDriver,
  setVendorDriverStatus,
  updateVendorDriver,
} from "@/lib/vendor-driver-actions";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/vendor/drivers")({
  component: VendorDriversPage,
});

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type Taxi = Database["public"]["Tables"]["taxis"]["Row"];
type Bus = Database["public"]["Tables"]["buses"]["Row"];
type DriverStatus = Database["public"]["Enums"]["driver_account_status"];

type DriverForm = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  profilePhoto: File | null;
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseUpload: File | null;
  aadhaarNumber: string;
  aadhaarUpload: File | null;
  panNumber: string;
  panUpload: File | null;
  assignedVehicle: string;
  vehicleNumber: string;
  vehicleType: string;
};

const emptyForm: DriverForm = {
  fullName: "",
  email: "",
  mobileNumber: "",
  password: "",
  profilePhoto: null,
  licenseNumber: "",
  licenseExpiryDate: "",
  licenseUpload: null,
  aadhaarNumber: "",
  aadhaarUpload: null,
  panNumber: "",
  panUpload: null,
  assignedVehicle: "",
  vehicleNumber: "",
  vehicleType: "",
};

function VendorDriversPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailsDriver, setDetailsDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [credential, setCredential] = useState<{ email: string; loginUrl: string } | null>(null);

  const vehicles = useMemo(
    () => [
      ...taxis.map((taxi) => ({
        id: taxi.id,
        label: `${taxi.model} - ${taxi.plate_number}`,
        number: taxi.plate_number,
        type: taxi.taxi_type || "taxi",
      })),
      ...buses.map((bus) => ({
        id: bus.id,
        label: `${bus.model} - ${bus.plate_number}`,
        number: bus.plate_number,
        type: bus.bus_type || "bus",
      })),
    ],
    [buses, taxis],
  );

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Please sign in again");
    return token;
  }

  async function loadVendorAndDrivers() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVendor(null);
      setDrivers([]);
      setLoading(false);
      return;
    }

    const { data: vendorRow, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (vendorError) {
      toast.error(vendorError.message);
      setLoading(false);
      return;
    }

    setVendor(vendorRow);
    if (!vendorRow?.id) {
      setLoading(false);
      return;
    }

    const [driverRes, taxiRes, busRes] = await Promise.all([
      supabase.from("drivers").select("*").eq("vendor_id", vendorRow.id).order("created_at", { ascending: false }),
      supabase.from("taxis").select("*").eq("vendor_id", vendorRow.id).order("created_at", { ascending: false }),
      supabase.from("buses").select("*").eq("vendor_id", vendorRow.id).order("created_at", { ascending: false }),
    ]);

    if (driverRes.error) toast.error(driverRes.error.message);
    if (taxiRes.error) toast.error(taxiRes.error.message);
    if (busRes.error) toast.error(busRes.error.message);

    setDrivers((driverRes.data ?? []) as Driver[]);
    setTaxis((taxiRes.data ?? []) as Taxi[]);
    setBuses((busRes.data ?? []) as Bus[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadVendorAndDrivers();
  }, []);

  useEffect(() => {
    if (!vendor?.id) return;
    const channel = supabase
      .channel(`vendor-drivers:${vendor.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
        void loadVendorAndDrivers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id]);

  function updateField<K extends keyof DriverForm>(key: K, value: DriverForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onFile(key: keyof DriverForm) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(key, (event.target.files?.[0] ?? null) as DriverForm[typeof key]);
    };
  }

  function selectVehicle(vehicleId: string) {
    const selected = vehicles.find((vehicle) => vehicle.id === vehicleId);
    if (!selected) return;
    setForm((current) => ({
      ...current,
      assignedVehicle: selected.label,
      vehicleNumber: selected.number,
      vehicleType: selected.type,
    }));
  }

  async function uploadRequiredFile(file: File | null, folder: string, label: string) {
    if (!file) throw new Error(`${label} is required`);
    if (!vendor?.id) throw new Error("Vendor profile not found");
    const extension = file.name.split(".").pop() || "bin";
    const path = `${vendor.id}/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("driver-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return path;
  }

  async function uploadOptionalFile(file: File | null, folder: string) {
    if (!file) return undefined;
    if (!vendor?.id) throw new Error("Vendor profile not found");
    const extension = file.name.split(".").pop() || "bin";
    const path = `${vendor.id}/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("driver-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return path;
  }

  function validateForm(isEdit = false) {
    const required: Array<[keyof DriverForm, string]> = [
      ["fullName", "Driver full name"],
      ["email", "Email address"],
      ["mobileNumber", "Mobile number"],
      ["licenseNumber", "Driving licence number"],
      ["licenseExpiryDate", "Driving licence expiry date"],
      ["aadhaarNumber", "Aadhaar number"],
      ["panNumber", "PAN card number"],
      ["assignedVehicle", "Assigned vehicle"],
      ["vehicleNumber", "Vehicle number"],
      ["vehicleType", "Vehicle type"],
    ];
    for (const [key, label] of required) {
      if (!String(form[key] ?? "").trim()) throw new Error(`${label} is required`);
    }
    if (!isEdit && form.password.length < 8) throw new Error("Password must be at least 8 characters");
    if (!isEdit && (!form.profilePhoto || !form.licenseUpload || !form.aadhaarUpload || !form.panUpload)) {
      throw new Error("Profile photo and all document uploads are required");
    }
  }

  async function createDriver() {
    try {
      validateForm(false);
      setSubmitting(true);
      const accessToken = await getAccessToken();
      const [profilePhotoUrl, licenseUploadUrl, aadhaarUploadUrl, panUploadUrl] = await Promise.all([
        uploadRequiredFile(form.profilePhoto, "profile-photos", "Profile photo"),
        uploadRequiredFile(form.licenseUpload, "licenses", "Driving licence upload"),
        uploadRequiredFile(form.aadhaarUpload, "aadhaar", "Aadhaar upload"),
        uploadRequiredFile(form.panUpload, "pan", "PAN card upload"),
      ]);

      const result = await createVendorDriver({
        data: {
          accessToken,
          fullName: form.fullName,
          email: form.email.toLowerCase(),
          mobileNumber: form.mobileNumber,
          password: form.password,
          profilePhotoUrl,
          licenseNumber: form.licenseNumber,
          licenseExpiryDate: form.licenseExpiryDate,
          licenseUploadUrl,
          aadhaarNumber: form.aadhaarNumber,
          aadhaarUploadUrl,
          panNumber: form.panNumber,
          panUploadUrl,
          assignedVehicle: form.assignedVehicle,
          vehicleNumber: form.vehicleNumber,
          vehicleType: form.vehicleType,
        },
      });

      setCredential({ email: result.email, loginUrl: result.loginUrl });
      toast.success("Driver account created");
      setOpen(false);
      setForm(emptyForm);
      await loadVendorAndDrivers();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to create driver"));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!editingDriver) return;
    try {
      validateForm(true);
      setSubmitting(true);
      const accessToken = await getAccessToken();
      const [profilePhotoUrl, licenseUploadUrl, aadhaarUploadUrl, panUploadUrl] = await Promise.all([
        uploadOptionalFile(form.profilePhoto, "profile-photos"),
        uploadOptionalFile(form.licenseUpload, "licenses"),
        uploadOptionalFile(form.aadhaarUpload, "aadhaar"),
        uploadOptionalFile(form.panUpload, "pan"),
      ]);
      await updateVendorDriver({
        data: {
          accessToken,
          driverId: editingDriver.id,
          fullName: form.fullName,
          email: form.email.toLowerCase(),
          mobileNumber: form.mobileNumber,
          profilePhotoUrl,
          licenseNumber: form.licenseNumber,
          licenseExpiryDate: form.licenseExpiryDate,
          licenseUploadUrl,
          aadhaarNumber: form.aadhaarNumber,
          aadhaarUploadUrl,
          panNumber: form.panNumber,
          panUploadUrl,
          assignedVehicle: form.assignedVehicle,
          vehicleNumber: form.vehicleNumber,
          vehicleType: form.vehicleType,
        },
      });
      toast.success("Driver updated");
      setEditingDriver(null);
      setForm(emptyForm);
      await loadVendorAndDrivers();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update driver"));
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(driver: Driver, status: DriverStatus) {
    try {
      const accessToken = await getAccessToken();
      await setVendorDriverStatus({ data: { accessToken, driverId: driver.id, status } });
      toast.success(`Driver marked ${formatStatus(status)}`);
      await loadVendorAndDrivers();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update status"));
    }
  }

  async function removeDriver(driver: Driver) {
    if (!window.confirm(`Delete ${driver.full_name || driver.email || driver.license_number}?`)) return;
    try {
      const accessToken = await getAccessToken();
      await deleteVendorDriver({ data: { accessToken, driverId: driver.id } });
      toast.success("Driver deleted");
      await loadVendorAndDrivers();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete driver"));
    }
  }

  async function openDocument(path: string | null) {
    if (!path) return toast.error("Document not uploaded");
    const { data, error } = await supabase.storage.from("driver-documents").createSignedUrl(path, 60 * 5);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function openEdit(driver: Driver) {
    setEditingDriver(driver);
    setForm({
      ...emptyForm,
      fullName: driver.full_name || "",
      email: driver.email || "",
      mobileNumber: driver.phone || "",
      licenseNumber: driver.license_number,
      licenseExpiryDate: driver.license_expiry_date || "",
      aadhaarNumber: driver.aadhaar_number || "",
      panNumber: driver.pan_number || "",
      assignedVehicle: driver.assigned_vehicle || "",
      vehicleNumber: driver.vehicle_number || "",
      vehicleType: driver.vehicle_type || "",
    });
  }

  const stats = {
    total: drivers.length,
    active: drivers.filter((driver) => driver.status === "active").length,
    online: drivers.filter((driver) => driver.is_online).length,
    suspended: drivers.filter((driver) => driver.status === "suspended").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading />
        <LoadingBlock label="Loading drivers..." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeading />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Driver</DialogTitle>
              <DialogDescription>
                Create a private driver account. Drivers cannot register publicly.
              </DialogDescription>
            </DialogHeader>
            <DriverFormFields
              form={form}
              vehicles={vehicles}
              onField={updateField}
              onFile={onFile}
              onVehicle={selectVehicle}
              mode="create"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={() => void createDriver()} disabled={submitting} className="gap-1.5 bg-gradient-primary shadow-glow">
                <Check className="h-4 w-4" /> {submitting ? "Creating..." : "Create driver"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {credential ? (
        <Card className="flex flex-col gap-3 border-primary/30 bg-primary/5 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Driver credentials are ready</p>
            <p className="text-xs text-muted-foreground">
              Email: {credential.email} · Login URL: {credential.loginUrl}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCredential(null)}>
            Dismiss
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Online" value={stats.online} />
        <Stat label="Suspended" value={stats.suspended} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b p-5">
          <h2 className="text-base font-semibold">Driver management</h2>
          <p className="text-sm text-muted-foreground">Only drivers attached to your vendor account appear here.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Documents</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drivers.length ? (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{driver.full_name || "Unnamed driver"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{shortId(driver.id, "D")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p>{driver.email || "No email"}</p>
                      <p className="text-xs">{driver.phone || "No mobile"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{driver.assigned_vehicle || "Unassigned"}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver.vehicle_number || "-"} · {driver.vehicle_type || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-3">
                        <DocumentButton label="Driving licence" onClick={() => void openDocument(driver.license_upload_url)} />
                        <DocumentButton label="Aadhaar" onClick={() => void openDocument(driver.aadhaar_upload_url)} />
                        <DocumentButton label="PAN" onClick={() => void openDocument(driver.pan_upload_url)} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <StatusBadge status={driver.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDetailsDriver(driver)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(driver)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {driver.status === "active" ? (
                          <Button variant="outline" size="sm" onClick={() => void setStatus(driver, "suspended")}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => void setStatus(driver, "active")}>
                            <BadgeCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => void removeDriver(driver)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No drivers yet. Add your first driver to start assigning fleet work.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={Boolean(editingDriver)} onOpenChange={(value) => !value && setEditingDriver(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit driver</DialogTitle>
            <DialogDescription>Update driver profile, licence, and assigned vehicle details.</DialogDescription>
          </DialogHeader>
          <DriverFormFields
            form={form}
            vehicles={vehicles}
            onField={updateField}
            onFile={onFile}
            onVehicle={selectVehicle}
            mode="edit"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDriver(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={() => void saveEdit()} disabled={submitting} className="gap-1.5 bg-gradient-primary shadow-glow">
              <Check className="h-4 w-4" /> {submitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DriverDetails driver={detailsDriver} onClose={() => setDetailsDriver(null)} onOpenDocument={openDocument} />
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error) {
    const maybeMessage = "message" in error ? error.message : undefined;
    const maybeError = "error" in error ? error.error : undefined;
    if (typeof maybeMessage === "string" && maybeMessage) return maybeMessage;
    if (typeof maybeError === "string" && maybeError) return maybeError;
  }
  if (typeof error === "string" && error) return error;
  return fallback;
}

function PageHeading() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Add Driver</h1>
      <p className="text-sm text-muted-foreground">Create, verify, suspend, edit, and remove private driver accounts.</p>
    </div>
  );
}

function DriverFormFields({
  form,
  vehicles,
  onField,
  onFile,
  onVehicle,
  mode,
}: {
  form: DriverForm;
  vehicles: Array<{ id: string; label: string; number: string; type: string }>;
  onField: <K extends keyof DriverForm>(key: K, value: DriverForm[K]) => void;
  onFile: (key: keyof DriverForm) => (event: ChangeEvent<HTMLInputElement>) => void;
  onVehicle: (vehicleId: string) => void;
  mode: "create" | "edit";
}) {
  return (
    <div className="grid gap-6">
      <FormSection title="Personal details">
        <Field label="Driver full name" value={form.fullName} onChange={(value) => onField("fullName", value)} />
        <Field label="Email address" type="email" value={form.email} onChange={(value) => onField("email", value)} />
        <Field label="Mobile number" value={form.mobileNumber} onChange={(value) => onField("mobileNumber", value)} />
        {mode === "create" ? (
          <Field label="Password" type="password" value={form.password} onChange={(value) => onField("password", value)} />
        ) : null}
        <FileField
          label={mode === "create" ? "Profile photo" : "Replace profile photo"}
          file={form.profilePhoto}
          onChange={onFile("profilePhoto")}
        />
      </FormSection>

      <FormSection title="Driving details">
        <Field label="Driving licence number" value={form.licenseNumber} onChange={(value) => onField("licenseNumber", value)} />
        <Field label="Driving licence expiry date" type="date" value={form.licenseExpiryDate} onChange={(value) => onField("licenseExpiryDate", value)} />
        <FileField
          label={mode === "create" ? "Driving licence upload" : "Replace driving licence upload"}
          file={form.licenseUpload}
          onChange={onFile("licenseUpload")}
        />
        <Field label="Aadhaar number" value={form.aadhaarNumber} onChange={(value) => onField("aadhaarNumber", value)} />
        <FileField
          label={mode === "create" ? "Aadhaar upload" : "Replace Aadhaar upload"}
          file={form.aadhaarUpload}
          onChange={onFile("aadhaarUpload")}
        />
        <Field label="PAN card number" value={form.panNumber} onChange={(value) => onField("panNumber", value)} />
        <FileField
          label={mode === "create" ? "PAN card upload" : "Replace PAN card upload"}
          file={form.panUpload}
          onChange={onFile("panUpload")}
        />
      </FormSection>

      <FormSection title="Vehicle details">
        <div className="space-y-2 md:col-span-2">
          <Label>Assigned vehicle</Label>
          <Select onValueChange={onVehicle}>
            <SelectTrigger>
              <SelectValue placeholder={form.assignedVehicle || "Select a fleet vehicle"} />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Field label="Vehicle number" value={form.vehicleNumber} onChange={(value) => onField("vehicleNumber", value)} />
        <Field label="Vehicle type" value={form.vehicleType} onChange={(value) => onField("vehicleType", value)} />
      </FormSection>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="flex h-10 cursor-pointer items-center justify-between rounded-md border px-3 text-sm text-muted-foreground hover:bg-muted/40">
        <span className="flex min-w-0 items-center gap-2">
          <FileUp className="h-4 w-4 shrink-0" />
          <span className="truncate">{file?.name || "Upload file"}</span>
        </span>
        <Input className="hidden" type="file" accept="image/*,.pdf" onChange={onChange} />
      </label>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function formatStatus(status: DriverStatus) {
  return status.replace("_", " ");
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const variant = status === "active" ? "default" : status === "suspended" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {formatStatus(status)}
    </Badge>
  );
}

function DocBadge({ label, status }: { label: string; status: "verified" | "rejected" | "pending" }) {
  const baseVariant = status === "verified" ? "default" : status === "rejected" ? "destructive" : "secondary";
  const extraClass = status === "verified" ? "bg-success text-success-foreground hover:bg-success/90 border-transparent" : "";
  return (
    <Badge variant={baseVariant} className={`${extraClass} capitalize`}>
      {label}: {status}
    </Badge>
  );
}

function DriverDetails({
  driver,
  onClose,
  onOpenDocument,
}: {
  driver: Driver | null;
  onClose: () => void;
  onOpenDocument: (path: string | null) => void;
}) {
  return (
    <Dialog open={Boolean(driver)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{driver?.full_name || "Driver details"}</DialogTitle>
          <DialogDescription>Driver account, vehicle assignment, and verification state.</DialogDescription>
        </DialogHeader>
        {driver ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Detail icon={Mail} label="Email" value={driver.email || "-"} />
            <Detail icon={UserRound} label="Mobile" value={driver.phone || "-"} />
            <Detail label="Licence" value={`${driver.license_number} · expires ${driver.license_expiry_date || "-"}`} />
            <Detail label="Aadhaar" value={driver.aadhaar_number || "-"} />
            <Detail label="PAN" value={driver.pan_number || "-"} />
            <Detail label="Vehicle" value={`${driver.assigned_vehicle || "-"} · ${driver.vehicle_number || "-"}`} />
            <Detail label="Vehicle type" value={driver.vehicle_type || "-"} />
            <Detail label="Rating" value={Number(driver.rating).toFixed(2)} />
            <div className="md:col-span-2">
              <p className="mb-2 text-xs text-muted-foreground">Documents</p>
              <div className="grid gap-2 md:grid-cols-3">
                <DocumentButton label="Driving licence" onClick={() => onOpenDocument(driver.license_upload_url)} />
                <DocumentButton label="Aadhaar" onClick={() => onOpenDocument(driver.aadhaar_upload_url)} />
                <DocumentButton label="PAN" onClick={() => onOpenDocument(driver.pan_upload_url)} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function DocumentButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-muted/20 bg-background p-4 shadow-sm">
      <div>
        <p className="truncate text-sm font-medium">{label}</p>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onClick}>
          <ExternalLink className="h-4 w-4" /> Open
        </Button>
      </div>
    </div>
  );
}
