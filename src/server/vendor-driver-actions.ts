import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const driverStatusSchema = z.enum(["active", "suspended", "pending_verification"]);
const documentStatusSchema = z.enum(["verified", "rejected", "pending"]);

const driverBaseSchema = z.object({
  accessToken: z.string().min(1),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  mobileNumber: z.string().trim().min(7).max(30),
  profilePhotoUrl: z.string().trim().min(1).max(1000),
  licenseNumber: z.string().trim().min(3).max(80),
  licenseExpiryDate: z.string().trim().min(1).max(40),
  licenseUploadUrl: z.string().trim().min(1).max(1000),
  aadhaarNumber: z.string().trim().min(8).max(20),
  aadhaarUploadUrl: z.string().trim().min(1).max(1000),
  panNumber: z.string().trim().min(6).max(20),
  panUploadUrl: z.string().trim().min(1).max(1000),
  assignedVehicle: z.string().trim().min(1).max(120),
  vehicleNumber: z.string().trim().min(3).max(40),
  vehicleType: z.string().trim().min(2).max(40),
});

const createDriverSchema = driverBaseSchema.extend({
  password: z.string().min(8).max(128),
});

const updateDriverSchema = driverBaseSchema.partial().extend({
  accessToken: z.string().min(1),
  driverId: z.string().uuid(),
  status: driverStatusSchema.optional(),
});

const statusSchema = z.object({
  accessToken: z.string().min(1),
  driverId: z.string().uuid(),
  status: driverStatusSchema,
});

const deleteSchema = z.object({
  accessToken: z.string().min(1),
  driverId: z.string().uuid(),
});

const verifyDocumentSchema = z.object({
  accessToken: z.string().min(1),
  driverId: z.string().uuid(),
  document: z.enum(["license", "aadhaar", "pan"]),
  status: documentStatusSchema,
});

async function getUserIdFromToken(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user?.id) throw new Error("Unauthorized");
  return data.user.id;
}

async function getRoles(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((role) => role.role));
}

async function requireVendor(accessToken: string) {
  const userId = await getUserIdFromToken(accessToken);
  const roles = await getRoles(userId);
  if (!roles.has("vendor") && !roles.has("admin")) {
    throw new Error("Only vendors can manage driver accounts");
  }

  const { data: vendor, error } = await supabaseAdmin
    .from("vendors")
    .select("id,user_id,business_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!vendor && !roles.has("admin")) throw new Error("Vendor profile not found");

  return { roles, vendor };
}

async function requireDriverOwner(accessToken: string, driverId: string) {
  const auth = await requireVendor(accessToken);
  const { data: driver, error } = await supabaseAdmin
    .from("drivers")
    .select("id,user_id,vendor_id")
    .eq("id", driverId)
    .maybeSingle();
  if (error) throw error;
  if (!driver) throw new Error("Driver not found");

  const isAdmin = auth.roles.has("admin");
  const ownsDriver = Boolean(auth.vendor?.id && driver.vendor_id === auth.vendor.id);
  if (!isAdmin && !ownsDriver) throw new Error("You can only manage your own drivers");

  return { ...auth, driver };
}

function normalizeVehicleNumber(value: string | undefined) {
  return value?.trim().toUpperCase();
}

export const createVendorDriver = createServerFn({ method: "POST" })
  .inputValidator(createDriverSchema)
  .handler(async ({ data }) => {
    const auth = await requireVendor(data.accessToken);
    if (!auth.vendor?.id) throw new Error("Vendor profile not found");

    const email = data.email.trim().toLowerCase();
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        app_role: "driver",
        full_name: data.fullName,
        created_by_vendor_id: auth.vendor.id,
      },
    });
    if (authErr || !authUser.user) throw new Error(authErr?.message ?? "Failed to create auth user");

    const userId = authUser.user.id;
    try {
      const { error: profileErr } = await supabaseAdmin.from("profiles").upsert(
        {
          user_id: userId,
          email,
          full_name: data.fullName,
          phone: data.mobileNumber,
        },
        { onConflict: "user_id" },
      );
      if (profileErr) throw profileErr;

      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "driver" }, { onConflict: "user_id,role" });
      if (roleErr) throw roleErr;

      const { data: driver, error: driverErr } = await supabaseAdmin
        .from("drivers")
        .insert({
          user_id: userId,
          vendor_id: auth.vendor.id,
          full_name: data.fullName,
          email,
          phone: data.mobileNumber,
          profile_photo_url: data.profilePhotoUrl,
          license_number: data.licenseNumber,
          license_expiry_date: data.licenseExpiryDate,
          license_upload_url: data.licenseUploadUrl,
          // Vendor uploads start as pending; vendor verification flow should update to verified
          license_verification_status: "pending",
          aadhaar_number: data.aadhaarNumber,
          aadhaar_upload_url: data.aadhaarUploadUrl,
          aadhaar_verification_status: "pending",
          pan_number: data.panNumber.toUpperCase(),
          pan_upload_url: data.panUploadUrl,
          pan_verification_status: "pending",

          assigned_vehicle: data.assignedVehicle,
          vehicle_number: normalizeVehicleNumber(data.vehicleNumber),
          vehicle_type: data.vehicleType,
          // Driver becomes active only after vendor marks documents verified (driver status becomes active)
          status: "pending_verification",
          verified: false,

          is_online: false,
        })
        .select("id")
        .single();
      if (driverErr) throw driverErr;

      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "Driver account created",
        message: `Your WayGo driver account is ready. Sign in at /driver-login with ${email}.`,
        type: "driver_credentials",
      });

      return { ok: true, driverId: driver.id, userId, loginUrl: "/driver-login", email };
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
      throw error;
    }
  });

