import { RiskLevel } from "@/types/analysis";
import { riskStyles } from "@/lib/risk-styles";
import { ShieldCheck } from "lucide-react";

export function RecommendationCard({
  recommendations,
  level,
}: {
  recommendations: string[];
  level: RiskLevel;
}) {
  const style = riskStyles[level];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <ShieldCheck className="h-4 w-4" style={{ color: style.color }} />
        Recommended action
      </div>
      <div
        className="rounded-md border p-4"
        style={{ borderColor: style.color + "40", backgroundColor: style.soft }}
      >
        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="text-sm text-ink-dim">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
