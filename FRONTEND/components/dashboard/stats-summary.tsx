import { DashboardSummary } from "@/types/analysis";
import { ScanLine, ShieldAlert, ShieldCheck } from "lucide-react";

export function StatsSummary({ summary }: { summary: DashboardSummary }) {
  const stats = [
    {
      label: "Total analyses",
      value: summary.totalAnalyses,
      Icon: ScanLine,
      color: "var(--accent)",
    },
    {
      label: "High-risk found",
      value: summary.highRiskCount,
      Icon: ShieldAlert,
      color: "var(--risk-high)",
    },
    {
      label: "Marked safe",
      value: summary.safeCount,
      Icon: ShieldCheck,
      color: "var(--risk-safe)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, Icon, color }) => (
        <div key={label} className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{label}</span>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold text-ink">{value}</div>
        </div>
      ))}
    </div>
  );
}