export const updateVendorDriver = createServerFn({ method: "POST" })
  .inputValidator(updateDriverSchema)
  .handler(async ({ data }) => {
    await requireDriverOwner(data.accessToken, data.driverId);
    const patch = Object.fromEntries(
      Object.entries({
        full_name: data.fullName,
        email: data.email?.trim().toLowerCase(),
        phone: data.mobileNumber,
        profile_photo_url: data.profilePhotoUrl,
        license_number: data.licenseNumber,
        license_expiry_date: data.licenseExpiryDate,
        license_upload_url: data.licenseUploadUrl,
        license_verification_status: data.licenseUploadUrl ? "verified" : undefined,
        aadhaar_number: data.aadhaarNumber,
        aadhaar_upload_url: data.aadhaarUploadUrl,
        aadhaar_verification_status: data.aadhaarUploadUrl ? "verified" : undefined,
        pan_number: data.panNumber?.toUpperCase(),
        pan_upload_url: data.panUploadUrl,
        pan_verification_status: data.panUploadUrl ? "verified" : undefined,
        assigned_vehicle: data.assignedVehicle,
        vehicle_number: normalizeVehicleNumber(data.vehicleNumber),
        vehicle_type: data.vehicleType,
        status: data.status,
        verified:
          data.status === "active" ? true : data.status === "pending_verification" ? false : undefined,
      }).filter(([, value]) => value !== undefined),
    );

    const { error } = await supabaseAdmin.from("drivers").update(patch).eq("id", data.driverId);
    if (error) throw error;
    return { ok: true };
  });

export const setVendorDriverStatus = createServerFn({ method: "POST" })
  .inputValidator(statusSchema)
  .handler(async ({ data }) => {
    await requireDriverOwner(data.accessToken, data.driverId);
    const patch: {
      status: z.infer<typeof driverStatusSchema>;
      verified: boolean;
      is_online?: boolean;
      suspended_at?: string | null;
    } = {
      status: data.status,
      verified: data.status === "active",
      suspended_at: data.status === "suspended" ? new Date().toISOString() : null,
    };
    if (data.status === "suspended") patch.is_online = false;

    const { error } = await supabaseAdmin.from("drivers").update(patch).eq("id", data.driverId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteVendorDriver = createServerFn({ method: "POST" })
  .inputValidator(deleteSchema)
  .handler(async ({ data }) => {
    const { driver } = await requireDriverOwner(data.accessToken, data.driverId);
    const { error } = await supabaseAdmin.from("drivers").delete().eq("id", data.driverId);
    if (error) throw error;
    await supabaseAdmin.auth.admin.deleteUser(driver.user_id).catch(() => undefined);
    return { ok: true };
  });

export const verifyDriverDocument = createServerFn({ method: "POST" })
  .inputValidator(verifyDocumentSchema)
  .handler(async ({ data }) => {
    // Vendor (not admin) verifies documents. Status should become 'verified' or 'rejected'.
    const { roles, vendor } = await requireDriverOwner(data.accessToken, data.driverId);
    if (!roles.has("vendor") || !vendor?.id) {
      throw new Error("Only vendors can verify driver documents");
    }

    const column = `${data.document}_verification_status`;
    await (supabaseAdmin.from("drivers") as any)
      .update({ [column]: data.status })
      .eq("id", data.driverId);

    const { error } = await supabaseAdmin
      .from("drivers")
      .select("id")
      .eq("id", data.driverId);

    if (error) throw error;

    // When all three documents are verified by the vendor, activate the driver.
    const { data: refreshed } = await supabaseAdmin
      .from("drivers")
      .select("id, license_verification_status, aadhaar_verification_status, pan_verification_status")
      .eq("id", data.driverId)
      .maybeSingle();

    if (refreshed) {
      const allVerified =
        refreshed.license_verification_status === "verified" &&
        refreshed.aadhaar_verification_status === "verified" &&
        refreshed.pan_verification_status === "verified";

      if (allVerified) {
        await supabaseAdmin.from("drivers").update({
          status: "active",
          verified: true,
          suspended_at: null,
        }).eq("id", data.driverId);
      } else {
        // Keep driver in pending state until all docs are verified
        await supabaseAdmin.from("drivers").update({
          status: "pending_verification",
          verified: false,
        }).eq("id", data.driverId);
      }
    }

    return { ok: true };
  });

