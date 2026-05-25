import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bus, Car, Coins, LayoutDashboard, Route as RouteIcon, UsersRound } from "lucide-react";
import { PanelShell } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";
import { VendorApprovalGuard } from "@/components/vendor-approval-guard";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor — WayGo" },
      { name: "description", content: "Vendor panel for fleet operators on WayGo." },
    ],
  }),
  component: VendorLayout,
});

const NAV = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/buses", label: "Buses", icon: Bus },
  { to: "/vendor/taxis", label: "Taxis", icon: Car },
  { to: "/vendor/routes", label: "Routes", icon: RouteIcon },
  { to: "/vendor/drivers", label: "Drivers", icon: UsersRound },
  { to: "/vendor/earnings", label: "Earnings", icon: Coins },
];

function VendorLayout() {
  return (
    <RoleGuard allow={["vendor", "admin"]} loginTo="/vendor/login">
      <VendorApprovalGuard>
        <PanelShell title="Vendor" subtitle="Fleet panel" nav={NAV}>
          <Outlet />
        </PanelShell>
      </VendorApprovalGuard>
    </RoleGuard>
  );
}
