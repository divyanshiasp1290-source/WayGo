import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  tone?: "default" | "success" | "warning";
}

export function StatCard({ label, value, icon: Icon, trend, tone = "default" }: Props) {
  const toneClass =
    tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-[#008cff]";
  return (
    <Card className="p-5 hover:-translate-y-1 hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
          {trend && <p className={`mt-1 text-xs font-semibold ${toneClass}`}>{trend}</p>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f2ff] ${toneClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
