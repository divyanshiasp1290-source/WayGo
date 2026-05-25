import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorAuthShell } from "@/components/vendor-auth-shell";
import { supabase } from "@/integrations/supabase/client";
import {
  completeVendorRegistrationDocuments,
  createVendorRegistration,
} from "@/lib/vendor-auth-actions";

export const Route = createFileRoute("/vendor_/signup")({
  head: () => ({
    meta: [
      { title: "Become a Vendor - WayGo" },
      { name: "description", content: "Register your transport business for WayGo vendor access." },
    ],
  }),
  component: VendorSignupPage,
});

const schema = z
  .object({
    businessName: z.string().trim().min(2, "Company name is required"),
    ownerName: z.string().trim().min(2, "Owner name is required"),
    businessEmail: z.string().trim().email("Enter a valid email"),
    mobileNumber: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    businessAddress: z.string().trim().min(8, "Business address is required"),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    gstNumber: z.string().trim().min(5, "GST number is required"),
    aadhaarNumber: z.string().trim().regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
    panNumber: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN number"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormState = z.infer<typeof schema>;

const initialForm: FormState = {
  businessName: "",
  ownerName: "",
  businessEmail: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  businessAddress: "",
  city: "",
  state: "",
  gstNumber: "",
  aadhaarNumber: "",
  panNumber: "",
};

function VendorSignupPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [files, setFiles] = useState({
    businessRegistration: null as File | null,
    aadhaar: null as File | null,
    pan: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordHints = useMemo(
    () => ({
      length: form.password.length >= 8,
      number: /\d/.test(form.password),
      letter: /[a-zA-Z]/.test(form.password),
    }),
    [form.password],
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function onFile(key: keyof typeof files) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setFiles((current) => ({ ...current, [key]: event.target.files?.[0] ?? null }));
    };
  }

  async function uploadSigned(path: string, token: string, file: File) {
    const { error } = await supabase.storage.from("vendor-documents").uploadToSignedUrl(path, token, file);
    if (error) throw error;
    return path;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ ...form, panNumber: form.panNumber.toUpperCase() });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (!files.businessRegistration || !files.aadhaar || !files.pan) {
      toast.error("All document uploads are required");
      return;
    }

    setLoading(true);
    try {
      const result = await createVendorRegistration({
        data: {
          ...parsed.data,
          files: {
            businessRegistration: {
              fileName: files.businessRegistration.name,
              contentType: files.businessRegistration.type || "application/octet-stream",
            },
            aadhaar: {
              fileName: files.aadhaar.name,
              contentType: files.aadhaar.type || "application/octet-stream",
            },
            pan: {
              fileName: files.pan.name,
              contentType: files.pan.type || "application/octet-stream",
            },
          },
        },
      });

      const paths = {
        businessRegistration: await uploadSigned(
          result.uploads.businessRegistration.path,
          result.uploads.businessRegistration.token,
          files.businessRegistration,
        ),
        aadhaar: await uploadSigned(result.uploads.aadhaar.path, result.uploads.aadhaar.token, files.aadhaar),
        pan: await uploadSigned(result.uploads.pan.path, result.uploads.pan.token, files.pan),
      };

      await completeVendorRegistrationDocuments({
        data: { vendorId: result.vendorId, userId: result.userId, paths },
      });

      setDone(true);
      setForm(initialForm);
      setFiles({ businessRegistration: null, aadhaar: null, pan: null });
      toast.success("Your vendor account is under admin review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vendor signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <VendorAuthShell
      title="Grow your fleet with WayGo"
      subtitle="Register your transport business for a dedicated vendor dashboard, fleet tools, and admin-reviewed marketplace access."
    >
      {done ? (
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold">Your vendor account is under admin review.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            We will verify your business documents before activating dashboard access.
          </p>
          <Button asChild className="mt-6 bg-gradient-primary shadow-glow">
            <Link to="/vendor/login">Go to vendor login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Vendor registration</h2>
            <p className="text-sm text-muted-foreground">Accounts stay pending until an admin approves them.</p>
          </div>

          <Section title="Business details">
            <Field label="Company/Business Name" value={form.businessName} error={errors.businessName} onChange={(v) => setField("businessName", v)} />
            <Field label="Owner Name" value={form.ownerName} error={errors.ownerName} onChange={(v) => setField("ownerName", v)} />
            <Field label="Business Email" type="email" value={form.businessEmail} error={errors.businessEmail} onChange={(v) => setField("businessEmail", v.toLowerCase())} />
            <Field label="Mobile Number" value={form.mobileNumber} error={errors.mobileNumber} onChange={(v) => setField("mobileNumber", v)} />
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordHints.length ? "8+ chars" : "Use 8+ chars"} · {passwordHints.letter ? "letter" : "add letter"} · {passwordHints.number ? "number" : "add number"}
              </p>
              {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
            </div>
            <Field label="Confirm Password" type={showPassword ? "text" : "password"} value={form.confirmPassword} error={errors.confirmPassword} onChange={(v) => setField("confirmPassword", v)} />
            <div className="space-y-2 md:col-span-2">
              <Label>Business Address</Label>
              <Textarea value={form.businessAddress} onChange={(event) => setField("businessAddress", event.target.value)} />
              {errors.businessAddress ? <p className="text-xs text-destructive">{errors.businessAddress}</p> : null}
            </div>
            <Field label="City" value={form.city} error={errors.city} onChange={(v) => setField("city", v)} />
            <Field label="State" value={form.state} error={errors.state} onChange={(v) => setField("state", v)} />
          </Section>

          <Section title="Documents">
            <Field label="GST Number" value={form.gstNumber} error={errors.gstNumber} onChange={(v) => setField("gstNumber", v.toUpperCase())} />
            <Field label="Aadhaar Number" value={form.aadhaarNumber} error={errors.aadhaarNumber} onChange={(v) => setField("aadhaarNumber", v)} />
            <Field label="PAN Number" value={form.panNumber} error={errors.panNumber} onChange={(v) => setField("panNumber", v.toUpperCase())} />
            <UploadField label="Business Registration Upload" file={files.businessRegistration} onChange={onFile("businessRegistration")} />
            <UploadField label="Aadhaar Upload" file={files.aadhaar} onChange={onFile("aadhaar")} />
            <UploadField label="PAN Upload" file={files.pan} onChange={onFile("pan")} />
          </Section>

          <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-primary shadow-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Submitting for review..." : "Submit for admin review"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/vendor/login" className="font-medium text-primary">
              Sign in as vendor
            </Link>
          </p>
        </form>
      )}
    </VendorAuthShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function UploadField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const preview = file?.type.startsWith("image/") ? URL.createObjectURL(file) : null;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm text-muted-foreground hover:bg-muted/40">
        {preview ? (
          <img src={preview} alt="" className="h-12 w-12 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            <FileUp className="h-5 w-5" />
          </div>
        )}
        <span className="min-w-0 flex-1 truncate">{file?.name || "Upload PDF or image"}</span>
        <Input className="hidden" type="file" accept="image/*,.pdf" onChange={onChange} />
      </label>
    </div>
  );
}
