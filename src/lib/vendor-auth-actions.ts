import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const vendorStatusSchema = z.enum(["pending", "approved", "rejected", "suspended"]);

const vendorSignupSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(120),
  businessEmail: z.string().trim().email().max(255),
  mobileNumber: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(8).max(128),
  businessAddress: z.string().trim().min(8).max(500),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  gstNumber: z.string().trim().min(5).max(30),
  aadhaarNumber: z.string().trim().regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
  panNumber: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN number"),
  files: z.object({
    businessRegistration: z.object({ fileName: z.string().min(1), contentType: z.string().min(1) }),
    aadhaar: z.object({ fileName: z.string().min(1), contentType: z.string().min(1) }),
    pan: z.object({ fileName: z.string().min(1), contentType: z.string().min(1) }),
  }),
});

const completeDocsSchema = z.object({
  vendorId: z.string().uuid(),
  userId: z.string().uuid(),
  paths: z.object({
    businessRegistration: z.string().min(1),
    aadhaar: z.string().min(1),
    pan: z.string().min(1),
  }),
});

const approvalSchema = z.object({
  accessToken: z.string().min(1),
  vendorId: z.string().uuid(),
  status: vendorStatusSchema,
  reason: z.string().trim().max(500).optional(),
});

const resolveLoginSchema = z.object({
  identifier: z.string().trim().min(3).max(255),
});

function extension(fileName: string) {
  return fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
}

async function signedUpload(vendorId: string, folder: string, fileName: string) {
  const path = `${vendorId}/${folder}/${crypto.randomUUID()}.${extension(fileName)}`;
  const { data, error } = await supabaseAdmin.storage
    .from("vendor-documents")
    .createSignedUploadUrl(path);
  if (error) throw error;
  return { path, token: data.token };
}

async function requireAdmin(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user?.id) throw new Error("Unauthorized");

  const { data: roles, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);
  if (roleError) throw roleError;
  if (!(roles ?? []).some((role) => role.role === "admin")) {
    throw new Error("Only admins can manage vendor approvals");
  }
  return data.user.id;
}

export const createVendorRegistration = createServerFn({ method: "POST" })
  .inputValidator(vendorSignupSchema)
  .handler(async ({ data }) => {
    const email = data.businessEmail.trim().toLowerCase();
    const panNumber = data.panNumber.trim().toUpperCase();

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        app_role: "vendor",
        full_name: data.ownerName,
        business_name: data.businessName,
      },
    });
    if (authError || !authUser.user) throw new Error(authError?.message ?? "Failed to create vendor account");

    const userId = authUser.user.id;
    try {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "vendor" }, { onConflict: "user_id,role" });
      if (roleError) throw roleError;

      const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
        {
          user_id: userId,
          email,
          full_name: data.ownerName,
          phone: data.mobileNumber,
        },
        { onConflict: "user_id" },
      );
      if (profileError) throw profileError;

      const { data: vendor, error: vendorError } = await supabaseAdmin
        .from("vendors")
        .insert({
          user_id: userId,
          business_name: data.businessName,
          contact_email: email,
          contact_phone: data.mobileNumber,
          address: data.businessAddress,
          owner_name: data.ownerName,
          city: data.city,
          state: data.state,
          gst_number: data.gstNumber,
          aadhaar_number: data.aadhaarNumber,
          pan_number: panNumber,
          approval_status: "pending",
          verified: false,
        })
        .select("id")
        .single();
      if (vendorError) throw vendorError;

      const { error: authRowError } = await supabaseAdmin.from("vendor_auth").insert({
        user_id: userId,
        email,
        mobile_number: data.mobileNumber,
        approval_status: "pending",
      });
      if (authRowError) throw authRowError;

      const { error: vendorProfileError } = await supabaseAdmin.from("vendor_profiles").insert({
        user_id: userId,
        vendor_id: vendor.id,
        business_name: data.businessName,
        owner_name: data.ownerName,
        business_email: email,
        mobile_number: data.mobileNumber,
        business_address: data.businessAddress,
        city: data.city,
        state: data.state,
        gst_number: data.gstNumber,
        aadhaar_number: data.aadhaarNumber,
        pan_number: panNumber,
        approval_status: "pending",
      });
      if (vendorProfileError) throw vendorProfileError;

      const uploads = {
        businessRegistration: await signedUpload(
          vendor.id,
          "business-registration",
          data.files.businessRegistration.fileName,
        ),
        aadhaar: await signedUpload(vendor.id, "aadhaar", data.files.aadhaar.fileName),
        pan: await signedUpload(vendor.id, "pan", data.files.pan.fileName),
      };

      return { ok: true, vendorId: vendor.id, userId, uploads };
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      throw error;
    }
  });

export const resolveVendorLoginEmail = createServerFn({ method: "POST" })
  .inputValidator(resolveLoginSchema)
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim().toLowerCase();
    if (identifier.includes("@")) return { email: identifier };

    const { data: row, error } = await supabaseAdmin
      .from("vendor_auth")
      .select("email")
      .eq("mobile_number", identifier)
      .maybeSingle();
    if (error) throw error;
    if (!row?.email) throw new Error("No vendor account found for this mobile number");
    return { email: row.email };
  });

export const completeVendorRegistrationDocuments = createServerFn({ method: "POST" })
  .inputValidator(completeDocsSchema)
  .handler(async ({ data }) => {
    const { error: vendorError } = await supabaseAdmin
      .from("vendors")
      .update({
        business_registration_url: data.paths.businessRegistration,
        aadhaar_upload_url: data.paths.aadhaar,
        pan_upload_url: data.paths.pan,
      })
      .eq("id", data.vendorId)
      .eq("user_id", data.userId);
    if (vendorError) throw vendorError;

    const { error: profileError } = await supabaseAdmin
      .from("vendor_profiles")
      .update({
        business_registration_url: data.paths.businessRegistration,
        aadhaar_upload_url: data.paths.aadhaar,
        pan_upload_url: data.paths.pan,
      })
      .eq("vendor_id", data.vendorId)
      .eq("user_id", data.userId);
    if (profileError) throw profileError;

    return { ok: true };
  });

export const setVendorApprovalStatus = createServerFn({ method: "POST" })
  .inputValidator(approvalSchema)
  .handler(async ({ data }) => {
    const adminUserId = await requireAdmin(data.accessToken);
    const verified = data.status === "approved";
    const reviewedAt = new Date().toISOString();

    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .update({ approval_status: data.status, verified })
      .eq("id", data.vendorId)
      .select("user_id")
      .single();
    if (vendorError) throw vendorError;

    const { error: profileError } = await supabaseAdmin
      .from("vendor_profiles")
      .update({
        approval_status: data.status,
        reviewed_by: adminUserId,
        reviewed_at: reviewedAt,
        rejection_reason: data.status === "rejected" ? data.reason || "Rejected by admin" : null,
      })
      .eq("vendor_id", data.vendorId);
    if (profileError) throw profileError;

    const { error: authError } = await supabaseAdmin
      .from("vendor_auth")
      .update({ approval_status: data.status })
      .eq("user_id", vendor.user_id);
    if (authError) throw authError;

    return { ok: true };
  });
