import { RiskLevel } from "@/types/analysis";

export const riskStyles: Record<
  RiskLevel,
  { label: string; color: string; soft: string; ring: string }
> = {
  safe: {
    label: "Safe",
    color: "var(--risk-safe)",
    soft: "var(--risk-safe-soft)",
    ring: "ring-risk-safe/40",
  },
  medium: {
    label: "Medium Risk",
    color: "var(--risk-medium)",
    soft: "var(--risk-medium-soft)",
    ring: "ring-risk-medium/40",
  },
  high: {
    label: "High Risk",
    color: "var(--risk-high)",
    soft: "var(--risk-high-soft)",
    ring: "ring-risk-high/40",
  },
  critical: {
    label: "Critical Risk",
    color: "var(--risk-critical)",
    soft: "var(--risk-critical-soft)",
    ring: "ring-risk-critical/40",
  },
};
