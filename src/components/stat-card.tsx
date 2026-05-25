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
    tone === "success" ? "text-success" : tone === "warning" ? "text-amber-600" : "text-primary";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
          {trend && <p className={`mt-1 text-xs font-medium ${toneClass}`}>{trend}</p>}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ${toneClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
