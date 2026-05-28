import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: ReactNode;
  layout?: "sidebar" | "topbar";
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
        active
          ? "bg-gradient-primary text-primary-foreground shadow-glow"
          : "text-slate-600 hover:bg-[#e8f2ff] hover:text-slate-900",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

export function PanelShell({ title, subtitle, nav, children, layout = "sidebar" }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (layout === "topbar") {
    return (
      <div className="travel-shell">
        <div className="sticky top-16 z-40 border-b border-slate-200/70 bg-white/88 backdrop-blur supports-[backdrop-filter]:bg-white/78">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {subtitle ?? "Panel"}
                </p>
                <h2 className="text-base font-bold">{title}</h2>
              </div>
              <nav className="flex flex-wrap gap-1">
                {nav.map((item) => {
                  const active = pathname === item.to;
                  return <NavLink key={item.to} item={item} active={active} />;
                })}
              </nav>
            </div>
          </div>
        </div>
        <main className="container mx-auto min-w-0 px-4 py-6 pb-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="travel-shell">
      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <div className="travel-surface p-4">
            <div className="mb-4 px-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {subtitle ?? "Panel"}
              </p>
              <h2 className="text-base font-bold">{title}</h2>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.to;
                return <NavLink key={item.to} item={item} active={active} />;
              })}
            </nav>
          </div>
        </aside>
        <main className="min-w-0 pb-12">{children}</main>
      </div>
    </div>
  );
}
