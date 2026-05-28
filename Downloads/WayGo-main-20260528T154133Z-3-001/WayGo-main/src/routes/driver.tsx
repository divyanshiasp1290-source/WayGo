import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Car, Coins, LayoutDashboard, ListChecks } from "lucide-react";
import { PanelShell } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver — WayGo" },
      { name: "description", content: "Driver dashboard for WayGo partners." },
    ],
  }),
  component: DriverLayout,
});

const NAV = [
  { to: "/driver", label: "Dashboard", icon: LayoutDashboard },
  { to: "/driver/requests", label: "Ride requests", icon: ListChecks },
  { to: "/driver/earnings", label: "Earnings", icon: Coins },
  { to: "/driver/vehicles", label: "My vehicles", icon: Car },
];

function DriverLayout() {
  return (
    <RoleGuard allow={["driver", "admin"]}>
      <PanelShell title="Driver" subtitle="Partner panel" nav={NAV}>
        <Outlet />
      </PanelShell>
    </RoleGuard>
  );
}
