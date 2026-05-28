import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  BookOpen,
  Building2,
  Car,
  LayoutDashboard,
  RefreshCcw,
  Route as RouteIcon,
  ShieldCheck,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { PanelShell, type NavItem } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";
import {
  fetchAdminBadgeCounts,
  markAdminSectionSeen,
  pathToSection,
  type AdminNotifySection,
} from "@/lib/admin-notifications";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — WayGo" },
      { name: "description", content: "WayGo administration panel." },
    ],
  }),
  component: AdminLayout,
});

const BASE_NAV: Omit<NavItem, "badge">[] = [
  { to: "/admin", label: "Analytics", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/drivers", label: "Drivers", icon: ShieldCheck },
  { to: "/admin/vendors", label: "Vendors", icon: Building2 },
  { to: "/admin/routes", label: "Routes", icon: RouteIcon },
  { to: "/admin/taxis", label: "Taxi", icon: Car },
  { to: "/admin/shared-taxi", label: "Shared Taxi", icon: UsersRound },
  { to: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { to: "/admin/revenue", label: "Revenue", icon: TrendingUp },
  { to: "/admin/coupons", label: "Coupons", icon: BadgePercent },
  { to: "/admin/refunds", label: "Refunds", icon: RefreshCcw },
];

const BADGE_SECTIONS: Partial<Record<string, AdminNotifySection>> = {
  "/admin/users": "users",
  "/admin/drivers": "drivers",
  "/admin/vendors": "vendors",
  "/admin/bookings": "bookings",
  "/admin/refunds": "refunds",
};

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [badges, setBadges] = useState<Record<AdminNotifySection, number>>({
    vendors: 0,
    users: 0,
    drivers: 0,
    bookings: 0,
    refunds: 0,
  });

  const nav = useMemo(
    () =>
      BASE_NAV.map((item) => {
        const section = BADGE_SECTIONS[item.to];
        return section ? { ...item, badge: badges[section] } : item;
      }),
    [badges],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchAdminBadgeCounts().then((counts) => {
      if (!cancelled) setBadges(counts);
    });
    const interval = setInterval(() => {
      void fetchAdminBadgeCounts().then((counts) => {
        if (!cancelled) setBadges(counts);
      });
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const section = pathToSection(pathname);
    if (!section) return;
    void markAdminSectionSeen(section).then(() => {
      setBadges((prev) => ({ ...prev, [section]: 0 }));
    });
  }, [pathname]);

  return (
    <RoleGuard allow={["admin"]}>
      <PanelShell title="Admin" subtitle="Operations" nav={nav} layout="topbar">
        <Outlet />
      </PanelShell>
    </RoleGuard>
  );
}
