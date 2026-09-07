import { RiskLevel } from "@/types/analysis";
import { riskStyles } from "@/lib/risk-styles";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, Siren } from "lucide-react";

const icons: Record<RiskLevel, React.ComponentType<{ className?: string }>> = {
  safe: ShieldCheck,
  medium: ShieldAlert,
  high: ShieldX,
  critical: Siren,
};

export function RiskBadge({
  level,
  size = "md",
  className,
}: {
  level: RiskLevel;
  size?: "sm" | "md";
  className?: string;
}) {
  const style = riskStyles[level];
  const Icon = icons[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5",
        className
      )}
      style={{
        color: style.color,
        backgroundColor: style.soft,
      }}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {style.label}
    </span>
  );
}
