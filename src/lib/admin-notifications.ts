import { supabase } from "@/integrations/supabase/client";

export type AdminNotifySection = "vendors" | "users" | "drivers" | "bookings" | "refunds";

const SECTION_TO_PATH: Record<AdminNotifySection, string> = {
  vendors: "/admin/vendors",
  users: "/admin/users",
  drivers: "/admin/drivers",
  bookings: "/admin/bookings",
  refunds: "/admin/refunds",
};

export async function fetchAdminBadgeCounts(): Promise<Record<AdminNotifySection, number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { vendors: 0, users: 0, drivers: 0, bookings: 0, refunds: 0 };
  }

  const { data: seenRows } = await supabase
    .from("admin_section_seen")
    .select("section, last_seen_at")
    .eq("admin_user_id", user.id);

  const seenAt = new Map((seenRows ?? []).map((r) => [r.section, r.last_seen_at]));

  const since = (section: AdminNotifySection) => seenAt.get(section) ?? "1970-01-01T00:00:00Z";

  const [vendorsRes, profilesRes, driversRes, bookingsRes, refundsRes] = await Promise.all([
    supabase
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .or(`created_at.gt.${since("vendors")},approval_status.eq.pending`),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("created_at", since("users")),
    supabase
      .from("drivers")
      .select("id", { count: "exact", head: true })
      .gt("created_at", since("drivers")),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gt("created_at", since("bookings")),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gt("updated_at", since("refunds")),
  ]);

  return {
    vendors: vendorsRes.count ?? 0,
    users: profilesRes.count ?? 0,
    drivers: driversRes.count ?? 0,
    bookings: bookingsRes.count ?? 0,
    refunds: refundsRes.count ?? 0,
  };
}

export async function markAdminSectionSeen(section: AdminNotifySection) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("admin_section_seen").upsert(
    {
      admin_user_id: user.id,
      section,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "admin_user_id,section" },
  );
}

export function pathToSection(pathname: string): AdminNotifySection | null {
  for (const [section, path] of Object.entries(SECTION_TO_PATH)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return section as AdminNotifySection;
    }
  }
  return null;
}
