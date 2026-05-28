import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { EmptyRows } from "@/lib/admin-live";
import { shortId } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Role = Database["public"]["Tables"]["user_roles"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      setLoading(true);
      const [profilesResult, rolesResult, bookingsResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("bookings").select("*"),
      ]);
      if (!mounted) return;
      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (bookingsResult.error) throw bookingsResult.error;
      setProfiles(profilesResult.data ?? []);
      setRoles(rolesResult.data ?? []);
      setBookings(bookingsResult.data ?? []);
      setLoading(false);
    }
    loadUsers().catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const tripCounts = bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.user_id] = (acc[booking.user_id] ?? 0) + 1;
      return acc;
    }, {});
    const rolesByUser = roles.reduce<Record<string, string[]>>((acc, role) => {
      acc[role.user_id] = [...(acc[role.user_id] ?? []), role.role];
      return acc;
    }, {});
    const q = query.trim().toLowerCase();

    return profiles
      .map((profile) => ({
        ...profile,
        trips: tripCounts[profile.user_id] ?? 0,
        roles: rolesByUser[profile.user_id] ?? ["customer"],
      }))
      .filter((profile) => {
        if (!q) return true;
        return [profile.full_name, profile.email, profile.user_id].some((value) =>
          (value ?? "").toLowerCase().includes(q),
        );
      });
  }, [bookings, profiles, query, roles]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
          <p className="text-sm text-muted-foreground">Live rider accounts from Supabase.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Trips</th>
                <th className="px-5 py-3">Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <EmptyRows colSpan={5} message="Loading users..." />
              ) : rows.length ? (
                rows.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{shortId(u.user_id, "U")}</td>
                    <td className="px-5 py-3 font-medium">{u.full_name || "Unnamed user"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email || "No email"}</td>
                    <td className="px-5 py-3 tabular-nums">{u.trips}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((role) => (
                          <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRows colSpan={5} message="No users found." />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
